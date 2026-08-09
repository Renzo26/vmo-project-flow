import type Lenis from "lenis";

/**
 * Handle de módulo para a única instância do Lenis, para que utilidades
 * simples (rolar até uma âncora) a alcancem sem prop drilling nem contexto.
 * Definido por useSmoothScroll e limpo no unmount.
 */
let instancia: Lenis | null = null;

export function setLenis(l: Lenis | null): void {
  instancia = l;
}

export function getLenis(): Lenis | null {
  return instancia;
}

/** Rola suavemente até um seletor. Cai no scroll nativo se o Lenis não estiver ativo. */
export function rolarPara(seletor: string): void {
  const alvo = document.querySelector(seletor);
  if (!alvo) return;

  const lenis = getLenis();
  if (lenis) lenis.scrollTo(alvo as HTMLElement, { offset: -24 });
  else alvo.scrollIntoView({ behavior: "smooth", block: "start" });
}
