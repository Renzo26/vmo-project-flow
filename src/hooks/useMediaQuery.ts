import { useEffect, useState } from "react";

/**
 * Acompanha uma media query. Usado para desligar efeitos 3D em telas
 * pequenas — inclinação em perspectiva estoura o layout no mobile e não
 * tem como ser acionada sem cursor.
 */
export function useMediaQuery(query: string): boolean {
  const [combina, setCombina] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const aoMudar = () => setCombina(mql.matches);

    aoMudar();
    mql.addEventListener("change", aoMudar);
    return () => mql.removeEventListener("change", aoMudar);
  }, [query]);

  return combina;
}

/** `true` a partir do breakpoint md (768px) do Tailwind. */
export const useEhDesktop = () => useMediaQuery("(min-width: 768px)");
