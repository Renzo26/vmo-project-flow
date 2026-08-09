import { lazy, Suspense, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import TextoRevelado from "@/components/landing/TextoRevelado";
import { useEhDesktop } from "@/hooks/useMediaQuery";

// O mockup carrega o Recharts — fica fora do bundle inicial.
const DashboardMockup = lazy(() => import("@/components/landing/DashboardMockup"));

/**
 * Seção "Recursos" — apresenta o produto com o mockup do dashboard em
 * perspectiva. A inclinação se desfaz conforme a seção entra na viewport.
 */
export default function Recursos() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const ehDesktop = useEhDesktop();
  const anima3d = !reduced && ehDesktop;
  const alvo = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: alvo,
    offset: ["start end", "center center"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0.35, 1]);

  return (
    <section
      id="recursos"
      className="bg-fundo relative overflow-hidden px-4 pt-16 sm:px-8 sm:pt-20 md:px-12 md:pt-28"
    >
      {/* Brilho da marca atrás do mockup */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[680px] max-w-full -translate-x-1/2 rounded-full bg-teal-500/[0.08] blur-[120px]" />

      <div className="relative mx-auto w-full max-w-[1080px]">
        {/* Texto */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
            Recursos
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-[2.75rem]">
            <TextoRevelado texto="Todo o ciclo em um painel só" />
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/55 sm:text-base">
            Saving acumulado, solicitações em aberto, contagens de pontos de função e contratos
            ativos, medidos e comparados na mesma tela, atualizados a cada movimento do processo.
          </p>
          <button
            onClick={() => navigate("/")}
            className="ease-expo group mt-8 inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-7 text-[15px] font-semibold text-slate-900 transition-all duration-300 hover:bg-white/90 active:scale-[0.98]"
          >
            Ver o Metri por dentro
            <ArrowRight className="ease-expo h-4 w-4 text-teal-600 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </Reveal>

        {/* Mockup em perspectiva, esmaecendo na base */}
        <div
          ref={alvo}
          className="mt-10 sm:mt-14 md:mt-16"
          style={{
            perspective: anima3d ? "1600px" : undefined,
            // No mobile o painel é bem mais alto (tudo empilhado): cortar em
            // 62% engoliria os gráficos, então a máscara entra bem mais tarde.
            maskImage: `linear-gradient(to bottom, black ${ehDesktop ? "62%" : "88%"}, transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to bottom, black ${ehDesktop ? "62%" : "88%"}, transparent 100%)`,
          }}
        >
          <motion.div
            style={
              anima3d
                ? { rotateX, scale, opacity, transformOrigin: "center top", willChange: "transform" }
                : undefined
            }
          >
            <Suspense
              fallback={
                <div className="aspect-[16/12] w-full rounded-2xl border border-white/[0.08] bg-white/[0.02]" />
              }
            >
              <DashboardMockup />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
