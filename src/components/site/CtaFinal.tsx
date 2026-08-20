import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/welcome/Reveal";

/** CTA de fechamento — cartão com o gradiente da marca. */
const CtaFinal = () => {
  const navigate = useNavigate();

  return (
    <section id="acesso" className="bg-[#04080a] px-5 pb-20 sm:px-8 md:px-12 md:pb-28">
      <Reveal className="mx-auto w-full max-w-[1280px]">
        <div
          className="relative overflow-hidden rounded-[1.75rem] px-6 py-12 text-center sm:px-10 md:py-16"
          style={{
            background:
              "radial-gradient(110% 140% at 100% 0%, hsl(158 70% 82%) 0%, transparent 58%), linear-gradient(135deg, hsl(158 70% 78%) 0%, hsl(172 62% 52%) 55%, hsl(178 72% 34%) 100%)",
          }}
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/30 blur-3xl" />

          <h2 className="relative mx-auto max-w-lg font-display text-3xl font-bold leading-tight tracking-tight text-teal-950 sm:text-4xl">
            Pronto para colocar os números no controle?
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-sm font-medium leading-relaxed text-teal-950/70 sm:text-[15px]">
            Entre com a sua conta ou acesse o portal do fornecedor para
            responder propostas.
          </p>

          <div className="relative mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => navigate("/")}
              className="flex h-12 items-center justify-center gap-2.5 rounded-full bg-teal-950 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-teal-900"
            >
              Acessar plataforma
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/fornecedor-login")}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-teal-950/30 px-7 text-[15px] font-semibold text-teal-950 transition-colors hover:bg-teal-950/10"
            >
              Portal do fornecedor
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default CtaFinal;
