import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface RevealProps {
  children: ReactNode;
  /** Atraso em segundos para escalonar elementos vizinhos. */
  delay?: number;
  /** Deslocamento vertical inicial (px). */
  y?: number;
  className?: string;
}

/** Curva de easing usada em todas as entradas da página de boas-vindas. */
export const EASE = [0.22, 0.61, 0.36, 1] as const;

/**
 * Wrapper de animação de entrada: fade + slide-up disparado quando o
 * elemento entra no viewport. Respeita prefers-reduced-motion.
 */
const Reveal = ({ children, delay = 0, y = 28, className }: RevealProps) => {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
