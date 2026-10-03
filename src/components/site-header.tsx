import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon?: React.ElementType;
}

const navItems: NavItem[] = [
  { to: "/", label: "Giriş" },
  { to: "/oyunlar", label: "Oyunlar" },
  { to: "/nasil-oynanir", label: "Nasıl Oynanır" },
  { to: "/hakkimizda", label: "Hakkımızda" },
  { to: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img
            src="/logo.png"
            alt="Kelime Düellosu logosu"
            className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow"
          />
          <span className="text-sm sm:text-base font-semibold tracking-wide">
            Kelime Düellosu
          </span>
        </Link>

        {/* Masaüstü Navigasyon */}
        <div className="hidden md:flex items-center gap-3">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50 transition flex items-center gap-1.5"
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "text-foreground bg-secondary/60 font-semibold" }}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Profil Butonu (Yeni Oda Kur ile Aynı Renkte) */}
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium shadow-md shadow-rose-500/20 transition"
          >
            <User className="h-4 w-4" />
            Profil
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/50 bg-secondary/40 text-foreground hover:bg-secondary/70 transition"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobil Menü */}
      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition flex items-center gap-2"
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "text-foreground bg-secondary/60 font-semibold" }}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}
            
            {/* Mobilde Profil Butonu */}
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="mt-1 px-3 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition flex items-center gap-2 shadow-sm"
            >
              <User className="h-4 w-4" />
              Profil
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}