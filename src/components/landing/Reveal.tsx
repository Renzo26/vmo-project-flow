import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

interface RevealProps {
  children: ReactNode;
  /** Atraso da entrada, em segundos. */
  delay?: number;
  className?: string;
}

/** Entrada padrão das seções: fade + slide-up de 28px, uma vez só. */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
