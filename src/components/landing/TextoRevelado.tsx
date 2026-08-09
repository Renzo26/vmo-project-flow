import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/landing/Reveal";

interface TextoReveladoProps {
  texto: string;
  /** Atraso inicial, em segundos. */
  delay?: number;
  /** Intervalo entre palavras, em segundos. */
  intervalo?: number;
  className?: string;
  /** Dispara na entrada em viewport (padrão) ou imediatamente, no load. */
  gatilho?: "viewport" | "imediato";
}

/**
 * Revela o texto palavra a palavra, cada uma subindo de dentro de uma
 * máscara.
 */
export default function TextoRevelado({
  texto,
  delay = 0,
  intervalo = 0.045,
  className,
  gatilho = "viewport",
}: TextoReveladoProps) {
  const reduced = useReducedMotion();
  const palavras = texto.split(" ");

  if (reduced) return <span className={className}>{texto}</span>;

  const animacao = { y: "0%" };
  const viewport = { once: true, margin: "-80px" } as const;

  return (
    <span className={className}>
      {palavras.map((palavra, i) => (
        // A máscara precisa de folga embaixo para não cortar descendentes (g, p, q).
        <span
          key={`${palavra}-${i}`}
          className="mr-[0.25em] inline-block overflow-hidden pb-[0.14em] align-bottom"
          style={{ marginBottom: "-0.14em" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            {...(gatilho === "viewport"
              ? { whileInView: animacao, viewport }
              : { animate: animacao })}
            transition={{ duration: 0.85, delay: delay + i * intervalo, ease: EASE }}
          >
            {palavra}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
