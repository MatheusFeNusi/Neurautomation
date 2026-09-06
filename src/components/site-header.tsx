import Link from "next/link";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/#frentes", label: "Frentes" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500" />
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-white">
            Neurautomation
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
        >
          <Link href="/login">Área do Cliente</Link>
        </Button>
      </div>
    </header>
  );
}
