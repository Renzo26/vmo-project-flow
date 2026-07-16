import { useEffect, useState } from "react";

/** Chave de sessão — a splash toca uma única vez por aba/sessão. */
const KEY = "metri.splash.shown";

interface SplashScreenProps {
  /** Disparado quando a splash começa a sair (ou quando não vai exibir). */
  onFinish?: () => void;
}

/**
 * Splash screen de abertura: animação do logo Metri (vídeo ~4s, sem som)
 * sobre o mesmo fundo claro do vídeo, com máscara radial para fundir as
 * bordas. Sai com fade e nunca prende o usuário: clique pula, erro no
 * vídeo pula, e há um failsafe de tempo máximo.
 */
const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"playing" | "leaving" | "done">(() =>
    sessionStorage.getItem(KEY) || window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "done"
      : "playing",
  );

  const dismiss = () => {
    sessionStorage.setItem(KEY, "1");
    setPhase((p) => (p === "playing" ? "leaving" : p));
    onFinish?.();
  };

  // Se a splash não vai exibir (já vista / reduced-motion), avisa na montagem
  useEffect(() => {
    if (phase === "done") onFinish?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fade-out: 650ms após entrar em "leaving", desmonta
  useEffect(() => {
    if (phase !== "leaving") return;
    const t = window.setTimeout(() => setPhase("done"), 650);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Failsafe: nunca segurar a tela por mais de 5,5s
  useEffect(() => {
    if (phase !== "playing") return;
    const t = window.setTimeout(dismiss, 5500);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      onClick={dismiss}
      aria-hidden
      className={`fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-[#f1f1f1] transition-opacity duration-[650ms] ease-expo ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <video
        src="/splash-metri.mp4"
        autoPlay
        muted
        playsInline
        onEnded={dismiss}
        onError={dismiss}
        className="w-[min(72vw,460px)] [mask-image:radial-gradient(72%_72%_at_50%_50%,#000_52%,transparent_92%)]"
      />
    </div>
  );
};

export default SplashScreen;
