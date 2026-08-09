import { Building2, Gauge, UserRound } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import Reveal from "@/components/landing/Reveal";
import TextoRevelado from "@/components/landing/TextoRevelado";

const MODULOS = [
  {
    icon: UserRound,
    titulo: "Solicitante",
    texto:
      "Abertura de demandas, acompanhamento de solicitações e visão clara do andamento.",
    itens: [
      "Nova solicitação guiada em 4 passos",
      "Acompanhamento por status do pedido",
      "Painel de projetos e indicadores",
    ],
  },
  {
    icon: Building2,
    titulo: "Fornecedor",
    texto:
      "Portal exclusivo para fornecedores enviarem propostas, documentos e acompanharem processos.",
    itens: [
      "Proposta com cálculo automático de horas",
      "Envio e gestão de documentos",
      "Histórico completo de processos",
    ],
  },
  {
    icon: Gauge,
    titulo: "Controle & Governança",
    texto:
      "Gestão completa de contratos, indicadores, aprovações e compliance em tempo real.",
    itens: [
      "Contagem de pontos de função (APF)",
      "Base de fornecedores e scorecard",
      "Contratos ativos e tabela de PF",
    ],
  },
] as const;

/** Seção "Módulos" — um card por perfil de acesso. */
export default function Modulos() {
  return (
    <section
      id="modulos"
      className="relative overflow-hidden bg-fundo px-4 py-16 sm:px-8 sm:py-20 md:px-12 md:py-28"
    >
      {/* Brilho decorativo da marca */}
      <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-teal-500/[0.07] blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        {/* Texto da seção */}
        <Reveal className="lg:w-[320px] lg:shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
            Módulos
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            <TextoRevelado texto="Soluções completas para cada perfil" />
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/55">
            Cada módulo foi projetado para atender às necessidades específicas de cada área, com
            uma experiência intuitiva e integrada.
          </p>
        </Reveal>

        {/* Cards */}
        {/* 3 colunas só a partir de lg — em 640px os cards ficariam com ~200px */}
        <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map((mod, i) => (
            <Reveal key={mod.titulo} delay={i * 0.12} className="h-full">
              <SpotlightCard className="group h-full">
                <div className="flex h-full flex-col p-6">
                  <div className="ease-expo flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300 transition-colors duration-500 group-hover:bg-teal-400/15">
                    <mod.icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>

                  <h3 className="font-display mt-5 text-lg font-semibold">{mod.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{mod.texto}</p>

                  <ul className="mt-5 space-y-2.5 border-t border-white/[0.08] pt-5">
                    {mod.itens.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[13px] text-white/65">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
