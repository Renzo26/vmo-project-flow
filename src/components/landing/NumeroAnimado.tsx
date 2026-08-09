import { useEffect, useRef, useState } from "react";
import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { EASE } from "@/components/landing/Reveal";

interface NumeroAnimadoProps {
  valor: number;
  /** Casas decimais exibidas. */
  decimais?: number;
  prefixo?: string;
  sufixo?: string;
  /** Duração da contagem, em segundos. */
  duracao?: number;
  className?: string;
}

/**
 * Conta de zero até o valor quando entra na viewport.
 * Faz sentido para o Metri: o produto é sobre medir, então os números
 * literalmente se medem na frente de quem lê.
 */
export default function NumeroAnimado({
  valor,
  decimais = 0,
  prefixo = "",
  sufixo = "",
  duracao = 1.8,
  className,
}: NumeroAnimadoProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const emVista = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);

  const formatador = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  });

  const [exibido, setExibido] = useState(() => formatador.format(reduced ? valor : 0));

  useEffect(() => {
    if (!emVista) return;

    const nf = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimais,
      maximumFractionDigits: decimais,
    });

    if (reduced) {
      setExibido(nf.format(valor));
      return;
    }

    const controles = animate(mv, valor, {
      duration: duracao,
      ease: EASE,
      onUpdate: (v) => setExibido(nf.format(v)),
    });

    return () => controles.stop();
  }, [emVista, valor, decimais, duracao, reduced, mv]);

  return (
    <span ref={ref} className={className}>
      {prefixo}
      {exibido}
      {sufixo}
    </span>
  );
}
