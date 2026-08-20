import { useNavigate } from "react-router-dom";

const COLUNAS = [
  {
    titulo: "Produto",
    itens: [
      { label: "Módulos", target: "#modulos" },
      { label: "Como funciona", target: "#como-funciona" },
      { label: "Recursos", target: "#recursos" },
    ],
  },
  {
    titulo: "Empresa",
    itens: [{ label: "Sobre nós", target: "#sobre" }],
  },
] as const;

/** Rodapé do site institucional. */
const Rodape = () => {
  const navigate = useNavigate();

  const irPara = (target: string) =>
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <footer className="border-t border-white/[0.08] bg-[#04080a] px-5 py-12 sm:px-8 md:px-12">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Marca */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <img src="/logo-metri-mark.png" alt="Metri" className="h-8 w-8 object-contain" />
              <span className="font-display text-xl font-semibold lowercase tracking-tight">
                metri
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/45">
              Vendor Management System para gestão de contratos de TI — medição,
              comparação e governança em um só lugar.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12 sm:gap-16">
            {COLUNAS.map((col) => (
              <div key={col.titulo}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  {col.titulo}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.itens.map((item) => (
                    <li key={item.label}>
                      <button
                        onClick={() => irPara(item.target)}
                        className="text-sm text-white/65 transition-colors hover:text-white"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Acesso
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-sm text-white/65 transition-colors hover:text-white"
                  >
                    Entrar
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/fornecedor-login")}
                    className="text-sm text-white/65 transition-colors hover:text-white"
                  >
                    Portal do fornecedor
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/[0.08] pt-6">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Metri — Vendor Management System
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Rodape;
