import { Calculator, ClipboardList, FileSignature, FileStack } from "lucide-react";
import Reveal from "@/components/welcome/Reveal";

const ETAPAS = [
  {
    icon: ClipboardList,
    numero: "01",
    titulo: "Solicitação",
    texto: "O solicitante registra a demanda e anexa os requisitos do projeto.",
  },
  {
    icon: Calculator,
    numero: "02",
    titulo: "Contagem APF",
    texto: "O time de controle mede o tamanho funcional em pontos de função (IFPUG).",
  },
  {
    icon: FileStack,
    numero: "03",
    titulo: "Proposta",
    texto: "Fornecedores respondem pelo portal e o Metri compara valores e prazos.",
  },
  {
    icon: FileSignature,
    numero: "04",
    titulo: "Contrato & gestão",
    texto: "Aprovação, assinatura e acompanhamento da execução até a entrega.",
  },
] as const;

/** Seção "Como funciona" — fluxo do produto em 4 etapas. */
const ComoFunciona = () => (
  <section id="como-funciona" className="relative overflow-hidden bg-[#04080a] px-5 py-20 sm:px-8 md:px-12 md:py-28">
    <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-teal-500/[0.06] blur-3xl" />

    <div className="relative mx-auto w-full max-w-[1280px]">
      <Reveal className="max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
          Como funciona
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Um fluxo claro, do pedido ao contrato
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
          Cada etapa fica registrada e visível para quem precisa acompanhar —
          sem planilha paralela, sem perder o histórico.
        </p>
      </Reveal>

      {/* Desktop/tablet — grade de 4 colunas */}
      <div className="mt-14 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {ETAPAS.map((etapa, i) => (
          <Reveal key={etapa.numero} delay={i * 0.1} className="h-full">
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <div className="absolute right-5 top-5 font-display text-3xl font-bold tabular-nums text-white/[0.06]">
                {etapa.numero}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                <etapa.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="relative mt-5 font-display text-lg font-semibold">{etapa.titulo}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-white/55">{etapa.texto}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Mobile — timeline vertical */}
      <div className="relative mt-12 sm:hidden">
        <div className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-teal-300/40 via-white/10 to-transparent" />
        <div className="space-y-8">
          {ETAPAS.map((etapa, i) => (
            <Reveal key={etapa.numero} delay={i * 0.08} className="relative flex gap-4">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-300/25 bg-[#081114] text-teal-300">
                <etapa.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              </div>
              <div className="pt-1">
                <p className="text-[11px] font-semibold tabular-nums text-teal-300/70">{etapa.numero}</p>
                <h3 className="mt-0.5 font-display text-base font-semibold">{etapa.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">{etapa.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ComoFunciona;
