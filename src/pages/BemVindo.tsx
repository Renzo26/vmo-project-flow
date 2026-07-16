import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  FolderKanban,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import Reveal, { EASE } from "@/components/welcome/Reveal";
import HeroBackdrop from "@/components/welcome/HeroBackdrop";
import SplashScreen from "@/components/SplashScreen";

/* ────────────────────────── conteúdo ────────────────────────── */

const MODULOS = [
  {
    icon: FolderKanban,
    title: "Solicitante",
    description: "Abra e acompanhe solicitações de contratação, da demanda à proposta aceita.",
    items: ["Nova solicitação guiada", "Status em tempo real", "Histórico completo do projeto"],
  },
  {
    icon: Building2,
    title: "Fornecedor",
    description: "Portal dedicado para responder propostas e manter a documentação em dia.",
    items: ["Propostas e projetos", "Documentos e certidões", "Prazos e SLAs claros"],
  },
  {
    icon: ShieldCheck,
    title: "Controle & Governança",
    description: "Medição, comparação e acompanhamento de tudo que entra no portfólio.",
    items: ["Contagem APF — IFPUG · PFS 2.2", "Contratos e tabela R$/PF", "Scorecard de fornecedores"],
  },
] as const;

const ETAPAS = [
  {
    numero: "01",
    titulo: "Solicitação",
    texto: "O solicitante descreve a demanda e anexa os requisitos do projeto.",
  },
  {
    numero: "02",
    titulo: "Contagem APF",
    texto: "O time de controle mede o tamanho funcional e estima o custo em pontos de função.",
  },
  {
    numero: "03",
    titulo: "Proposta",
    texto: "O fornecedor responde pelo portal e o Metri compara o valor com o contrato vigente.",
  },
  {
    numero: "04",
    titulo: "Contrato & scorecard",
    texto: "Aderência, saving e desempenho de cada fornecedor acompanhados no dashboard.",
  },
] as const;

// Barras do mini-gráfico do card de KPI (alturas em %, cauda esmaecida)
const BARRAS: ReadonlyArray<{ h: number; dim: boolean }> = [
  { h: 34, dim: false }, { h: 52, dim: false }, { h: 38, dim: false }, { h: 61, dim: false },
  { h: 44, dim: false }, { h: 70, dim: false }, { h: 55, dim: false }, { h: 82, dim: false },
  { h: 64, dim: false }, { h: 90, dim: false }, { h: 73, dim: false }, { h: 100, dim: false },
  { h: 58, dim: true }, { h: 47, dim: true }, { h: 39, dim: true }, { h: 33, dim: true },
  { h: 28, dim: true }, { h: 24, dim: true },
];

const MESES = ["fev", "mar", "abr", "mai", "jun", "jul"] as const;

// Link com sublinhado que "varre" da direita para a esquerda no hover (sutil)
const UNDERLINE =
  "relative inline-flex w-fit items-center text-white/70 transition-colors duration-300 hover:text-white " +
  "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 " +
  "after:bg-current after:transition-transform after:duration-500 after:ease-expo " +
  "hover:after:origin-left hover:after:scale-x-100";

/* ────────────────────────── página ────────────────────────── */

