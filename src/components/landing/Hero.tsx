import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Crosshair,
  Info,
  LineChart,
  Menu,
  MoreHorizontal,
  ShieldCheck,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { EASE } from "@/components/landing/Reveal";
import TextoRevelado from "@/components/landing/TextoRevelado";
import NumeroAnimado from "@/components/landing/NumeroAnimado";
import { rolarPara } from "@/lib/lenis";
import { useEhDesktop } from "@/hooks/useMediaQuery";

/* ────────────────────────── conteúdo ────────────────────────── */

const NAV_ITEMS = [
  { label: "Módulos", target: "#modulos" },
  { label: "Recursos", target: "#recursos" },
  { label: "Sobre nós", target: "#sobre" },
] as const;

const DESTAQUES = [
  { icon: Crosshair, titulo: "Precisão", subtitulo: "em cada detalhe" },
  { icon: BarChart3, titulo: "Decisões", subtitulo: "baseadas em dados" },
  { icon: ShieldCheck, titulo: "Governança", subtitulo: "e controle total" },
] as const;

type Barra = { mes: string; h: number; destaque?: boolean };

// Altura em % — jul é o mês aceso
const BARRAS: Barra[] = [
  { mes: "fev", h: 26 },
  { mes: "mar", h: 36 },
  { mes: "abr", h: 46 },
  { mes: "mai", h: 56 },
  { mes: "jun", h: 72 },
  { mes: "jul", h: 100, destaque: true },
];

// Etapas do fluxo, exibidas na faixa infinita ao pé do hero
const ETAPAS = [
  "Solicitação",
  "Contagem APF",
  "Cotação",
  "Proposta",
  "Contrato",
  "Scorecard",
] as const;

/* ────────────────────────── componente ────────────────────────── */

