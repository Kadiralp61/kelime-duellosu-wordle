import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim • Kelime Düellosu" },
      { name: "description", content: "Kelime Düellosu ekibine ulaş: öneri, geri bildirim ve iş birliği talepleri için." },
      { property: "og:title", content: "İletişim • Kelime Düellosu" },
      { property: "og:description", content: "Kelime Düellosu ekibine ulaşın." },
    ],
  }),
  component: IletisimPage,
});

function IletisimPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold">İletişim</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Öneri, geri bildirim veya iş birliği için bize e-posta gönderebilirsin.
      </p>
      <div className="mt-6 card-soft p-6">
        <p className="text-sm text-muted-foreground">E-posta</p>
        <a
          href="mailto:iletisim.kiraloyun@gmail.com"
          className="mt-1 inline-block text-lg font-semibold hover:text-primary transition"
        >
          iletisim.kiraloyun@gmail.com
        </a>
      </div>
    </main>
  );
}
