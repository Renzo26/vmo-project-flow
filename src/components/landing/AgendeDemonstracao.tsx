import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarCheck } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import TextoRevelado from "@/components/landing/TextoRevelado";

/** Número comercial no formato aceito pelo wa.me (DDI + DDD + número). */
const WHATSAPP = "5511955877399";
const WHATSAPP_EXIBICAO = "+55 11 95587-7399";
const MENSAGEM = "Olá! Gostaria de agendar uma demonstração do Metri.";

const linkWhatsApp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM)}`;

/** Glifo do WhatsApp — o lucide-react não traz ícones de marca. */
function IconeWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}

/**
 * CTA final — cartão no gradiente da marca (versão clara) com texto escuro,
 * conforme design-system-metri.md §7.5.
 */
export default function AgendeDemonstracao() {
  const navigate = useNavigate();

  return (
    <section
      id="acesso"
      className="bg-fundo relative px-4 py-16 sm:px-8 sm:py-20 md:px-12 md:py-28"
    >
      <Reveal className="mx-auto w-full max-w-[1080px]">
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 py-12 text-center sm:rounded-[1.75rem] sm:px-12 sm:py-14 md:py-20"
          style={{
            background:
              "radial-gradient(120% 140% at 100% 0%, hsl(158 70% 78%) 0%, transparent 60%), linear-gradient(135deg, hsl(158 70% 78%) 0%, hsl(172 62% 52%) 55%, hsl(178 72% 34%) 100%)",
            color: "hsl(178 62% 11%)",
          }}
        >
          {/* Brilhos decorativos do card hero */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <CalendarCheck className="h-3.5 w-3.5" />
              Agende uma demonstração
            </span>

            <h2 className="font-display mx-auto mt-6 max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-[2.75rem]">
              <TextoRevelado texto="Veja o Metri medindo os seus contratos" />
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed opacity-75 sm:text-base">
              Marque uma conversa de 30 minutos: mostramos o fluxo completo, da solicitação à
              contagem de pontos de função, da proposta ao contrato, com os seus próprios números.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={linkWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="ease-expo group flex h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-full bg-teal-950 px-8 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-teal-950/90 active:scale-[0.98] sm:w-auto"
              >
                <IconeWhatsApp className="h-5 w-5" />
                Falar no WhatsApp
              </a>

              <button
                onClick={() => navigate("/")}
                className="ease-expo group flex h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-full border border-teal-950/30 px-8 text-[15px] font-semibold transition-colors duration-300 hover:bg-teal-950/10 sm:w-auto"
              >
                Ver o painel
                <ArrowRight className="ease-expo h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            <p className="mt-6 text-sm font-medium tabular-nums opacity-70">
              Ou ligue: {WHATSAPP_EXIBICAO}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
