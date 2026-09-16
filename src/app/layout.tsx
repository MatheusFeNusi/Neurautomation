import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const IMPACT_STAT_SNIPPET = `(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7781791-d359-4b7b-b3b4-34371909d4161.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neurautomation | Tecnologia, performance e crescimento digital",
  description:
    "Holding de tecnologia e performance digital: automação B2B com IA, tráfego pago de afiliado, infoprodutos e agência de marketing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <script dangerouslySetInnerHTML={{ __html: IMPACT_STAT_SNIPPET }} />
        {children}
      </body>
    </html>
  );
}
