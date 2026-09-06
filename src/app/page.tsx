import Link from "next/link";

import { NeurautomationHomeOrbital } from "@/components/home/neurautomation-home-orbital";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-4xl px-6 pb-4 pt-20 text-center">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 backdrop-blur-lg">
            Holding de tecnologia e performance
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Tecnologia, performance e crescimento digital em um só ecossistema
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-white/60 md:text-lg">
            A Neurautomation integra automação com IA, tráfego pago, produtos
            digitais e marketing em quatro frentes que se conectam para gerar
            receita previsível.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              asChild
              className="bg-white text-black hover:bg-white/85"
              size="lg"
            >
              <Link href="#frentes">Conheça as frentes</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">Área do cliente</Link>
            </Button>
          </div>
        </section>

        <section id="frentes" className="scroll-mt-16">
          <NeurautomationHomeOrbital />
        </section>

        <section
          id="sobre"
          className="mx-auto w-full max-w-4xl scroll-mt-20 px-6 pb-24 text-center"
        >
          <h2 className="text-2xl font-semibold md:text-3xl">
            Uma holding, quatro operações conectadas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-white/60">
            Cada frente alimenta a outra: a automação sustenta a operação dos
            clientes, o tráfego valida a demanda, os infoprodutos escalam o
            conhecimento e a agência entrega execução ponta a ponta.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
