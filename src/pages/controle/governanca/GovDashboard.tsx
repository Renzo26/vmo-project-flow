import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/governanca/StatusBadge";
import { Carregando, Erro, Vazio } from "@/components/governanca/Estados";
import { govApi, type FaturaResumo } from "@/lib/governanca/api";
import { brl, competenciaBr, dataHoraBr, rotuloStatus } from "@/lib/governanca/formato";

export default function GovDashboard() {
  const indicadores = useQuery({
    queryKey: ["gov-indicadores"],
    queryFn: govApi.obterIndicadores,
  });

  const faturas = useQuery({
    queryKey: ["gov-faturas", {}],
    queryFn: () => govApi.listarFaturas(),
  });

  const lista = faturas.data ?? [];

  const atencao = lista.filter((f) => f.status === "divergente" || f.status === "pendente");

  const dados = indicadores.data;

  type Cartao = { rotulo: string; valor: string; tom: string; nota?: string | undefined };

  const cartoes: Cartao[] = dados
    ? [
        { rotulo: "Pendentes", valor: String(dados.pendentes), tom: "risk" },
        { rotulo: "Divergentes", valor: String(dados.divergentes), tom: "amber" },
        { rotulo: "Processadas", valor: String(dados.conciliadas), tom: "ok" },
      ]
    : [];

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Governanca</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dados
            ? `Competencia ${competenciaBr(dados.competencia)} · ultima execucao do agente em ${dataHoraBr(dados.ultima_execucao)}`
            : "Acompanhamento das faturas recorrentes processadas pelo agente."}
        </p>
      </div>

      <section className="mb-5">
        {indicadores.isPending ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <Carregando texto="Somando a competencia..." />
          </div>
        ) : indicadores.error ? (
          <Erro erro={indicadores.error} aoTentarDeNovo={() => void indicadores.refetch()} />
        ) : dados && dados.total_faturas === 0 ? (
          <Vazio
            titulo="Nenhuma fatura nesta competencia."
            descricao="Os numeros aparecem depois que o agente processar a primeira nota do mes. Ate la nao ha o que somar."
          />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              {cartoes.map((c) => {
                const borda =
                  c.tom === "risk"
                    ? "border-red-500/20 bg-red-500/[0.04]"
                    : c.tom === "amber"
                      ? "border-amber/20 bg-amber/[0.05]"
                      : "border-green-500/20 bg-green-500/[0.04]";
                const cor =
                  c.tom === "risk" ? "text-red-600 dark:text-red-400" : c.tom === "amber" ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400";
                return (
                  <div key={c.rotulo} className={`rounded-2xl border p-4 shadow-sm ${borda}`}>
                    <p className="text-xs font-medium text-muted-foreground">{c.rotulo}</p>
                    <p className={`mt-2 font-mono text-2xl font-bold ${cor}`}>{c.valor}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{c.nota ?? " "}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Dinheiro rotulo="Total faturado" valor={dados?.valor_total} />
              <Dinheiro rotulo="Liberado para pagamento" valor={dados?.valor_liberado} tom="ok" />
              <Dinheiro rotulo="Retido pela medicao" valor={dados?.valor_retido} tom="amber" />
            </div>
          </>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">Faturas recentes</h2>
            <Link to="/controle/governanca/faturas" className="text-sm font-semibold text-primary hover:underline">
              Ver todas →
            </Link>
          </div>

          {faturas.isPending ? (
            <Carregando />
          ) : faturas.error ? (
            <Erro erro={faturas.error} aoTentarDeNovo={() => void faturas.refetch()} />
          ) : lista.length === 0 ? (
            <Vazio
              titulo="Nenhuma fatura processada ainda."
              descricao="Assim que o agente coletar a primeira nota, ela aparece aqui com o resultado da medicao."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2.5 pr-3 font-semibold">Fornecedor</th>
                    <th className="pb-2.5 pr-3 font-semibold">Unidade</th>
                    <th className="pb-2.5 pr-3 font-semibold">Valor</th>
                    <th className="pb-2.5 pr-3 font-semibold">Competencia</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {lista.slice(0, 6).map((f) => (
                    <tr key={f.id} className="hover:bg-muted/60">
                      <td className="py-3 pr-3">
                        <Link
                          to={`/controle/governanca/faturas/${f.id}`}
                          className="font-semibold hover:text-primary"
                        >
                          {f.fornecedor}
                        </Link>
                        <p className="font-mono text-[11px] text-muted-foreground">{f.referencia}</p>
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{f.unidade}</td>
                      <td className="py-3 pr-3 font-mono font-medium">{brl(f.valor)}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{competenciaBr(f.competencia)}</td>
                      <td className="py-3">
                        <StatusBadge status={f.status} label={rotuloStatus(f.status)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">Precisam de atencao</h2>
            <Link to="/controle/governanca/pendencias" className="text-sm font-semibold text-primary hover:underline">
              Fila →
            </Link>
          </div>

          {faturas.isPending ? (
            <Carregando />
          ) : faturas.error ? (
            <Erro erro={faturas.error} />
          ) : atencao.length === 0 ? (
            <Vazio
              titulo="Nada travado."
              descricao="Todas as faturas processadas passaram na medicao e na conferencia com o pedido."
            />
          ) : (
            <div className="space-y-3">
              {atencao.slice(0, 4).map((f) => (
                <CartaoAtencao key={f.id} fatura={f} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Dinheiro({
  rotulo,
  valor,
  tom,
}: {
  rotulo: string;
  valor: string | undefined;
  tom?: "ok" | "amber" | undefined;
}) {
  const cor = tom === "ok" ? "text-green-600 dark:text-green-400" : tom === "amber" ? "text-amber-600 dark:text-amber-400" : "";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{rotulo}</p>
      <p className={`mt-1 font-mono text-xl font-bold ${cor}`}>{brl(valor)}</p>
    </div>
  );
}

function CartaoAtencao({ fatura }: { fatura: FaturaResumo }) {
  const excesso =
    fatura.valor_pedido !== null ? Number(fatura.valor) - Number(fatura.valor_pedido) : null;

  return (
    <div className="rounded-xl border border-border bg-muted/50 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{fatura.fornecedor}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {fatura.referencia} · {fatura.unidade}
          </p>
        </div>
        <StatusBadge status={fatura.status} label={rotuloStatus(fatura.status)} />
      </div>
      <p className="mt-2 font-mono text-sm font-bold">{brl(fatura.valor)}</p>
      {excesso !== null && excesso !== 0 ? (
        <p className="mt-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
          {excesso > 0 ? "+" : "−"}
          {brl(Math.abs(excesso))} em relacao ao pedido {fatura.pedido ?? "—"}
        </p>
      ) : (
        <p className="mt-1 text-[11px] text-muted-foreground">Sem pedido conferido no Linx.</p>
      )}
      <Link
        to={`/controle/governanca/faturas/${fatura.id}`}
        className="mt-3 block rounded-lg border border-border bg-card py-1.5 text-center text-xs font-semibold text-primary hover:bg-primary/10"
      >
        Abrir dossie
      </Link>
    </div>
  );
}
