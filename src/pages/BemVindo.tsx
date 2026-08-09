import { useEffect } from "react";
import Hero from "@/components/landing/Hero";
import Modulos from "@/components/landing/Modulos";
import Recursos from "@/components/landing/Recursos";
import SobreNos from "@/components/landing/SobreNos";
import AgendeDemonstracao from "@/components/landing/AgendeDemonstracao";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

/** Landing pública do Metri — apresentação institucional antes do login. */
const BemVindo = () => {
  useSmoothScroll();

  useEffect(() => {
    const prev = document.title;
    document.title = "Metri — Vendor Management System";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    // overflow-x-hidden: os brilhos decorativos vazam de propósito para fora
    // das seções e não podem gerar rolagem horizontal no mobile.
    <div className="bg-fundo w-full overflow-x-hidden font-sans text-white antialiased">
      <Hero />
      <Modulos />
      <Recursos />
      <SobreNos />
      <AgendeDemonstracao />
    </div>
  );
};

export default BemVindo;
