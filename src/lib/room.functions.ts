import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { TablesUpdate } from "@/integrations/supabase/types";
import {
  MAX_GUESSES,
  WORD_LEN,
  evaluateGuess,
  isAllCorrect,
  isTurkishWord,
  isValidWord,
  serializeResult,
  trUpper,
} from "./game";

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function genCode(): string {
  let out = "";
  for (let i = 0; i < 5; i++)
    out += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  return out;
}

const playerIdSchema = z.string().uuid();
const nameSchema = z.string().trim().min(1).max(40);
const codeSchema = z.string().trim().min(4).max(12);
const roomIdSchema = z.string().uuid();
const wordSchema = z.string().trim();
const optionalPlayerIdSchema = playerIdSchema.optional();


async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const createRoom = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ playerId: playerIdSchema, name: nameSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    for (let attempt = 0; attempt < 6; attempt++) {
      const code = genCode();
      const { data: room, error } = await sb
        .from("rooms")
        .insert({
          code,
          status: "waiting",
          player1_id: data.playerId,
          player1_name: data.name,
        })
        .select("id, code")
        .maybeSingle();
      if (!error && room) {
        await sb.from("room_secrets").insert({ room_id: room.id });
        return { code: room.code };
      }
    }
    throw new Error("Oda oluşturulamadı");
  });

export const joinRoom = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ code: codeSchema, playerId: playerIdSchema, name: nameSchema })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    const code = trUpper(data.code);
    const { data: room } = await sb
      .from("rooms")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (!room) throw new Error("Oda bulunamadı");
    if (room.player1_id === data.playerId || room.player2_id === data.playerId) {
      return { code };
    }
    if (room.player2_id) throw new Error("Oda dolu");
    const { error } = await sb
      .from("rooms")
      .update({
        player2_id: data.playerId,
        player2_name: data.name,
        status: "setting",
        updated_at: new Date().toISOString(),
      })
      .eq("id", room.id)
      .is("player2_id", null);
    if (error) throw new Error("Katılınamadı");
    return { code };
  });

export const submitWord = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        roomId: roomIdSchema,
        playerId: playerIdSchema,
        word: wordSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const word = trUpper(data.word);
    if (!isValidWord(word)) throw new Error("Geçersiz kelime");
    if (!(await isTurkishWord(word)))
      throw new Error("Bu kelime Türkçe sözlükte yok");
    const sb = await admin();
    const { data: room } = await sb
      .from("rooms")
      .select("id, status, player1_id, player2_id, player1_word_set, player2_word_set")
      .eq("id", data.roomId)
      .maybeSingle();
    if (!room) throw new Error("Oda yok");
    if (room.status !== "setting" && room.status !== "waiting")
      throw new Error("Kelime seçim aşaması bitti");
    const meNum =
      room.player1_id === data.playerId
        ? 1
        : room.player2_id === data.playerId
        ? 2
        : 0;
    if (meNum === 0) throw new Error("Bu odada oyuncu değilsin");

    const secretPatch =
      meNum === 1 ? { player1_word: word } : { player2_word: word };
    const { error: secErr } = await sb
      .from("room_secrets")
      .upsert({ room_id: room.id, ...secretPatch, updated_at: new Date().toISOString() });
    if (secErr) throw new Error("Kaydedilemedi");

    const flagsPatch: TablesUpdate<"rooms"> = {
      updated_at: new Date().toISOString(),
    };
    if (meNum === 1) flagsPatch.player1_word_set = true;
    else flagsPatch.player2_word_set = true;
    const otherSet =
      meNum === 1 ? room.player2_word_set : room.player1_word_set;
    if (otherSet) {
      flagsPatch.status = "playing";
      flagsPatch.turn = 1;
    }
    await sb.from("rooms").update(flagsPatch).eq("id", room.id);
    return { ok: true };
  });

