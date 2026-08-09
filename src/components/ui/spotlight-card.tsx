import { useRef, useState, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Cor do holofote que segue o cursor. Padrão: teal da marca. */
  spotlightColor?: string;
}

/**
 * Card com holofote radial que acompanha o cursor.
 * Base: "Spotlight Card" de @berkcangumusisik (21st.dev), com os
 * defaults trocados para a linguagem visual do Metri.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(45, 212, 191, 0.16)",
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "ease-expo relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-[transform,border-color,background-color] duration-500 hover:-translate-y-1 hover:border-teal-300/25 hover:bg-white/[0.05]",
        className,
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
