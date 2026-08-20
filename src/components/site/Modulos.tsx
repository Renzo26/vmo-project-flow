import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Gauge, UserRound } from "lucide-react";
import Reveal from "@/components/welcome/Reveal";

const MODULOS = [
  {
    icon: UserRound,
    titulo: "Solicitante",
    texto: "Abertura de demandas, acompanhamento de solicitações e visão clara do andamento.",
    to: "/",
  },
  {
    icon: Building2,
    titulo: "Fornecedor",
    texto: "Portal exclusivo para fornecedores enviarem propostas, documentos e acompanharem processos.",
    to: "/fornecedor-login",
  },
  {
    icon: Gauge,
    titulo: "Controle",
    texto: "Gestão completa de contratos, indicadores, aprovações e compliance em tempo real.",
    to: "/",
  },
] as const;

/** Seção "Módulos" — um card por perfil de acesso. */
const Modulos = () => {
  const navigate = useNavigate();

  return (
    <section id="modulos" className="relative overflow-hidden bg-[#04080a] px-5 py-20 sm:px-8 md:px-12 md:py-28">
      {/* Brilho decorativo da marca */}
      <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-teal-500/[0.07] blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        {/* Texto */}
        <Reveal className="lg:w-[320px] lg:shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
            Módulos
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Soluções completas para cada perfil
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/55">
            Cada módulo foi projetado para atender às necessidades específicas de
            cada área, com uma experiência intuitiva e integrada.
          </p>
          <button
            onClick={() => navigate("/bem-vindo")}
            className="mt-7 inline-flex h-11 items-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-6 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            Saiba mais sobre os módulos
            <ArrowRight className="h-4 w-4 text-teal-300" />
          </button>
        </Reveal>

        {/* Cards */}
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
          {MODULOS.map((mod, i) => (
            <Reveal key={mod.titulo} delay={i * 0.12} className="h-full">
              <button
                onClick={() => navigate(mod.to)}
                className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-left transition-[transform,border-color,background-color] duration-500 ease-expo hover:-translate-y-1 hover:border-teal-300/25 hover:bg-white/[0.05]"
              >
                {/* Wash de cor no hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-expo group-hover:opacity-100"
                  style={{ background: "radial-gradient(90% 60% at 50% 100%, rgba(45,212,191,0.10), transparent 70%)" }}
                />
                <div className="relative flex h-full flex-col">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300 transition-colors duration-500 ease-expo group-hover:bg-teal-400/15">
                    <mod.icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{mod.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{mod.texto}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-teal-300 transition-all group-hover:gap-2.5">
                    Saiba mais
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Modulos;