export default function Hero() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [menuAberto, setMenuAberto] = useState(false);

  // Entrada escalonada dos blocos
  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  const irPara = (target: string) => {
    setMenuAberto(false);
    rolarPara(target);
  };

  // Inclinação 3D do card de KPI acompanhando o cursor — desktop apenas.
  const ehDesktop = useEhDesktop();
  const inclina = !reduced && ehDesktop;
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mola = { stiffness: 140, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), mola);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-11, 11]), mola);

  const aoMoverNoCard = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const aoSairDoCard = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      {/* ─────────── Fundo: globo com rede de conexões ─────────── */}
      <img
        src="/globo-hero.webp"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
      />
      {/* Escurece a esquerda para leitura do texto */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #04080a 0%, rgba(4,8,10,0.86) 30%, rgba(4,8,10,0.35) 52%, transparent 68%)",
        }}
      />
      {/* Funde topo e base ao fundo da página */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,8,10,0.6) 0%, transparent 18%, transparent 78%, #04080a 100%)",
        }}
      />
      {/* Glow teal à direita */}
      <div
        className="pointer-events-none absolute right-0 top-1/4 h-[420px] w-[420px] rounded-full opacity-60 blur-[120px]"
        style={{ background: "rgba(20,184,166,0.20)" }}
      />
      {/* Véu extra no mobile — o texto corre por cima do globo */}
      <div className="pointer-events-none absolute inset-0 bg-[#04080a]/50 lg:hidden" />

      {/* ─────────── Navegação ─────────── */}
      <div className="relative z-20">
        <motion.header
          {...enter(0.05)}
          className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 md:px-10"
        >
          {/* Marca */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
            className="flex items-center gap-2.5 sm:gap-3"
          >
            <img
              src="/logo-metri-mark.png"
              alt="Metri"
              className="h-9 w-9 object-contain sm:h-11 sm:w-11"
            />
            <span className="font-display text-[22px] font-semibold lowercase tracking-tight sm:text-[26px]">
              metri
            </span>
          </button>

          {/* Menu central em pill (desktop) */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.05] p-1.5 backdrop-blur-md lg:flex">
            <button
              onClick={() => irPara("#modulos")}
              className="ease-expo flex h-10 items-center gap-1.5 rounded-full px-5 text-[15px] text-white/75 transition-colors duration-300 hover:bg-white/10 hover:text-white"
            >
              Solução
              <ChevronDown className="h-4 w-4 opacity-60" />
            </button>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => irPara(item.target)}
                className="ease-expo h-10 rounded-full px-5 text-[15px] text-white/75 transition-colors duration-300 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Ações */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => navigate("/fornecedor-login")}
              className="ease-expo hidden h-11 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 text-[15px] text-white/85 backdrop-blur-sm transition-colors duration-300 hover:bg-white/10 hover:text-white md:flex"
            >
              <UserRound className="h-4 w-4" />
              Portal do fornecedor
            </button>
            <button
              onClick={() => navigate("/")}
              className="ease-expo flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-slate-900 transition-colors duration-300 hover:bg-white/90 sm:h-11 sm:px-6 sm:text-[15px]"
            >
              Entrar
            </button>
            {/* Hambúrguer (mobile/tablet) */}
            <button
              onClick={() => setMenuAberto((v) => !v)}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuAberto}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white/85 transition-colors hover:bg-white/10 lg:hidden"
            >
              {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </motion.header>

        {/* Painel do menu mobile */}
        {menuAberto && (
          <motion.nav
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute left-4 right-4 top-full z-30 rounded-2xl border border-white/10 bg-[#060d0f]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl lg:hidden"
          >
            <button
              onClick={() => irPara("#modulos")}
              className="flex h-11 w-full items-center justify-between rounded-xl px-4 text-[15px] text-white/85 transition-colors hover:bg-white/10"
            >
              Solução
              <ChevronDown className="h-4 w-4 opacity-60" />
            </button>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => irPara(item.target)}
                className="flex h-11 w-full items-center rounded-xl px-4 text-[15px] text-white/85 transition-colors hover:bg-white/10"
              >
                {item.label}
              </button>
            ))}
            <div className="mx-2 my-2 border-t border-white/10" />
            <button
              onClick={() => {
                setMenuAberto(false);
                navigate("/fornecedor-login");
              }}
              className="flex h-11 w-full items-center gap-2.5 rounded-xl px-4 text-[15px] text-white/85 transition-colors hover:bg-white/10"
            >
              <UserRound className="h-4 w-4 text-teal-300" />
              Portal do fornecedor
            </button>
          </motion.nav>
        )}
      </div>

      {/* ─────────── Conteúdo do hero ─────────── */}
      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-14 sm:pt-8 md:px-10 lg:pb-16 lg:pt-0">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          {/* ── Coluna de texto ── */}
          <div className="max-w-2xl">
            <motion.div
              {...enter(0.15)}
              className="ease-expo mb-6 inline-flex items-center gap-2.5 rounded-full border border-teal-300/25 bg-teal-500/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md transition-colors duration-300 hover:bg-teal-500/15 sm:mb-8 sm:text-[15px]"
            >
              <Crosshair className="h-4 w-4 text-teal-300" strokeWidth={1.75} />
              Bem-vindo ao Metri
            </motion.div>

            <h1 className="font-display text-[2.1rem] font-bold leading-[1.1] tracking-[-0.02em] sm:text-5xl sm:leading-[1.08] xl:text-[4rem]">
              <TextoRevelado
                texto="Eleve a gestão de suprimentos de TI a um"
                gatilho="imediato"
                delay={0.25}
              />
              <TextoRevelado
                texto="novo patamar"
                gatilho="imediato"
                delay={0.25 + 8 * 0.045}
                className="bg-gradient-to-r from-teal-100 to-teal-400 bg-clip-text text-transparent"
              />
            </h1>

            <motion.p
              {...enter(0.38)}
              className="mt-5 max-w-[560px] text-base leading-[1.7] text-white/60 sm:mt-6 sm:text-[17px]"
            >
              Precisão que gera valor. Com o Metri, você tem medição, comparação e controle de
              solicitações, contagem de pontos de função, propostas e contratos em um só lugar.
            </motion.p>

            <motion.div
              {...enter(0.5)}
              className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <button
                onClick={() => navigate("/")}
                className="ease-expo group flex h-12 items-center justify-center gap-2.5 rounded-full bg-white px-7 text-[15px] font-semibold text-slate-900 transition-all duration-300 hover:bg-white/90 active:scale-[0.98]"
              >
                Entrar
                <ArrowRight className="ease-expo h-4 w-4 text-teal-600 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => irPara("#modulos")}
                className="ease-expo group flex h-12 items-center justify-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-7 text-[15px] text-white/85 backdrop-blur-sm transition-colors duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                Conhecer módulos
                <ArrowRight className="ease-expo h-4 w-4 text-teal-300 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Barra de destaques */}
            <motion.div
              {...enter(0.62)}
              className="mt-10 flex w-full flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md sm:mt-14 sm:w-fit sm:max-w-full sm:flex-row sm:divide-x sm:divide-y-0 sm:overflow-x-auto"
            >
              {DESTAQUES.map((d) => (
                <div
                  key={d.titulo}
                  className="flex items-center gap-3.5 px-5 py-3.5 sm:px-7 sm:py-4 sm:first:pl-6 sm:last:pr-8"
                >
                  <d.icon className="h-6 w-6 shrink-0 text-teal-300" strokeWidth={1.5} />
                  <div className="leading-snug">
                    <p className="whitespace-nowrap text-[15px] font-semibold">{d.titulo}</p>
                    <p className="whitespace-nowrap text-[13px] text-white/50">{d.subtitulo}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Card de KPI em glassmorphism ── */}
          <motion.div
            {...enter(0.6)}
            className="flex justify-center lg:justify-end"
            style={inclina ? { perspective: 1200 } : undefined}
            onMouseMove={inclina ? aoMoverNoCard : undefined}
            onMouseLeave={inclina ? aoSairDoCard : undefined}
          >
            <motion.div
              className="w-full max-w-[400px]"
              style={inclina ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
            >
            <div className="animate-flutuar relative w-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0b1416]/55 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-7">
              {/* Brilho interno do card */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />

              <div className="relative z-10">
                {/* Cabeçalho */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-400/15 text-teal-300">
                    <LineChart className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <p className="text-[15px] font-medium text-white/90">Saving acumulado</p>
                  <Info className="h-4 w-4 text-white/35" />
                  <MoreHorizontal className="ml-auto h-5 w-5 text-white/40" />
                </div>

                {/* Valor */}
                <p className="font-display mt-5 text-[2rem] font-bold leading-none tracking-tight tabular-nums sm:text-[2.5rem]">
                  <NumeroAnimado valor={1284500} decimais={2} prefixo="R$ " duracao={2.2} />
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 font-semibold text-teal-300">
                    <TrendingUp className="h-4 w-4" />
                    +18,2%
                  </span>
                  <span className="text-white/45">vs. período anterior</span>
                </div>

                {/* Gráfico de barras */}
                <div className="mt-6 flex h-28 items-end gap-3 sm:mt-7 sm:h-32 sm:gap-3.5">
                  {BARRAS.map((b, i) => (
                    <motion.div
                      key={b.mes}
                      initial={reduced ? false : { height: 0 }}
                      animate={{ height: `${b.h}%` }}
                      transition={{ duration: 0.9, delay: 0.9 + i * 0.08, ease: EASE }}
                      style={reduced ? { height: `${b.h}%` } : undefined}
                      className={`flex-1 rounded-t-md ${
                        b.destaque
                          ? "bg-gradient-to-t from-teal-400 to-teal-100 shadow-[0_0_28px_rgba(94,234,212,0.45)]"
                          : "bg-gradient-to-t from-teal-500/25 via-teal-400/35 to-teal-300/60"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-2.5 flex gap-3 text-center text-[12px] tabular-nums sm:gap-3.5">
                  {BARRAS.map((b) => (
                    <span
                      key={b.mes}
                      className={`flex-1 ${b.destaque ? "text-white/75" : "text-white/40"}`}
                    >
                      {b.mes}
                    </span>
                  ))}
                </div>

                <div className="my-6 h-px w-full bg-white/10" />

                {/* Chips de status */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white/70">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                    </span>
                    Em tempo real
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white/70">
                    <ShieldCheck className="h-3 w-3 text-teal-300" />
                    Auditável
                  </span>
                </div>
              </div>
            </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* ─────────── Faixa do fluxo (marquee) ─────────── */}
      <motion.div
        {...enter(0.75)}
        className="relative z-10 border-t border-white/[0.08] py-6 backdrop-blur-sm"
      >
        <p className="mb-4 px-5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300 sm:px-6 md:px-10">
          Do pedido ao contrato, ponta a ponta
        </p>
        <div
          className="relative flex overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <div className="animate-marquee flex shrink-0 items-center gap-10 whitespace-nowrap pr-10 sm:gap-14 sm:pr-14">
            {[...ETAPAS, ...ETAPAS, ...ETAPAS, ...ETAPAS].map((etapa, i) => (
              <span
                key={i}
                className="flex items-center gap-10 text-[15px] font-medium text-white/45 sm:gap-14 sm:text-base"
              >
                {etapa}
                <span className="h-1 w-1 shrink-0 rounded-full bg-teal-300/60" />
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
