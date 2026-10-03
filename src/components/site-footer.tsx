import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/40 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kelime Düellosu. Tüm hakları saklıdır.
        </p>
        <nav className="flex items-center gap-4 text-xs">
          <Link
            to="/gizlilik"
            className="text-muted-foreground hover:text-foreground transition"
          >
            Gizlilik Politikası
          </Link>
          <Link
            to="/kullanim-sartlari"
            className="text-muted-foreground hover:text-foreground transition"
          >
            Kullanım Şartları
          </Link>
        </nav>
      </div>
    </footer>
  );
}
