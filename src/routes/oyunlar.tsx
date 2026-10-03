import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/oyunlar")({
  head: () => ({
    meta: [
      { title: "Oyunlar • Kelime Düellosu" },
      { name: "description", content: "Kelime Düellosu içindeki tüm oyun modlarını keşfet: tek kişilik ve iki kişilik Türkçe Wordle." },
      { property: "og:title", content: "Oyunlar • Kelime Düellosu" },
      { property: "og:description", content: "Tek kişilik ve iki kişilik Türkçe kelime oyunlarını keşfet." },
    ],
  }),
  component: OyunlarPage,
});

function OyunlarPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold">Oyunlar</h1>
      <p className="mt-3 text-muted-foreground">
        Zevkine göre bir mod seç ve tahmin savaşı başlasın.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/"
          className="card-soft p-6 hover:opacity-90 transition block"
        >
          <div className="text-2xl mb-2">🤝</div>
          <h2 className="text-xl font-semibold">İki Kişilik Düello</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Arkadaşınla bir oda kur, kodu paylaş ve sıra tabanlı Türkçe Wordle oyna.
          </p>
        </Link>

        <Link
          to="/solo"
          className="card-soft p-6 hover:opacity-90 transition block"
        >
          <div className="text-2xl mb-2">🎯</div>
          <h2 className="text-xl font-semibold">Tek Kişilik Mod</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sistemin seçtiği gizli 5 harfli Türkçe kelimeyi bul. Kolay, orta ve zor seviyeler.
          </p>
        </Link>
      </div>
    </main>
  );
}
