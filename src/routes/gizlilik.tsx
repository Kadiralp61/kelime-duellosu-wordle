import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/gizlilik")({
  head: () => ({
    meta: [
      { title: "Gizlilik Politikası • Kelime Düellosu" },
      { name: "description", content: "Kelime Düellosu gizlilik politikası. Verilerinizi nasıl işlediğimize dair açıklamalar." },
      { property: "og:title", content: "Gizlilik Politikası • Kelime Düellosu" },
      { property: "og:description", content: "Verilerinizi nasıl işlediğimize dair açıklamalar." },
    ],
  }),
  component: GizlilikPage,
});

function GizlilikPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold">Gizlilik Politikası</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Son güncelleme: 14 Temmuz 2026
      </p>
      <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Kelime Düellosu olarak gizliliğinize önem veriyoruz. Bu sayfa, hangi bilgileri
          topladığımızı ve nasıl kullandığımızı açıklar.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">Toplanan Bilgiler</h2>
        <p>
          Hesap açtığınızda ad ve e-posta bilgileriniz saklanır. Oyun içi tercihleriniz
          (isim, seçtiğiniz zorluk) tarayıcınızda tutulur.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">Çerezler ve Analitik</h2>
        <p>
          Sitenin kullanımı hakkında istatistik toplamak için Google Analytics
          kullanıyoruz. Kişisel olarak sizi tanımlayan veri paylaşmıyoruz.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-6">İletişim</h2>
        <p>
          Sorularınız için iletisim.kiraloyun@gmail.com adresine yazabilirsiniz.
        </p>
      </div>
    </main>
  );
}
