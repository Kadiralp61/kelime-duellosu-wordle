// src/routes/index.tsx
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createRoom, joinRoom } from "@/lib/room.functions";
import { getPlayerId, trUpper } from "@/lib/game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kelime Düellosu • İki Kişilik Wordle" },
      { name: "description", content: "Arkadaşlarınla sıra tabanlı Türkçe kelime düellosu. Bir oda kur, kodu paylaş ve tahmin savaşı başlasın." },
      { property: "og:title", content: "Kelime Düellosu • İki Kişilik Wordle" },
      { property: "og:description", content: "Arkadaşlarınla sıra tabanlı Türkçe kelime düellosu. Bir oda kur, kodu paylaş ve tahmin savaşı başlasın." },
    ],
  }),
  component: Lobby,
});

function Lobby() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const createRoomFn = useServerFn(createRoom);
  const joinRoomFn = useServerFn(joinRoom);

  // İsmi otomatik yükleme (Önce Profildeki 'user_name', yoksa 'wd_name')
  useEffect(() => {
    if (typeof window !== "undefined") {
      const profileName = localStorage.getItem("user_name");
      const savedWdName = localStorage.getItem("wd_name");
      
      if (profileName) {
        setName(profileName);
      } else if (savedWdName) {
        setName(savedWdName);
      }
    }
  }, []);

  function saveName(n: string) {
    setName(n);
    if (typeof window !== "undefined") {
      localStorage.setItem("wd_name", n);
      localStorage.setItem("user_name", n);
    }
  }

  async function createRoomAction() {
    if (!name.trim()) return setErr("Önce bir isim gir");
    setErr(null); setLoading(true);
    try {
      const pid = getPlayerId();
      const { code: c } = await createRoomFn({ data: { playerId: pid, name: name.trim() } });
      navigate({ to: "/room/$code", params: { code: c } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Oda oluşturulamadı");
    } finally {
      setLoading(false);
    }
  }

  async function joinRoomAction() {
    if (!name.trim()) return setErr("Önce bir isim gir");
    const c = trUpper(code.trim());
    if (c.length < 4) return setErr("Geçerli bir oda kodu gir.");
    setErr(null); setLoading(true);
    try {
      const pid = getPlayerId();
      const { code: joined } = await joinRoomFn({ data: { code: c, playerId: pid, name: name.trim() } });
      navigate({ to: "/room/$code", params: { code: joined } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Katılınamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card-soft p-8 animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Kelime Düellosu</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sıra Tabanlı Türkçe Wordle.
          </p>
        </div>

        <label className="text-sm font-medium">İsmin</label>

        <input
          value={name}
          onChange={(e) => saveName(e.target.value)}
          placeholder="ör. Ada"
          className="mt-1 w-full h-11 px-3 rounded-lg bg-input outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          onClick={createRoomAction}
          disabled={loading}
          className="mt-5 w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? "..." : "Yeni Oda Kur"}
        </button>

        <div className="flex items-center gap-3 my-5 text-muted-foreground text-xs">
          <div className="h-px flex-1 bg-border" /> ya da <div className="h-px flex-1 bg-border" />
        </div>

        <label className="text-sm font-medium">Oda Kodu</label>
        <div className="flex gap-2 mt-1">
          <input
            value={code}
            onChange={(e) => setCode(trUpper(e.target.value))}
            placeholder="ABCDE"
            maxLength={8}
            className="flex-1 h-11 px-3 rounded-lg bg-input outline-none focus:ring-2 focus:ring-ring tracking-widest font-semibold uppercase"
          />
          <button
            onClick={joinRoomAction}
            disabled={loading}
            className="h-11 px-5 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:opacity-90 transition"
          >
            Katıl
          </button>
        </div>

        {err && <p className="mt-4 text-sm text-destructive">{err}</p>}

        <div className="flex items-center gap-3 my-5 text-muted-foreground text-xs">
          <div className="h-px flex-1 bg-border" /> ya da <div className="h-px flex-1 bg-border" />
        </div>

        <Link
          to="/solo"
          className="block w-full h-12 rounded-xl bg-accent text-accent-foreground font-semibold hover:opacity-90 transition flex items-center justify-center mb-4"
        >
          Tek Kişilik Oyna 🎯
        </Link>

        <Link
          to="/daily"
          className="block w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:opacity-90 transition flex items-center justify-center shadow-lg gap-2"
        >
           Günlük Mod (Günün Kelimesi) 🔥
        </Link>
      </div>
    </main>
  );
}