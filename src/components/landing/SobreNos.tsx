import { GitCompareArrows, History, Layers } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import Reveal from "@/components/landing/Reveal";
import TextoRevelado from "@/components/landing/TextoRevelado";

const PILARES = [
  {
    icon: GitCompareArrows,
    titulo: "Medir antes de contratar",
    texto:
      "Pontos de função dão uma base objetiva para negociar: o preço deixa de ser opinião e passa a ser comparação.",
  },
  {
    icon: Layers,
    titulo: "Um só lugar",
    texto:
      "Solicitante, fornecedor e governança trabalham sobre os mesmos números, sem retrabalho e sem versão paralela.",
  },
  {
    icon: History,
    titulo: "Histórico que serve",
    texto:
      "Cada decisão fica registrada com autor, data e justificativa: auditoria deixa de ser um projeto à parte.",
  },
] as const;

/** Seção "Sobre nós" — posicionamento do produto. */
export default function SobreNos() {
  return (
    <section
      id="sobre"
      className="bg-fundo relative overflow-hidden px-4 py-16 sm:px-8 sm:py-20 md:px-12 md:py-28"
    >
      <div className="pointer-events-none absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-teal-500/[0.06] blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[1280px] gap-12 lg:grid-cols-[minmax(280px,420px)_1fr] lg:gap-16">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
            Sobre nós
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            <TextoRevelado texto="Nascido dentro de um VMO de verdade" />
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/55">
            O Metri foi construído a partir da operação de contratação de TI da Braesp: das
            planilhas que não fechavam, das propostas difíceis de comparar e das aprovações perdidas
            em e-mail.
          </p>

          {/* Metáfora da marca (design system §1) */}
          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
            {["Medir", "Comparar", "Controlar"].map((pilar, i) => (
              <span key={pilar} className="flex items-center gap-3">
                <span className="font-display text-lg font-semibold tracking-tight text-white/85">
                  {pilar}
                </span>
                {i < 2 && <span className="h-1 w-1 rounded-full bg-teal-300" />}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {PILARES.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 0.1} className="h-full">
              <SpotlightCard className="group h-full">
                <div className="flex h-full flex-col p-6">
                  <div className="ease-expo flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300 transition-colors duration-500 group-hover:bg-teal-400/15">
                    <p.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display mt-5 text-base font-semibold leading-snug">
                    {p.titulo}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/55">{p.texto}</p>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
