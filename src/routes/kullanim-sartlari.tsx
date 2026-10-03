import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/kullanim-sartlari")({
  head: () => ({
    meta: [
      { title: "Kullanım Şartları • Kelime Düellosu" },
      { name: "description", content: "Kelime Düellosu kullanım şartları ve hizmet koşulları." },
      { property: "og:title", content: "Kullanım Şartları • Kelime Düellosu" },
      { property: "og:description", content: "Kelime Düellosu kullanım şartları." },
    ],
  }),
  component: SartlarPage,
});

function SartlarPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold">Kullanım Şartları</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Son güncelleme: 14 Temmuz 2026
      </p>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Kelime Düellosu'nu kullanarak aşağıdaki şartları kabul etmiş olursunuz.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">Kullanım</h2>
        <p>
          Hizmeti kişisel ve eğlence amaçlı kullanabilirsiniz. Sistemi kötüye kullanan,
          diğer oyuncuları rahatsız eden veya otomatik araçlarla oynayan hesaplar askıya
          alınabilir.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">İçerik</h2>
        <p>
          Oyun içindeki tüm görsel ve metin varlıkları Kelime Düellosu'na aittir. İzinsiz
          kopyalanamaz.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">Sorumluluk</h2>
        <p>
          Hizmet "olduğu gibi" sunulur. Kesintiler veya veri kayıplarından sorumlu
          tutulamayız.
        </p>
      </div>
    </main>
  );
}
