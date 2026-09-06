import Link from "next/link";
import { Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer
      id="contato"
      className="border-t border-white/10 bg-black text-white/60"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500" />
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-white">
              Neurautomation
            </span>
          </div>
          <p className="max-w-xs text-sm">
            Holding de tecnologia e performance digital: automação com IA,
            tráfego pago, produtos digitais e marketing.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-white/80">
            Contato
          </h3>
          <a
            href="mailto:contato@neurautomation.com"
            className="flex items-center gap-2 text-sm transition-colors hover:text-white"
          >
            <Mail size={14} />
            contato@neurautomation.com
          </a>
          <div className="flex items-center gap-4 pt-1 text-sm">
            <a
              href="https://www.instagram.com/"
              className="transition-colors hover:text-white"
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/"
              className="transition-colors hover:text-white"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-white/80">
            Institucional
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/politica-de-privacidade"
                className="transition-colors hover:text-white"
              >
                Política de privacidade
              </Link>
            </li>
            <li>
              <Link
                href="/termos-de-uso"
                className="transition-colors hover:text-white"
              >
                Termos de uso
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-white">
                Área do cliente
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs">
        © {new Date().getFullYear()} Neurautomation. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
