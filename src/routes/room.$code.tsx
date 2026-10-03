import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  submitWord as submitWordFn,
  submitGuess as submitGuessFn,
  restartRoom as restartRoomFn,
  getRevealedWords,
  getRoomState,
} from "@/lib/room.functions";

import {
  MAX_GUESSES,
  WORD_LEN,
  getPlayerId,
  isTurkishWord,
  isValidWord,
  letters,
  parseResult,
  trUpper,
  type LetterResult,
} from "@/lib/game";

export const Route = createFileRoute("/room/$code")({
  component: RoomPage,
});

type Room = {
  id: string;
  code: string;
  status: string;
  player1_id: string | null;
  player2_id: string | null;
  player1_name: string | null;
  player2_name: string | null;
  player1_word_set: boolean;
  player2_word_set: boolean;
  turn: number;
  winner: string | null;
};

type Guess = {
  id: string;
  room_id: string;
  player_num: number;
  guess: string;
  result: string;
  created_at: string;
};

function RoomPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const pid = typeof window !== "undefined" ? getPlayerId() : "";
  const fetchState = useServerFn(getRoomState);

  const [room, setRoom] = useState<Room | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const res = await fetchState({ data: { code, playerId: pid || undefined } });
        if (!mounted) return;
        if (!res.room) {
          setNotFound(true);
          return;
        }
        setRoom(res.room as Room);
        setGuesses(res.guesses as Guess[]);
      } catch {
        // transient error — will retry
      } finally {
        if (mounted) timer = setTimeout(tick, 1500);
      }
    }
    void tick();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [code, pid, fetchState]);


  const meNum: 1 | 2 | 0 = useMemo(() => {
    if (!room) return 0;
    if (room.player1_id === pid) return 1;
    if (room.player2_id === pid) return 2;
    return 0;
  }, [room, pid]);

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="card-soft p-8 text-center">
          <h1 className="text-xl font-bold">Oda bulunamadı</h1>
          <Link to="/" className="mt-4 inline-block text-primary underline">Ana sayfaya dön</Link>
        </div>
      </main>
    );
  }
  if (!room) {
    return <main className="min-h-screen flex items-center justify-center">Yükleniyor…</main>;
  }

  if (meNum === 0 && room.player1_id && room.player2_id) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="card-soft p-8 text-center max-w-sm">
          <h1 className="text-xl font-bold">Bu oda dolu</h1>
          <p className="text-sm text-muted-foreground mt-2">Başka bir oda kurabilirsin.</p>
          <Link to="/" className="mt-5 inline-block text-primary underline">Ana sayfa</Link>
        </div>
      </main>
    );
  }

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${code}` : "";
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <main className="min-h-screen px-4 py-8 pt-20 sm:pt-24">
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Çık</Link>
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Oda Kodu</div>
          <button onClick={copyCode} className="font-bold text-lg tracking-[0.3em] text-primary">
            {code} {copied ? "✓" : "⧉"}
          </button>
        </div>
        <div className="w-10" />
      </header>

      {room.status === "waiting" && <WaitingView room={room} shareUrl={shareUrl} meNum={meNum} />}
      {room.status === "setting" && <SettingView room={room} meNum={meNum} pid={pid} />}
      {(room.status === "playing" || room.status === "finished") && (
        <PlayView room={room} guesses={guesses} meNum={meNum} pid={pid} onExit={() => navigate({ to: "/" })} />
      )}
    </main>
  );
}

function WaitingView({ room, shareUrl, meNum }: { room: Room; shareUrl: string; meNum: 0 | 1 | 2 }) {
  return (
    <div className="max-w-md mx-auto card-soft p-8 text-center animate-fade-in">
      <div className="text-4xl">{"\n"}</div>
      <h2 className="mt-2 text-2xl font-bold">Rakip bekleniyor…</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Bu kodu ya da bağlantıyı rakibine gönder.
      </p>
      <div className="mt-4 p-3 rounded-lg bg-secondary text-sm break-all">{shareUrl}</div>
      <p className="text-xs text-muted-foreground mt-4">
        {meNum === 1 ? `${room.player1_name} olarak bekliyorsun.` : "Odaya bağlandın."}
      </p>
    </div>
  );
}

function SettingView({ room, meNum, pid }: { room: Room; meNum: 0 | 1 | 2; pid: string }) {
  const [word, setWord] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submitWord = useServerFn(submitWordFn);

  const mySubmitted = meNum === 1 ? room.player1_word_set : meNum === 2 ? room.player2_word_set : false;
  const theirSubmitted = meNum === 1 ? room.player2_word_set : meNum === 2 ? room.player1_word_set : false;

  async function submit() {
    setErr(null);
    const w = trUpper(word.trim());
    if (!isValidWord(w)) return setErr("5 harfli Türkçe bir kelime gir.");
    if (!(await isTurkishWord(w))) return setErr("Bu kelime Türkçe sözlükte yok.");
    if (meNum === 0) return setErr("Bu odada oyuncu değilsin.");
    setSaving(true);
    try {
      await submitWord({ data: { roomId: room.id, playerId: pid, word: w } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card-soft p-8 animate-fade-in">
      <div className="text-center mb-6">
        <div className="text-4xl">🤫</div>
        <h2 className="mt-2 text-2xl font-bold">Gizli Kelime</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Rakibinin tahmin etmesi için 5 harfli Türkçe bir kelime seç.
        </p>
      </div>

      {mySubmitted ? (
        <div className="text-center py-6">
          <div className="text-3xl">🔒</div>
          <p className="mt-3 font-medium">Kelimen kilitlendi.</p>
          <p className="text-sm text-muted-foreground mt-1">
            {theirSubmitted ? "Düello başlıyor…" : "Rakibin kelimeyi seçiyor…"}
          </p>
        </div>
      ) : (
        <>
          <input
            autoFocus
            value={word}
            onChange={(e) => setWord(trUpper(e.target.value))}
            maxLength={WORD_LEN}
            className="w-full h-14 px-4 rounded-xl bg-input text-center font-display font-bold text-2xl tracking-[0.4em] uppercase outline-none focus:ring-2 focus:ring-ring"
            placeholder="•••••"
          />
          <button
            onClick={submit}
            disabled={saving}
            className="mt-4 w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            Kelimeyi Kilitle
          </button>
          {err && <p className="mt-3 text-sm text-destructive text-center">{err}</p>}
          <p className="text-xs text-muted-foreground text-center mt-3">
            İki oyuncu da onayladığında düello başlar{"\u00a0"}
          </p>
        </>
      )}

      <div className="mt-6 flex justify-between text-xs text-muted-foreground">
        <span>{room.player1_name ?? "Oyuncu 1"}{"\u00a0"}</span>
        <span>{room.player2_name ?? "Oyuncu 2"}{"\u00a0"}</span>
      </div>
    </div>
  );
}

function PlayView({
  room, guesses, meNum, pid, onExit,
}: { room: Room; guesses: Guess[]; meNum: 0 | 1 | 2; pid: string; onExit: () => void }) {
  const myGuesses = guesses.filter((g) => g.player_num === meNum);
  const oppGuesses = guesses.filter((g) => g.player_num !== meNum);
  const submitGuess = useServerFn(submitGuessFn);

  const isMyTurn = room.status === "playing" && room.turn === meNum;
  const finished = room.status === "finished";

  const [current, setCurrent] = useState("");
  const [flipRow, setFlipRow] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isMyTurn) setCurrent("");
  }, [isMyTurn]);

  const [guessErr, setGuessErr] = useState<string | null>(null);
  const submit = useCallback(async () => {
    if (meNum === 0) return;
    const guess = trUpper(current);
    if (!isValidWord(guess)) return;
    if (!(await isTurkishWord(guess))) {
      setGuessErr("Bu kelime Türkçe sözlükte yok.");
      return;
    }
    setGuessErr(null);
    setSubmitting(true);
    try {
      await submitGuess({ data: { roomId: room.id, playerId: pid, guess } });
      setFlipRow(myGuesses.length);
      setCurrent("");
    } catch (e) {
      setGuessErr(e instanceof Error ? e.message : "Gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }, [current, meNum, room.id, pid, submitGuess, myGuesses.length]);

  const onKey = useCallback((k: string) => {
    if (!isMyTurn || submitting || finished) return;
    if (k === "ENTER") { void submit(); return; }
    if (k === "BACK") { setCurrent((c) => letters(c).slice(0, -1).join("")); return; }
    setCurrent((c) => {
      const ls = letters(c);
      if (ls.length >= WORD_LEN) return c;
      return (c + k);
    });
  }, [isMyTurn, submitting, finished, submit]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Enter") onKey("ENTER");
      else if (e.key === "Backspace") onKey("BACK");
      else if (e.key.length === 1) {
        const up = trUpper(e.key);
        if (up.length === 1 && /[A-ZÇĞİÖŞÜ]/.test(up)) onKey(up);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKey]);

  const keyState = useMemo(() => {
    const state: Record<string, LetterResult> = {};
    for (const g of myGuesses) {
      const r = parseResult(g.result);
      const ls = letters(g.guess);
      ls.forEach((ch, i) => {
        const prev = state[ch];
        const cur = r[i];
        if (prev === "correct") return;
        if (prev === "present" && cur === "absent") return;
        state[ch] = cur;
      });
    }
    return state;
  }, [myGuesses]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-4">
        <StatusBanner room={room} meNum={meNum} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Board
          title={`Senin tahminlerin (Rakibin kelimesi)`}
          rows={myGuesses}
          current={isMyTurn ? current : ""}
          maxRows={MAX_GUESSES}
          flipRow={flipRow}
          highlight
        />
        <Board
          title={`${meNum === 1 ? room.player2_name ?? "Rakip" : room.player1_name ?? "Rakip"}'in tahminleri`}
          rows={oppGuesses}
          current=""
          maxRows={MAX_GUESSES}
          flipRow={null}
        />
      </div>

      {!finished && (
        <div className="mt-6">
          {guessErr && (
            <div className="mb-3 text-center text-sm text-destructive">{guessErr}</div>
          )}
          <Keyboard onKey={onKey} keyState={keyState} disabled={!isMyTurn || submitting} />
        </div>
      )}

      {finished && <EndCard room={room} meNum={meNum} pid={pid} onExit={onExit} />}
    </div>
  );
}