export const submitGuess = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        roomId: roomIdSchema,
        playerId: playerIdSchema,
        guess: wordSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const guess = trUpper(data.guess);
    if (!isValidWord(guess)) throw new Error("Geçersiz tahmin");
    if (!(await isTurkishWord(guess)))
      throw new Error("Bu kelime Türkçe sözlükte yok");
    const sb = await admin();

    const { data: room } = await sb
      .from("rooms")
      .select("id, status, player1_id, player2_id, turn")
      .eq("id", data.roomId)
      .maybeSingle();
    if (!room) throw new Error("Oda yok");
    if (room.status !== "playing") throw new Error("Oyun aktif değil");
    const meNum =
      room.player1_id === data.playerId
        ? 1
        : room.player2_id === data.playerId
        ? 2
        : 0;
    if (meNum === 0) throw new Error("Bu odada oyuncu değilsin");
    if (room.turn !== meNum) throw new Error("Sıra sende değil");

    const { data: sec } = await sb
      .from("room_secrets")
      .select("player1_word, player2_word")
      .eq("room_id", room.id)
      .maybeSingle();
    if (!sec) throw new Error("Kelimeler yok");
    const target = meNum === 1 ? sec.player2_word : sec.player1_word;
    if (!target) throw new Error("Rakip kelimeyi seçmedi");

    // Count existing guesses per player
    const { data: allGuesses } = await sb
      .from("guesses")
      .select("player_num")
      .eq("room_id", room.id);
    const myCount = (allGuesses ?? []).filter((g) => g.player_num === meNum).length;
    const oppNum = meNum === 1 ? 2 : 1;
    const oppCount = (allGuesses ?? []).filter((g) => g.player_num === oppNum).length;
    if (myCount >= MAX_GUESSES) throw new Error("Hakkın kalmadı");
    if (guess.length !== WORD_LEN * 1) {
      // sanity
    }

    const result = evaluateGuess(guess, target);
    const won = isAllCorrect(result);

    const { error: insErr } = await sb.from("guesses").insert({
      room_id: room.id,
      player_num: meNum,
      guess,
      result: serializeResult(result),
    });
    if (insErr) throw new Error("Tahmin kaydedilemedi");

    const patch: TablesUpdate<"rooms"> = { updated_at: new Date().toISOString() };
    const myCountAfter = myCount + 1;
    if (won) {
      patch.status = "finished";
      patch.winner = String(meNum);
    } else if (myCountAfter >= MAX_GUESSES && oppCount >= MAX_GUESSES) {
      patch.status = "finished";
      patch.winner = "draw";
    } else if (oppCount < MAX_GUESSES) {
      patch.turn = oppNum;
    }
    await sb.from("rooms").update(patch).eq("id", room.id);
    return { ok: true };
  });

export const restartRoom = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ roomId: roomIdSchema, playerId: playerIdSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: room } = await sb
      .from("rooms")
      .select("id, player1_id, player2_id, status")
      .eq("id", data.roomId)
      .maybeSingle();
    if (!room) throw new Error("Oda yok");
    if (room.player1_id !== data.playerId && room.player2_id !== data.playerId)
      throw new Error("Bu odada oyuncu değilsin");
    if (room.status !== "finished") throw new Error("Oyun bitmedi");

    await sb.from("guesses").delete().eq("room_id", room.id);
    await sb
      .from("room_secrets")
      .update({ player1_word: null, player2_word: null, updated_at: new Date().toISOString() })
      .eq("room_id", room.id);
    await sb
      .from("rooms")
      .update({
        status: "setting",
        player1_word_set: false,
        player2_word_set: false,
        turn: 1,
        winner: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", room.id);
    return { ok: true };
  });

// Reveal the secret words — only when the game is finished.
export const getRevealedWords = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ roomId: roomIdSchema }).parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: room } = await sb
      .from("rooms")
      .select("status")
      .eq("id", data.roomId)
      .maybeSingle();
    if (!room || room.status !== "finished") {
      return { player1_word: null, player2_word: null };
    }
    const { data: sec } = await sb
      .from("room_secrets")
      .select("player1_word, player2_word")
      .eq("room_id", data.roomId)
      .maybeSingle();
    return {
      player1_word: sec?.player1_word ?? null,
      player2_word: sec?.player2_word ?? null,
    };
  });

// Fetch the current room + guesses for a given code. Only members of the room
// receive full player details and guess history; a non-member requesting a full
// room gets a minimal "full" marker so they can render the "room is full" screen.
// This replaces direct client SELECTs against `rooms`/`guesses`.
export const getRoomState = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ code: codeSchema, playerId: optionalPlayerIdSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    const code = trUpper(data.code);
    const { data: room } = await sb
      .from("rooms")
      .select(
        "id, code, status, player1_id, player2_id, player1_name, player2_name, player1_word_set, player2_word_set, turn, winner",
      )
      .eq("code", code)
      .maybeSingle();
    if (!room) return { room: null, guesses: [], full: false };

    const isMember =
      !!data.playerId &&
      (room.player1_id === data.playerId || room.player2_id === data.playerId);
    const openForJoin = !room.player2_id;

    if (!isMember && !openForJoin) {
      // Non-member asking about a full room: reveal only that it's full.
      return {
        room: {
          id: room.id,
          code: room.code,
          status: room.status,
          player1_id: room.player1_id,
          player2_id: room.player2_id,
          player1_name: null,
          player2_name: null,
          player1_word_set: room.player1_word_set,
          player2_word_set: room.player2_word_set,
          turn: room.turn,
          winner: room.winner,
        },
        guesses: [],
        full: true,
      };
    }

    if (!isMember) {
      // Waiting room joiner: don't expose guesses.
      return { room, guesses: [], full: false };
    }

    const { data: gs } = await sb
      .from("guesses")
      .select("id, room_id, player_num, guess, result, created_at")
      .eq("room_id", room.id)
      .order("created_at", { ascending: true });
    return { room, guesses: gs ?? [], full: false };
  });

