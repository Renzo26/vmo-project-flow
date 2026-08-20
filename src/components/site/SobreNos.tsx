import Reveal from "@/components/welcome/Reveal";

const PILARES = [
  {
    titulo: "Medir antes de contratar",
    texto:
      "Pontos de função dão uma base objetiva para negociar — o preço deixa de ser opinião e passa a ser comparação.",
  },
  {
    titulo: "Um só lugar",
    texto:
      "Solicitante, fornecedor e governança trabalham sobre os mesmos números, sem retrabalho e sem versão paralela.",
  },
  {
    titulo: "Histórico que serve",
    texto:
      "Cada decisão fica registrada com autor, data e justificativa — auditoria deixa de ser um projeto à parte.",
  },
] as const;

/** Seção "Sobre nós" — posicionamento do produto. */
const SobreNos = () => (
  <section id="sobre" className="relative overflow-hidden bg-[#04080a] px-5 py-20 sm:px-8 md:px-12 md:py-28">
    <div className="pointer-events-none absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-teal-500/[0.06] blur-3xl" />

    <div className="relative mx-auto grid w-full max-w-[1280px] gap-12 lg:grid-cols-[minmax(280px,420px)_1fr] lg:gap-16">
      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
          Sobre nós
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Nascido dentro de um VMO de verdade
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-white/55">
          O Metri foi construído a partir da operação de contratação de TI da
          Braesp — das planilhas que não fechavam, das propostas difíceis de
          comparar e das aprovações perdidas em e-mail.
        </p>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
        {PILARES.map((p, i) => (
          <Reveal key={p.titulo} delay={i * 0.1} className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <span className="h-1 w-8 rounded-full bg-teal-300/70" />
              <h3 className="mt-5 font-display text-base font-semibold leading-snug">
                {p.titulo}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-white/55">{p.texto}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default SobreNos;
