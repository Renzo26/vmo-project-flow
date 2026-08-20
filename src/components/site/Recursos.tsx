import { Check } from "lucide-react";
import Reveal from "@/components/welcome/Reveal";

const CHECKLIST = [
  "Contagem APF nos padrões IFPUG, NESMA e SFP",
  "Comparação automática de propostas com a tabela R$/PF vigente",
  "Trilha de aprovações e histórico completo por solicitação",
  "Scorecard de fornecedores e acompanhamento de SLA",
] as const;

// Série do gráfico de linha (economia acumulada por mês)
const PONTOS = [
  { mes: "Fev", v: 22 },
  { mes: "Mar", v: 34 },
  { mes: "Abr", v: 46 },
  { mes: "Mai", v: 58 },
  { mes: "Jun", v: 78 },
  { mes: "Jul", v: 100 },
] as const;

const W = 300;
const H = 120;

/** Gráfico de área/linha do mockup — coordenadas derivadas da série. */
const GraficoEconomia = () => {
  const passo = W / (PONTOS.length - 1);
  const coords = PONTOS.map((p, i) => ({
    x: i * passo,
    y: H - (p.v / 100) * (H - 16) - 8,
  }));
  const linha = coords.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H + 14}`} className="mt-3 w-full" aria-hidden>
      <defs>
        <linearGradient id="areaEconomia" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          x2={W}
          y1={12 + i * 28}
          y2={12 + i * 28}
          stroke="rgba(255,255,255,0.05)"
        />
      ))}
      <polygon points={`${linha} ${W},${H} 0,${H}`} fill="url(#areaEconomia)" />
      <polyline
        points={linha}
        fill="none"
        stroke="#5eead4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 2.5} fill="#99f6e4" />
      ))}
      {PONTOS.map((p, i) => (
        <text
          key={p.mes}
          x={i * passo}
          y={H + 11}
          fontSize="8"
          fill="rgba(255,255,255,0.35)"
          textAnchor={i === 0 ? "start" : i === PONTOS.length - 1 ? "end" : "middle"}
        >
          {p.mes}
        </text>
      ))}
    </svg>
  );
};

const TILES = [
  { label: "Solicitações", valor: "128" },
  { label: "Propostas", valor: "86" },
  { label: "Contratos", valor: "42" },
] as const;

/** Mockup do painel do Metri — ilustrativo, montado em HTML/SVG. */
const PainelMockup = () => (
  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#081114]/80 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-5">
    <div className="flex items-center gap-2.5">
      <img src="/logo-metri-mark.png" alt="" className="h-5 w-5 object-contain" />
      <span className="font-display text-sm font-semibold lowercase">metri</span>
      <span className="ml-auto flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-teal-300/60" />
      </span>
    </div>

    <div className="mt-4 grid grid-cols-3 gap-2">
      {TILES.map((t) => (
        <div key={t.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
          <p className="truncate text-[10px] text-white/45">{t.label}</p>
          <p className="mt-1 font-display text-lg font-bold tabular-nums tracking-tight">
            {t.valor}
          </p>
        </div>
      ))}
    </div>

    <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-white/70">Economia acumulada</p>
        <span className="rounded-full bg-teal-400/15 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
          +18,2%
        </span>
      </div>
      <GraficoEconomia />
    </div>
  </div>
);

/** Seção "Recursos" — mockup do produto + lista de capacidades. */
const Recursos = () => (
  <section id="recursos" className="relative overflow-hidden bg-[#04080a] px-5 py-20 sm:px-8 md:px-12 md:py-28">
    <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-teal-500/[0.07] blur-3xl" />

    <div className="relative mx-auto grid w-full max-w-[1280px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <Reveal className="order-2 lg:order-1">
        <PainelMockup />
      </Reveal>

      <Reveal delay={0.12} className="order-1 lg:order-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
          Recursos
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Dados que viram decisão
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
          Indicadores em tempo real, comparação de propostas e histórico
          auditável — tudo no mesmo lugar em que o trabalho acontece.
        </p>
        <ul className="mt-7 space-y-3.5">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-white/75">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-400/15 text-teal-300">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  </section>
);

export default Recursos;
