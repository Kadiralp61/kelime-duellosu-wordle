import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  evaluateGuess,
  isAllCorrect,
  letters,
  trUpper,
  TR_LETTERS,
  type LetterResult,
} from "@/lib/game";
import { pickWord, type Difficulty, type WordLength } from "@/lib/solo-words";

const SOLO_MAX_GUESSES = 6;

export const Route = createFileRoute("/solo")({
  head: () => ({
    meta: [
      { title: "Tek Kişilik Mod • Kelime Düellosu" },
      { name: "description", content: "Sistemin seçtiği gizli Türkçe kelimeyi bul. 5, 6 veya 7 harfli kelimelerle tek başına oyna." },
      { property: "og:title", content: "Tek Kişilik Mod • Kelime Düellosu" },
      { property: "og:description", content: "Sistemin seçtiği gizli Türkçe kelimeyi bul. 5, 6 veya 7 harfli kelimelerle tek başına oyna." },
    ],
  }),
  component: SoloPage,
});

type Row = { guess: string; result: LetterResult[] };

function SoloPage() {
  const [length, setLength] = useState<WordLength | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("orta");
  const [target, setTarget] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [flipRow, setFlipRow] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function startGame(len: WordLength, d: Difficulty, exclude?: string) {
    const word = pickWord(len, d, exclude);

    // Geliştirme aşamasında hedef kelime uzunluğunun seçilen moda uyduğunu
    // doğrulayan bir güvenlik kontrolü. Beklenmedik bir uyuşmazlık olursa
    // (ör. eski/önbelleklenmiş bir bundle çalışıyorsa) burada hemen fark edilir.
    if (letters(word).length !== len) {
      console.error(
        `[solo] pickWord(${len}) uzunluğu yanlış kelime döndürdü:`,
        word,
        letters(word).length,
      );
    }

    setLength(len);
    setDifficulty(d);
    setTarget(word);
    setRows([]);
    setCurrent("");
    setStatus("playing");
    setFlipRow(null);
    setErr(null);
  }

  const wordLen = length ?? 5;

  const isValidShape = useCallback((w: string) => {
    const ls = letters(w);
    if (ls.length !== wordLen) return false;
    return ls.every((c) => TR_LETTERS.includes(c));
  }, [wordLen]);

  const submit = useCallback(() => {
    if (status !== "playing" || !target) return;
    const g = trUpper(current);
    if (!isValidShape(g)) { setErr(`${wordLen} harfli Türkçe bir kelime gir.`); return; }
    setErr(null);

    // Tek doğrulama kaynağı: game.ts'teki evaluateGuess, target'ın gerçek
    // uzunluğuna (5, 6 veya 7) göre otomatik olarak dinamik çalışır.
    const result = evaluateGuess(g, target);

    const next = [...rows, { guess: g, result }];
    setRows(next);
    setFlipRow(next.length - 1);
    setCurrent("");
    if (isAllCorrect(result)) setStatus("won");
    else if (next.length >= SOLO_MAX_GUESSES) setStatus("lost");
  }, [current, rows, status, target, isValidShape, wordLen]);

  const onKey = useCallback((k: string) => {
    if (status !== "playing") return;
    if (k === "ENTER") { submit(); return; }
    if (k === "BACK") { setCurrent((c) => letters(c).slice(0, -1).join("")); return; }
    setCurrent((c) => {
      const ls = letters(c);
      if (ls.length >= wordLen) return c;
      return c + k;
    });
  }, [status, submit, wordLen]);

  useEffect(() => {
    if (!length) return;
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
  }, [onKey, length]);

  const keyState = useMemo(() => {
    const state: Record<string, LetterResult> = {};
    for (const row of rows) {
      const ls = letters(row.guess);
      ls.forEach((ch, i) => {
        const prev = state[ch];
        const cur = row.result[i];
        if (prev === "correct") return;
        if (prev === "present" && cur === "absent") return;
        state[ch] = cur;
      });
    }
    return state;
  }, [rows]);

  if (!length) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-10 pt-20">
        <div className="w-full max-w-md card-soft p-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold">Tek Kişilik Mod</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Kelime uzunluğunu ve zorluğu seç. 6 hakkın olacak.
          </p>

          <div className="mt-6 text-left">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Harf sayısı</div>
            <div className="grid grid-cols-3 gap-2">
              {([5, 6, 7] as WordLength[]).map((l) => (
                <button
                  key={l}
                  onClick={() => startGame(l, difficulty)}
                  className="h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                >
                  {l} harf
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 text-left">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Zorluk
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["kolay", "orta", "zor"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`h-11 rounded-lg font-semibold capitalize transition ${
                    difficulty === d
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground hover:opacity-90"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Link to="/" className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground">
            ← Ana sayfaya dön
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 pt-20 sm:pt-24">
      <header className="max-w-2xl mx-auto flex items-center justify-between mb-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Çık</Link>
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Mod</div>
          <div className="font-bold text-lg text-primary">
            {length} harf • {difficulty}
          </div>
        </div>
        <button
          onClick={() => startGame(length, difficulty, target)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Yeni ↻
        </button>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          {status === "playing" && (
            <h2 className="text-lg text-muted-foreground">
              {SOLO_MAX_GUESSES - rows.length} hakkın kaldı
            </h2>
          )}
          {status === "won" && <h2 className="text-2xl font-bold text-primary">Buldun 🏆</h2>}
          {status === "lost" && (
            <h2 className="text-2xl font-bold">
              Kelime: <span className="text-primary tracking-widest">{target}</span>
            </h2>
          )}
        </div>

        <section className="card-soft p-5">
          <div className="flex flex-col items-center gap-2">
            {Array.from({ length: SOLO_MAX_GUESSES }, (_, rIdx) => {
              const row = rows[rIdx];
              const chars = row
                ? letters(row.guess)
                : rIdx === rows.length
                ? letters(current)
                : [];
              return (
                <div key={rIdx} className="flex gap-2">
                  {Array.from({ length: wordLen }, (_, i) => {
                    const ch = chars[i] ?? "";
                    let cls = "tile";
                    let inlineStyle: React.CSSProperties | undefined = undefined;

                    if (row) {
                      const resType = row.result[i]; // "correct" | "present" | "absent"
                      cls += ` tile-${resType} ${flipRow === rIdx ? "tile-flip" : ""}`;

                      // CSS/Animasyon takılmasına karşı rengi doğrudan garantiye alıyoruz:
                      if (resType === "correct") {
                        inlineStyle = { backgroundColor: "#22c55e", color: "#ffffff", borderColor: "#22c55e" }; // Yeşil
                      } else if (resType === "present") {
                        inlineStyle = { backgroundColor: "#eab308", color: "#ffffff", borderColor: "#eab308" }; // Sarı
                      } else {
                        inlineStyle = { backgroundColor: "#3f3f46", color: "#ffffff", borderColor: "#3f3f46" }; // Koyu Kül / Absent
                      }

                      inlineStyle.animationDelay = `${i * 120}ms`;
                    } else if (ch) {
                      cls += " tile-filled";
                    }

                    return (
                      <div
                        key={i}
                        className={cls}
                        style={inlineStyle}
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

        {err && <p className="mt-3 text-sm text-destructive text-center">{err}</p>}

        {status === "playing" ? (
          <div className="mt-6">
            <Keyboard onKey={onKey} keyState={keyState} />
          </div>
        ) : (
          <div className="mt-8 card-soft p-6 text-center animate-fade-in">
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => startGame(length, difficulty, target)}
                className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
              >
                Tekrar oyna
              </button>
              <button
                onClick={() => setLength(null)}
                className="h-11 px-5 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition"
              >
                Mod değiştir
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const ROW1 = "ERTYUIOPĞÜ".split("");
const ROW2 = "ASDFGHJKLŞİ".split("");
const ROW3 = "ZCVBNMÖÇ".split("");

function Keyboard({
  onKey, keyState,
}: {
  onKey: (k: string) => void;
  keyState: Record<string, LetterResult>;
}) {
  function keyClass(k: string) {
    const s = keyState[k];
    return `key ${s ? `key-${s}` : ""}`;
  }
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-stretch gap-1.5 select-none px-1">
      <div className="flex gap-1 justify-center">
        {ROW1.map((k) => <button key={k} className={keyClass(k)} onClick={() => onKey(k)}>{k}</button>)}
      </div>
      <div className="flex gap-1 justify-center">
        {ROW2.map((k) => <button key={k} className={keyClass(k)} onClick={() => onKey(k)}>{k}</button>)}
      </div>
      <div className="flex gap-1 justify-center">
        <button className="key" style={{ flex: "1.6 1 0", minWidth: "3.25rem" }} onClick={() => onKey("ENTER")}>ENTER</button>
        {ROW3.map((k) => <button key={k} className={keyClass(k)} onClick={() => onKey(k)}>{k}</button>)}
        <button className="key" style={{ flex: "1.3 1 0", minWidth: "2.5rem" }} onClick={() => onKey("BACK")}>⌫</button>
      </div>
    </div>
  );
}