const BemVindo = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  // Entrada do hero aguarda a splash do logo terminar
  const [introDone, setIntroDone] = useState(false);

  // Scroll suave (Lenis) — desativado com prefers-reduced-motion
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = "Bem-vindo — Metri";
    return () => {
      document.title = prev;
    };
  }, []);

  const goTo = (selector: string) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -20 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  // Entrada escalonada dos elementos do hero — dispara quando a splash sai
  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  return (
    <div
      className="min-h-screen text-white antialiased"
      style={{
        background:
          "radial-gradient(80% 40% at 50% 0%, hsl(179 45% 14%) 0%, transparent 70%), linear-gradient(180deg, hsl(188 32% 8%) 0%, hsl(200 25% 4%) 55%, #030607 100%)",
      }}
    >
      {/* Splash do logo — antecede a apresentação (1x por sessão) */}
      <SplashScreen onFinish={() => setIntroDone(true)} />

      {/* ─────────── HERO — full-bleed (preenche a viewport) ─────────── */}
        <section
          className="relative flex min-h-screen flex-col overflow-hidden"
          style={{
            background:
              "radial-gradient(60% 46% at 50% 102%, rgba(20,184,166,0.26) 0%, transparent 72%), radial-gradient(44% 38% at 74% 14%, rgba(13,148,136,0.14) 0%, transparent 70%), radial-gradient(52% 44% at 20% 28%, rgba(94,234,212,0.05) 0%, transparent 70%), linear-gradient(180deg, #050c0e 0%, #081517 48%, #040a0c 100%)",
          }}
        >
          {/* Fundo estático — imagem da marca (globo + rede) */}
          <HeroBackdrop />
          {/* Vinheta para leitura do texto */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_50%,transparent_55%,rgba(2,6,7,0.45)_100%)]" />

          {/* Navegação */}
          <motion.header {...enter(0.05)} className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-5 py-5 md:px-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white">
                <img src="/logo-metri-symbol.png" alt="Metri" className="h-7 w-7 object-contain" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">Metri</span>
                <span className="text-[10px] text-white/50">Vendor Management System</span>
              </div>
            </div>

            <nav className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.06] p-1 backdrop-blur-md lg:flex">
              {[
                { label: "Módulos", target: "#modulos" },
                { label: "Como funciona", target: "#fluxo" },
                { label: "Acesso", target: "#acesso" },
              ].map((item) => (
                <button
                  key={item.target}
                  onClick={() => goTo(item.target)}
                  className="h-9 rounded-full px-4 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/fornecedor-login")}
                className="hidden h-10 items-center rounded-full border border-white/15 px-4 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:flex"
              >
                Portal do fornecedor
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-sm font-medium text-slate-900 transition-colors hover:bg-white/90"
              >
                Entrar
              </button>
            </div>
          </motion.header>

          {/* Corpo do hero */}
          <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 pb-20 pt-8 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:pb-12">
            {/* Texto */}
            <div className="max-w-xl">
              <motion.div
                {...enter(0.15)}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                Bem-vindo ao Metri
              </motion.div>

              <motion.h1
                {...enter(0.25)}
                className="font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl xl:text-[3.6rem]"
              >
                Eleve a gestão de suprimentos de TI a um novo patamar
              </motion.h1>

              <motion.p {...enter(0.38)} className="mt-6 max-w-md text-base leading-relaxed text-white/60">
                Solicitações, contagem de pontos de função, propostas e contratos —
                medidos, comparados e sob controle em um só lugar.
              </motion.p>

              <motion.div {...enter(0.5)} className="mt-9 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-900 transition-colors hover:bg-white/90"
                >
                  Acessar plataforma
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => goTo("#modulos")}
                  className="flex h-11 items-center rounded-full border border-white/20 px-6 text-sm text-white/85 transition-colors hover:bg-white/10"
                >
                  Conhecer os módulos
                </button>
              </motion.div>
            </div>

            {/* Card de KPI em glassmorphism */}
            <motion.div {...enter(0.6)} className="hidden justify-end lg:flex">
              <motion.div
                animate={reduced ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
              >
                <p className="text-sm font-medium text-white/70">Saving acumulado</p>
                <p className="mt-2 font-display text-4xl font-bold tabular-nums tracking-tight">
                  R$ 1.284.500<span className="text-white/30">,00</span>
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
                  <span className="inline-flex items-center gap-1 rounded-md bg-teal-300/15 px-1.5 py-0.5 font-semibold text-teal-200">
                    <TrendingUp className="h-3 w-3" />
                    +18,2%
                  </span>
                  vs. período anterior (R$ 1,08 mi)
                </div>

                {/* Mini-gráfico de barras */}
                <div className="mt-6 flex h-24 items-end gap-[5px]">
                  {BARRAS.map((b, i) => (
                    <div
                      key={i}
                      style={{ height: `${b.h}%` }}
                      className={`flex-1 rounded-sm ${b.dim ? "bg-white/15" : "bg-teal-200/80"}`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-[10px] tabular-nums text-white/40">
                  {MESES.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ─────────── MÓDULOS ─────────── */}
        <section id="modulos" className="mx-auto max-w-6xl px-3 py-24 md:py-32">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300/80">Módulos</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Um sistema, três frentes de trabalho
            </h2>
            <p className="mt-4 max-w-lg text-white/55">
              Cada perfil enxerga apenas o que precisa — e todos trabalham sobre os mesmos números.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {MODULOS.map((mod, i) => (
              <Reveal key={mod.title} delay={i * 0.12}>
                {/* Hover sutil: micro-elevação, wash teal e brilho — easing expo lento */}
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 transition-[transform,border-color,background-color,box-shadow] duration-500 ease-expo hover:-translate-y-[3px] hover:border-teal-300/20 hover:bg-white/[0.055] hover:shadow-[0_18px_50px_-28px_rgba(20,184,166,0.45)]">
                  {/* Wash de cor que surge de cima no hover */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-expo group-hover:opacity-100"
                    style={{ background: "radial-gradient(90% 65% at 50% 0%, rgba(45,212,191,0.09), transparent 72%)" }}
                  />
                  <div className="relative flex h-full flex-col">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300 transition-[transform,background-color,color] duration-500 ease-expo group-hover:scale-[1.04] group-hover:bg-teal-400/15 group-hover:text-teal-200">
                      <mod.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold">{mod.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{mod.description}</p>
                    <ul className="mt-5 space-y-2.5 border-t border-white/[0.08] pt-5 text-sm text-white/70">
                      {mod.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-300/80" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─────────── COMO FUNCIONA ─────────── */}
        <section id="fluxo" className="mx-auto max-w-6xl px-3 pb-24 md:pb-32">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300/80">Como funciona</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Da demanda ao contrato, sem atalhos
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPAS.map((etapa, i) => (
              <Reveal key={etapa.numero} delay={i * 0.1}>
                <div className="border-t border-white/15 pt-5">
                  <span className="font-display text-sm font-semibold tabular-nums text-teal-300/70">
                    {etapa.numero}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{etapa.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{etapa.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─────────── CTA FINAL ─────────── */}
        <section id="acesso" className="mx-auto max-w-6xl px-3 pb-24">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-[1.75rem] p-10 text-center md:p-16"
              style={{
                background:
                  "radial-gradient(110% 140% at 100% 0%, hsl(158 70% 82%) 0%, transparent 58%), linear-gradient(135deg, hsl(158 70% 78%) 0%, hsl(172 62% 52%) 55%, hsl(178 72% 34%) 100%)",
              }}
            >
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
              <h2 className="relative mx-auto max-w-lg font-display text-3xl font-bold tracking-tight text-teal-950 sm:text-4xl">
                Pronto para colocar os números no controle?
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-sm font-medium text-teal-950/70">
                Entre com a sua conta ou acesse o portal do fornecedor para responder propostas.
              </p>
              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="flex h-11 items-center gap-2 rounded-full bg-teal-950 px-6 text-sm font-medium text-white transition-colors hover:bg-teal-900"
                >
                  Acessar plataforma
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate("/fornecedor-login")}
                  className="flex h-11 items-center gap-1.5 rounded-full border border-teal-950/30 px-6 text-sm font-medium text-teal-950 transition-colors hover:bg-teal-950/10"
                >
                  Portal do fornecedor
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ─────────── RODAPÉ ─────────── */}
        <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-3 py-8 text-xs text-white/45">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white">
              <img src="/logo-metri-symbol.png" alt="" className="h-4.5 w-4.5 object-contain" />
            </div>
            © {new Date().getFullYear()} Metri — Vendor Management System
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => navigate("/")} className={UNDERLINE}>
              Entrar
            </button>
            <button onClick={() => navigate("/fornecedor-login")} className={UNDERLINE}>
              Portal do fornecedor
            </button>
          </div>
        </footer>
    </div>
  );
};

export default BemVindo;
