import { useLayoutEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/lenis";

/**
 * Scroll suave da página inteira. Cria uma única instância do Lenis.
 * Desligado quando o usuário pede menos movimento.
 */
export function useSmoothScroll(): void {
  useLayoutEffect(() => {
    const querMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (querMenosMovimento) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    setLenis(lenis);

    let frame = 0;
    const raf = (tempo: number) => {
      lenis.raf(tempo);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // O Lenis não intercepta âncoras sozinho: sem isto, todo <a href="#secao">
    // daria um salto instantâneo e quebraria a suavidade. Links de rota real
    // (ex.: para /fornecedor-login) não começam com "#" e passam direto.
    const aoClicar = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

      const link = (e.target as HTMLElement | null)?.closest?.("a");
      const href = link?.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const alvo = document.querySelector(href);
      if (!alvo) return;

      e.preventDefault();
      lenis.scrollTo(alvo as HTMLElement, { offset: -24 });
    };
    document.addEventListener("click", aoClicar);

    return () => {
      document.removeEventListener("click", aoClicar);
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, []);
}
