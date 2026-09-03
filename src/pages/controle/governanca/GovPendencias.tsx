import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Carregando, Erro, Vazio } from "@/components/governanca/Estados";
import { govApi, type TipoPendencia } from "@/lib/governanca/api";
import { brl, competenciaBr, dataHoraBr } from "@/lib/governanca/formato";

const TIPOS: TipoPendencia[] = [
  "Valor diferente",
  "Pedido não encontrado",
  "Unidade não identificada",
  "Sem contrato cadastrado",
];

const CLASSE_PRIORIDADE: Record<string, string> = {
  Alta: "bg-red-500/10 text-red-600 dark:text-red-400",
  Média: "bg-amber/15 text-amber-600 dark:text-amber-400",
  Baixa: "bg-primary/10 text-primary",
};

export default function GovPendencias() {
  const [tipo, setTipo] = useState<TipoPendencia | null>(null);

  const pendencias = useQuery({
    queryKey: ["gov-pendencias"],
    queryFn: govApi.listarPendencias,
  });

  const todas = pendencias.data ?? [];
  const lista = tipo ? todas.filter((p) => p.tipo === tipo) : todas;
  const retido = todas
    .filter((p) => p.prioridade === "Alta")
    .reduce((soma, p) => soma + Number(p.valor), 0);

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Pendencias e divergencias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fila de triagem das faturas que nao passaram na medicao ou na conferencia com o pedido.
        </p>
      </div>

      {pendencias.isPending ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <Carregando texto="Carregando a fila..." />
        </div>
      ) : pendencias.error ? (
        <Erro erro={pendencias.error} aoTentarDeNovo={() => void pendencias.refetch()} />
      ) : todas.length === 0 ? (
        <Vazio
          titulo="Fila vazia."
          descricao="Nenhuma fatura barrada: tudo que o agente processou passou na medicao e fechou com o pedido do Linx. Fila vazia e o resultado desejado, nao falta de dado."
          acao={
            <Link
              to="/controle/governanca/faturas"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              Ver as faturas processadas
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIPOS.map((t) => {
              const total = todas.filter((p) => p.tipo === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setTipo((atual) => (atual === t ? null : t))}
                  className={`rounded-2xl border p-4 text-left shadow-sm ${
                    tipo === t ? "border-ink bg-muted" : "border-border bg-card hover:bg-muted/60"
                  }`}
                >
                  <p className="text-xs font-medium text-muted-foreground">{t}</p>
                  <p className="mt-2 font-mono text-3xl font-bold">{total}</p>
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                    {tipo === t ? "filtro ativo · clique para limpar" : "casos abertos"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/[0.04] p-4">
            <p className="text-xs font-medium text-muted-foreground">Retido em pendencias de prioridade alta</p>
            <p className="mt-1 font-mono text-xl font-bold text-red-600 dark:text-red-400">{brl(retido)}</p>
          </div>

          <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-base font-bold tracking-tight">Fila de tratamento</h2>
              <span className="text-xs text-muted-foreground">
                {lista.length} de {todas.length}
              </span>
              {tipo ? (
                <button
                  onClick={() => setTipo(null)}
                  className="ml-auto text-xs font-semibold text-primary hover:underline"
                >
                  Limpar filtro
                </button>
              ) : null}
            </div>

            {lista.length === 0 ? (
              <Vazio
                titulo={`Nenhuma pendencia do tipo "${tipo}".`}
                descricao="Os outros tipos continuam com casos abertos — clique de novo no cartao para ver a fila inteira."
              />
            ) : (
              <div className="space-y-3">
                {lista.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border bg-muted/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{p.tipo}</p>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                              CLASSE_PRIORIDADE[p.prioridade] ?? "bg-muted text-muted-foreground"
                            }`}
                          >
                            {p.prioridade}
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {p.referencia} · {p.fornecedor} · {p.unidade}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">{p.descricao}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold">{brl(p.valor)}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {competenciaBr(p.competencia)} · aberta em {dataHoraBr(p.aberta_em)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Responsavel: {p.responsavel}</p>
                      </div>
                    </div>

                    {p.fatura_id !== null ? (
                      <div className="mt-3 flex justify-end">
                        <Link
                          to={`/controle/governanca/faturas/${p.fatura_id}`}
                          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                        >
                          Abrir dossie da fatura
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
