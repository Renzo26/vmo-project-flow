import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import Reveal from "@/components/welcome/Reveal";

const METRICAS = [
  { alvo: 18, prefixo: "+", sufixo: "%", texto: "de economia média em contratos" },
  { alvo: 35, prefixo: "−", sufixo: "%", texto: "no ciclo de contratação" },
  { alvo: 100, prefixo: "", sufixo: "%", texto: "de rastreabilidade das aprovações" },
  { alvo: 4, prefixo: "", sufixo: "x", texto: "mais rápido para comparar propostas" },
] as const;

/** Número que conta de 0 até o alvo quando entra na tela. */
const Contador = ({
  alvo,
  prefixo,
  sufixo,
}: {
  alvo: number;
  prefixo: string;
  sufixo: string;
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const naTela = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (reduced) {
      setValor(alvo);
      return;
    }
    if (!naTela) return;
    const duracao = 1100;
    const inicio = performance.now();
    let frame = requestAnimationFrame(function tick(agora) {
      const t = Math.min((agora - inicio) / duracao, 1);
      // easeOutExpo — desacelera no fim
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValor(Math.round(eased * alvo));
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [naTela, alvo, reduced]);

  return (
    <p
      ref={ref}
      className="font-display text-4xl font-bold tabular-nums tracking-tight sm:text-5xl"
    >
      {prefixo}
      {valor}
      {sufixo}
    </p>
  );
};

/** Seção "Resultados" — números de impacto com contagem animada. */
const Resultados = () => (
  <section className="relative overflow-hidden bg-[#04080a] px-5 py-20 sm:px-8 md:px-12 md:py-24">
    <div className="relative mx-auto w-full max-w-[1280px]">
      <Reveal className="max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
          Resultados
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          O que muda quando tudo é medido
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-8">
        {METRICAS.map((m, i) => (
          <Reveal key={m.texto} delay={i * 0.1}>
            <div className="border-t border-white/12 pt-5">
              <Contador alvo={m.alvo} prefixo={m.prefixo} sufixo={m.sufixo} />
              <p className="mt-2 text-[13px] leading-snug text-white/55 sm:text-sm">{m.texto}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Resultados;
