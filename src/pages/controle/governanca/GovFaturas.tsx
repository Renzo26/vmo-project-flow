import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { StatusBadge } from "@/components/governanca/StatusBadge";
import { Carregando, Erro, Vazio } from "@/components/governanca/Estados";
import { govApi, type StatusFatura } from "@/lib/governanca/api";
import { brl, competenciaBr, dataBr, rotuloStatus } from "@/lib/governanca/formato";

/** `undefined` = "Todas". O filtro nao vai para a URL quando nao ha criterio. */
const FILTROS: { rotulo: string; status: StatusFatura | undefined }[] = [
  { rotulo: "Todas", status: undefined },
  { rotulo: "Recebidas", status: "recebida" },
  { rotulo: "Conciliadas", status: "conciliada" },
  { rotulo: "Divergentes", status: "divergente" },
  { rotulo: "Pendentes", status: "pendente" },
];

const th = "pb-2.5 pr-3 font-semibold";

export default function GovFaturas() {
  const [status, setStatus] = useState<StatusFatura | undefined>(undefined);
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");

  const filtros = { status, busca: buscaAplicada || undefined };

  const faturas = useQuery({
    queryKey: ["gov-faturas", filtros],
    queryFn: () => govApi.listarFaturas(filtros),
    placeholderData: keepPreviousData,
  });

  const lista = faturas.data ?? [];
  const total = lista.reduce((soma, f) => soma + Number(f.valor), 0);
  const filtrando = status !== undefined || buscaAplicada !== "";

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Faturas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Todas as faturas coletadas pelo agente, com o desfecho de cada uma.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted p-1 text-xs">
            {FILTROS.map((f) => (
              <button
                key={f.rotulo}
                onClick={() => setStatus(f.status)}
                className={`rounded-lg px-3 py-1.5 font-semibold ${
                  status === f.status
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.rotulo}
              </button>
            ))}
          </div>

          <form
            onSubmit={(evento) => {
              evento.preventDefault();
              setBuscaAplicada(busca.trim());
            }}
            className="ml-auto flex items-center gap-2"
          >
            <input
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Fornecedor, referencia ou pedido"
              className="w-64 rounded-lg border border-border bg-card px-3 py-1.5 text-xs outline-none focus:border-ink"
            />
            <button
              type="submit"
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Buscar
            </button>
            {buscaAplicada ? (
              <button
                type="button"
                onClick={() => {
                  setBusca("");
                  setBuscaAplicada("");
                }}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            ) : null}
          </form>
        </div>

        {faturas.isPending ? (
          <Carregando />
        ) : faturas.error ? (
          <Erro erro={faturas.error} aoTentarDeNovo={() => void faturas.refetch()} />
        ) : lista.length === 0 ? (
          filtrando ? (
            <Vazio
              titulo="Nenhuma fatura com esses criterios."
              descricao="O filtro e aplicado no servidor. Limpe a busca ou escolha outro status para ver a competencia inteira."
              acao={
                <button
                  onClick={() => {
                    setStatus(undefined);
                    setBusca("");
                    setBuscaAplicada("");
                  }}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                >
                  Limpar filtros
                </button>
              }
            />
          ) : (
            <Vazio
              titulo="Nenhuma fatura coletada ainda."
              descricao="A lista enche sozinha conforme o agente coleta as notas no portal ou no e-mail do fornecedor."
            />
          )
        ) : (
          <>
            <div className={`overflow-x-auto ${faturas.isFetching ? "opacity-60" : ""}`}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className={th}>Referencia</th>
                    <th className={th}>Fornecedor</th>
                    <th className={th}>Unidade</th>
                    <th className={th}>Pedido</th>
                    <th className={th}>Valor</th>
                    <th className={th}>Vencimento</th>
                    <th className={th}>Competencia</th>
                    <th className={th}>Canal</th>
                    <th className={th}>Status</th>
                    <th className="pb-2.5 text-right font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {lista.map((f) => {
                    const divergente =
                      f.valor_pedido !== null && Number(f.valor) !== Number(f.valor_pedido);
                    return (
                      <tr key={f.id} className="hover:bg-muted/60">
                        <td className="py-3 pr-3 font-mono text-[12px] text-muted-foreground">
                          {f.referencia}
                        </td>
                        <td className="py-3 pr-3">
                          <Link
                            to={`/controle/governanca/faturas/${f.id}`}
                            className="font-semibold hover:text-primary"
                          >
                            {f.fornecedor}
                          </Link>
                          <p className="text-[11px] text-muted-foreground">{f.servico}</p>
                        </td>
                        <td className="py-3 pr-3 text-muted-foreground">{f.unidade}</td>
                        <td className="py-3 pr-3 font-mono text-[12px]">{f.pedido ?? "—"}</td>
                        <td
                          className={`py-3 pr-3 font-mono font-medium ${divergente ? "text-red-600 dark:text-red-400" : ""}`}
                        >
                          {brl(f.valor)}
                        </td>
                        <td className="py-3 pr-3 text-muted-foreground">{dataBr(f.vencimento)}</td>
                        <td className="py-3 pr-3 text-muted-foreground">{competenciaBr(f.competencia)}</td>
                        <td className="py-3 pr-3 text-muted-foreground">{f.canal}</td>
                        <td className="py-3 pr-3">
                          <StatusBadge status={f.status} label={rotuloStatus(f.status)} />
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/controle/governanca/faturas/${f.id}`}
                            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                          >
                            Detalhes
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
              <span>
                {lista.length} fatura{lista.length === 1 ? "" : "s"}
                {filtrando ? " com os filtros aplicados" : ""}
              </span>
              <span className="font-mono font-semibold text-foreground">Soma: {brl(total)}</span>
            </div>
          </>
        )}
      </section>
    </>
  );
}