function StatusBanner({ room, meNum }: { room: Room; meNum: 0 | 1 | 2 }) {
  if (room.status === "finished") {
    if (room.winner === "draw") return <h2 className="text-2xl font-bold">Berabere 🤝</h2>;
    const winNum = Number(room.winner);
    const iWon = winNum === meNum;
    const name = winNum === 1 ? room.player1_name : room.player2_name;
    return <h2 className="text-2xl font-bold">{iWon ? "Kazandın 🏆" : `${name} kazandı\u00a0`}</h2>;
  }

  if (room.turn === meNum) return <h2 className="text-2xl font-bold text-primary animate-fade-in">Sıra sende ✨</h2>;
  const oppName = meNum === 1 ? room.player2_name : room.player1_name;
  return <h2 className="text-lg text-muted-foreground">{oppName ?? "Rakip"} tahmin ediyor…</h2>;
}

function Board({
  title, rows, current, maxRows, flipRow, highlight,
}: {
  title: string;
  rows: Guess[];
  current: string;
  maxRows: number;
  flipRow: number | null;
  highlight?: boolean;
}) {
  const gridRows = Array.from({ length: maxRows }, (_, i) => i);
  return (
    <section className={`card-soft p-5 ${highlight ? "ring-2 ring-primary/30" : ""}`}>
      <h3 className="text-sm font-semibold text-center mb-4 text-muted-foreground">{title}</h3>
      <div className="flex flex-col items-center gap-2">
        {gridRows.map((rIdx) => {
          const g = rows[rIdx];
          const chars = g ? letters(g.guess) : rIdx === rows.length ? letters(current) : [];
          const result = g ? parseResult(g.result) : null;
          return (
            <div key={rIdx} className="flex gap-2">
              {Array.from({ length: WORD_LEN }, (_, i) => {
                const ch = chars[i] ?? "";
                let cls = "tile";
                if (result) {
                  cls += ` tile-${result[i]} ${flipRow === rIdx ? "tile-flip" : ""}`;
                } else if (ch) {
                  cls += " tile-filled";
                }
                return (
                  <div
                    key={i}
                    className={cls}
                    style={result ? { animationDelay: `${i * 120}ms` } : undefined}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

const ROW1 = "ERTYUIOPĞÜ".split("");
const ROW2 = "ASDFGHJKLŞİ".split("");
const ROW3 = "ZCVBNMÖÇ".split("");

function Keyboard({
  onKey, keyState, disabled,
}: {
  onKey: (k: string) => void;
  keyState: Record<string, LetterResult>;
  disabled: boolean;
}) {
  function keyClass(k: string) {
    const s = keyState[k];
    return `key ${s ? `key-${s}` : ""} ${disabled ? "opacity-60" : ""}`;
  }
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-stretch gap-1.5 select-none px-1">
      <div className="flex gap-1 justify-center">
        {ROW1.map((k) => <button key={k} className={keyClass(k)} onClick={() => onKey(k)} disabled={disabled}>{k}</button>)}
      </div>
      <div className="flex gap-1 justify-center">
        {ROW2.map((k) => <button key={k} className={keyClass(k)} onClick={() => onKey(k)} disabled={disabled}>{k}</button>)}
      </div>
      <div className="flex gap-1 justify-center">
        <button className="key" style={{ flex: "1.6 1 0", minWidth: "3.25rem" }} onClick={() => onKey("ENTER")} disabled={disabled}>ENTER</button>
        {ROW3.map((k) => <button key={k} className={keyClass(k)} onClick={() => onKey(k)} disabled={disabled}>{k}</button>)}
        <button className="key" style={{ flex: "1.3 1 0", minWidth: "2.5rem" }} onClick={() => onKey("BACK")} disabled={disabled}>⌫</button>
      </div>
    </div>
  );
}


function EndCard({ room, meNum, pid, onExit }: { room: Room; meNum: 0 | 1 | 2; pid: string; onExit: () => void }) {
  const restart = useServerFn(restartRoomFn);
  const reveal = useServerFn(getRevealedWords);
  const [p1Word, setP1Word] = useState<string>("?????");
  const [p2Word, setP2Word] = useState<string>("?????");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await reveal({ data: { roomId: room.id } });
        if (!mounted) return;
        setP1Word(r.player1_word ?? "?????");
        setP2Word(r.player2_word ?? "?????");
      } catch {}
    })();
    return () => { mounted = false; };
  }, [room.id, reveal]);

  async function doRestart() {
    if (meNum === 0) return;
    try {
      await restart({ data: { roomId: room.id, playerId: pid } });
    } catch {}
  }

  return (
    <div className="mt-8 card-soft p-6 max-w-md mx-auto text-center animate-fade-in">
      <div className="text-3xl mb-2">
        {room.winner === "draw" ? "🤝" : Number(room.winner) === meNum ? "🏆" : "\n"}
      </div>

      <div className="text-sm text-muted-foreground">Gizli kelimeler açıklandı:</div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-xl bg-secondary">
          <div className="text-xs text-muted-foreground">{room.player1_name}</div>
          <div className="font-display font-bold tracking-[0.25em] text-lg">{p1Word}</div>
        </div>
        <div className="p-3 rounded-xl bg-secondary">
          <div className="text-xs text-muted-foreground">{room.player2_name}</div>
          <div className="font-display font-bold tracking-[0.25em] text-lg">{p2Word}</div>
        </div>
      </div>
      <div className="mt-5 flex gap-3 justify-center">
        <button onClick={doRestart} className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90">
          Yeniden Oyna
        </button>
        <button onClick={onExit} className="h-11 px-5 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:opacity-90">
          Çık
        </button>
      </div>
    </div>
  );
}
