import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/hakkimizda")({
  head: () => ({
    meta: [
      { title: "Hakkımızda • Kelime Düellosu" },
      { name: "description", content: "Kelime Düellosu'nun hikayesi: Türkçe kelime severler için tasarlanmış modern bir Wordle deneyimi." },
      { property: "og:title", content: "Hakkımızda • Kelime Düellosu" },
      { property: "og:description", content: "Türkçe kelime severler için tasarlanmış modern bir Wordle deneyimi." },
    ],
  }),
  component: HakkimizdaPage,
});

function HakkimizdaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold">Hakkımızda</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Kelime Düellosu, Türkçe kelime severler için tasarlanmış modern bir Wordle
        deneyimidir. Amacımız arkadaşlarla ve tek başına oynanabilen, hızlı ve
        keyifli bir kelime oyunu sunmak.
      </p>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Küçük bir ekip tarafından hazırlandık ve her gün yeni kelimeler, yeni modlar
        eklemek için çalışıyoruz. Geri bildirimleriniz bize yol gösteriyor.
      </p>
    </main>
  );
}
