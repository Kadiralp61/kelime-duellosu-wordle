import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/nasil-oynanir")({
  head: () => ({
    meta: [
      { title: "Nasıl Oynanır • Kelime Düellosu" },
      { name: "description", content: "Kelime Düellosu kuralları ve ipuçları. Türkçe Wordle'da yeşil, sarı ve gri harflerin anlamı." },
      { property: "og:title", content: "Nasıl Oynanır • Kelime Düellosu" },
      { property: "og:description", content: "Kelime Düellosu kuralları, ipuçları ve rehberler." },
    ],
  }),
  component: NasilOynanirPage,
});

function NasilOynanirPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold">Nasıl Oynanır</h1>
      <p className="mt-3 text-muted-foreground">
        Kelime Düellosu, klasik Wordle'ın Türkçe ve sıra tabanlı bir yorumudur.
      </p>

      <section className="mt-8 space-y-4 text-sm sm:text-base leading-relaxed">
        <div className="card-soft p-5">
          <h2 className="text-xl font-semibold">1. Kelimeyi tahmin et</h2>
          <p className="mt-2 text-muted-foreground">
            Sistem 5 harfli gizli bir Türkçe kelime seçer. 6 hakkın var.
          </p>
        </div>
        <div className="card-soft p-5">
          <h2 className="text-xl font-semibold">2. Renkleri oku</h2>
          <ul className="mt-2 space-y-2 text-muted-foreground">
            <li><span className="inline-block px-2 py-0.5 rounded tile-correct">Yeşil</span> — Harf doğru ve doğru yerde.</li>
            <li><span className="inline-block px-2 py-0.5 rounded tile-present">Sarı</span> — Harf kelimede var ama başka yerde.</li>
            <li><span className="inline-block px-2 py-0.5 rounded tile-absent">Gri</span> — Harf kelimede yok.</li>
          </ul>
        </div>
        <div className="card-soft p-5">
          <h2 className="text-xl font-semibold">3. Zorluk seç</h2>
          <p className="mt-2 text-muted-foreground">
            Tek kişilik modda Kolay, Orta ve Zor seviyeler arasından seçim yap. Seviye
            arttıkça kelimeler daha nadir ve zorlayıcı olur.
          </p>
        </div>
        <div className="card-soft p-5">
          <h2 className="text-xl font-semibold">4. İki kişilik düello</h2>
          <p className="mt-2 text-muted-foreground">
            Oda kur, kodu arkadaşına yolla. Sırayla tahmin edin, kim önce bulursa kazanır.
          </p>
        </div>
      </section>
    </main>
  );
}
