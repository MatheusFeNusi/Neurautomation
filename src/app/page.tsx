import Hero from "@/components/ui/hero-institucional";
import { NeurautomationHomeOrbital } from "@/components/home/neurautomation-home-orbital";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />

      <main className="flex-1">
        <Hero />

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
