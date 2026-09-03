import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/governanca/StatusBadge";
import { Carregando, Erro, Vazio } from "@/components/governanca/Estados";
import {
  ErroNaoEncontrado,
  govApi,
  type ConferenciaFatura,
  type MedicaoFatura,
} from "@/lib/governanca/api";
import { brl, competenciaBr, dataBr, dataHoraBr, rotuloStatus } from "@/lib/governanca/formato";

export default function GovFaturaDetalhe() {
  const { faturaId } = useParams();
  const id = Number(faturaId);
  const idValido = Number.isInteger(id) && id > 0;

  const fatura = useQuery({
    queryKey: ["gov-fatura", id],
    queryFn: () => govApi.obterFatura(id),
    enabled: idValido,
    retry: (tentativas, erro) => !(erro instanceof ErroNaoEncontrado) && tentativas < 2,
  });

  if (!idValido) {
    return (
      <Moldura titulo="Identificador invalido">
        <Vazio
          titulo={`"${faturaId}" nao e um identificador de fatura.`}
          descricao="O endereco do dossie usa o id numerico devolvido pela API. Volte a lista e abra a fatura por la."
          acao={<VoltarParaLista />}
        />
      </Moldura>
    );
  }

  if (fatura.isPending) {
    return (
      <Moldura titulo="Fatura">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <Carregando texto="Buscando o dossie..." />
        </div>
      </Moldura>
    );
  }

  if (fatura.error) {
    const naoExiste = fatura.error instanceof ErroNaoEncontrado;
    return (
      <Moldura titulo={naoExiste ? "Fatura nao encontrada" : "Fatura"}>
        {naoExiste ? (
          <Vazio
            titulo={fatura.error.message}
            descricao="Ela pode ter sido removida ou o identificador veio de um link antigo."
            acao={<VoltarParaLista />}
          />
        ) : (
          <Erro erro={fatura.error} aoTentarDeNovo={() => void fatura.refetch()} />
        )}
      </Moldura>
    );
  }

  const f = fatura.data;

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">{f.referencia}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {f.fornecedor} · {f.unidade} · {competenciaBr(f.competencia)}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link to="/controle/governanca/faturas" className="text-sm font-semibold text-primary hover:underline">
          ← Todas as faturas
        </Link>
        <StatusBadge status={f.status} label={rotuloStatus(f.status)} />
        <span className="font-mono text-xs text-muted-foreground">
          {f.fornecedor_cnpj} · pedido {f.pedido ?? "—"} · emissao {dataBr(f.emissao)} ·
          vencimento {dataBr(f.vencimento)}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 text-[11px] uppercase tracking-wide text-muted-foreground">
              Dados extraidos do documento
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Dado rotulo="Servico" valor={f.servico} />
              <Dado rotulo="Canal de entrada" valor={f.canal} />
              <Dado rotulo="Valor faturado" valor={brl(f.valor)} mono />
              <Dado rotulo="Valor do pedido" valor={brl(f.valor_pedido)} mono />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Processado em {dataHoraBr(f.processado_em)}
            </p>
          </section>

          <BlocoMedicao medicao={f.medicao} />
          <BlocoConferencia conferencia={f.conferencia} />

          {f.protocolo_linx || f.destinatario_rascunho ? (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                Desfecho registrado
              </p>
              {f.protocolo_linx ? (
                <p className="text-sm">
                  Devolvido no Linx sob o protocolo{" "}
                  <span className="font-mono font-bold">{f.protocolo_linx}</span>.
                </p>
              ) : null}
              {f.destinatario_rascunho ? (
                <p className="mt-2 text-sm">
                  Rascunho de devolucao enderecado a{" "}
                  <span className="font-mono font-semibold">{f.destinatario_rascunho}</span>.
                </p>
              ) : null}
            </section>
          ) : null}
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 text-[11px] uppercase tracking-wide text-muted-foreground">
              Arquivos do dossie
            </p>
            {f.arquivos.length === 0 ? (
              <Vazio
                titulo="Nenhum arquivo arquivado."
                descricao="A renomeacao e o arquivamento so acontecem depois que a conferencia com o pedido fecha."
              />
            ) : (
              <ul className="space-y-3">
                {f.arquivos.map((a) => (
                  <li key={a.hash_sha256} className="rounded-xl border border-border bg-muted/40 p-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                        {a.tipo}
                      </span>
                      <span className="truncate font-mono text-[11px] text-muted-foreground">
                        {a.nome_origem}
                      </span>
                    </div>
                    <p className="mt-2 break-words font-mono text-[11px] font-semibold">
                      {a.nome_final ?? "— ainda nao renomeado —"}
                    </p>
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                      sha256 {a.hash_sha256}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 text-[11px] uppercase tracking-wide text-muted-foreground">
              Trilha do processamento
            </p>
            {f.trilha.length === 0 ? (
              <Vazio
                titulo="Sem trilha registrada."
                descricao="A fatura foi recebida, mas o agente ainda nao executou as etapas sobre ela."
              />
            ) : (
              <ol className="space-y-3">
                {f.trilha.map((linha, indice) => (
                  <li key={`${indice}-${linha}`} className="flex gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-steel" />
                    <span className="text-xs leading-relaxed">{linha}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function Moldura({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">{titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Dossie da fatura processada pelo agente.</p>
      </div>
      {children}
    </>
  );
}

function VoltarParaLista() {
  return (
    <Link
      to="/controle/governanca/faturas"
      className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
    >
      ← Voltar para faturas
    </Link>
  );
}

function BlocoMedicao({ medicao }: { medicao: MedicaoFatura | null }) {
  if (!medicao) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="mb-3 text-[11px] uppercase tracking-wide text-muted-foreground">
          Medicao contra o contrato
        </p>
        <Vazio
          titulo="Esta fatura nao chegou a ser medida."
          descricao="Sem contrato cadastrado para o fornecedor, ou sem os dados minimos extraidos, a etapa 4 nao roda — e nada e comparado."
          acao={
            <Link
              to="/controle/governanca/contratos"
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Ver contratos
            </Link>
          }
        />
      </section>
    );
  }

  const divergencia = Number(medicao.divergencia);
  const aderente = divergencia <= 0;

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${
        aderente ? "border-green-500/30 bg-green-500/[0.04]" : "border-red-500/30 bg-red-500/[0.04]"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Medicao contra o contrato · etapa 4
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            aderente ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {medicao.situacao}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dado rotulo="Contrato" valor={medicao.contrato_numero ?? "—"} mono />
        <Dado rotulo="Item contratado" valor={medicao.item_contratado ?? "—"} />
        <Dado rotulo="Contratado" valor={brl(medicao.valor_contratado)} mono />
        <Dado rotulo="Cobrado" valor={brl(medicao.valor_cobrado)} mono />
      </div>

      <p className={`mt-3 font-mono text-sm font-bold ${aderente ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
        Divergencia {brl(medicao.divergencia)} ({Number(medicao.divergencia_percentual).toFixed(2)}
        %)
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{medicao.explicacao}</p>
      {medicao.motivo && medicao.motivo !== "Nenhum" ? (
        <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">Motivo: {medicao.motivo}</p>
      ) : null}
    </section>
  );
}

function BlocoConferencia({ conferencia }: { conferencia: ConferenciaFatura | null }) {
  if (!conferencia) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="mb-3 text-[11px] uppercase tracking-wide text-muted-foreground">
          Conferencia com o pedido
        </p>
        <Vazio
          titulo="A conferencia nao chegou a rodar."
          descricao="A nota parou antes da etapa 6 — normalmente porque a medicao a devolveu ao fornecedor na etapa 4."
        />
      </section>
    );
  }

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${
        conferencia.conforme ? "border-green-500/30 bg-green-500/[0.04]" : "border-amber/40 bg-amber/[0.05]"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Conferencia com o pedido do Linx · etapa 6
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            conferencia.conforme ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-amber/15 text-amber-600 dark:text-amber-400"
          }`}
        >
          {conferencia.conforme ? "Confere" : "Nao fechou"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Dado rotulo="Pedido" valor={conferencia.pedido_numero ?? "nao localizado"} mono />
        <Dado rotulo="Valor do pedido" valor={brl(conferencia.valor_pedido)} mono />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{conferencia.explicacao}</p>
    </section>
  );
}

function Dado({
  rotulo,
  valor,
  mono,
}: {
  rotulo: string;
  valor: string;
  mono?: boolean | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{rotulo}</p>
      <p className={`mt-1 text-sm font-semibold ${mono ? "font-mono" : ""}`}>{valor}</p>
    </div>
  );
}
