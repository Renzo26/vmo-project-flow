import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Carregando, Erro, Vazio } from "@/components/governanca/Estados";
import { govApi } from "@/lib/governanca/api";

const th = "pb-2.5 pr-3 font-semibold";

function Cartao({
  titulo,
  descricao,
  total,
  children,
}: {
  titulo: string;
  descricao: string;
  total: number | null;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{titulo}</p>
          <p className="mt-1 font-mono text-2xl font-bold">{total ?? "—"}</p>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">{descricao}</p>
        </div>
        <Link
          to="/controle/governanca/contratos"
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          Ir para contratos
        </Link>
      </div>
      {children}
    </section>
  );
}

export default function GovCadastros() {
  const fornecedores = useQuery({
    queryKey: ["gov-fornecedores"],
    queryFn: govApi.listarFornecedores,
  });

  const unidades = useQuery({
    queryKey: ["gov-unidades"],
    queryFn: govApi.listarUnidades,
  });

  const listaFornecedores = fornecedores.data ?? [];
  const listaUnidades = unidades.data ?? [];

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Cadastros</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fornecedores e unidades derivados dos contratos. Cadastrar aqui seria manter uma segunda verdade — o cadastro real e o contrato.
        </p>
      </div>

      <div className="space-y-5">
        <Cartao
          titulo="Fornecedores"
          descricao="Um fornecedor existe para a automacao a partir do momento em que tem contrato cadastrado — e o contrato que da o CNPJ, o e-mail de faturamento e o teto de medicao."
          total={fornecedores.isSuccess ? listaFornecedores.length : null}
        >
          {fornecedores.isPending ? (
            <Carregando />
          ) : fornecedores.error ? (
            <Erro erro={fornecedores.error} aoTentarDeNovo={() => void fornecedores.refetch()} />
          ) : listaFornecedores.length === 0 ? (
            <Vazio
              titulo="Nenhum fornecedor cadastrado."
              descricao="Cadastre um contrato para que o fornecedor apareca aqui e as notas dele passem a ser medidas."
              acao={
                <Link
                  to="/controle/governanca/contratos"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Cadastrar contrato
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className={th}>Fornecedor</th>
                    <th className={th}>CNPJ</th>
                    <th className={th}>E-mail de faturamento</th>
                    <th className={th}>Contratos ativos</th>
                    <th className={th}>Situacao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {listaFornecedores.map((f) => (
                    <tr key={f.id} className="hover:bg-muted/60">
                      <td className="py-3 pr-3 font-semibold">{f.nome}</td>
                      <td className="py-3 pr-3 font-mono text-[12px] text-muted-foreground">{f.cnpj}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{f.email_faturamento ?? "—"}</td>
                      <td className="py-3 pr-3 font-mono">{f.contratos_ativos}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`text-[11px] font-semibold ${
                            f.situacao === "Ativo" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {f.situacao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Cartao>

        <Cartao
          titulo="Unidades"
          descricao="Nao ha tabela de unidades: cada uma vem dos itens dos contratos. Enquanto nao existir dado proprio de unidade (responsavel, cidade), criar esse cadastro seria inventar informacao que ninguem alimenta."
          total={unidades.isSuccess ? listaUnidades.length : null}
        >
          {unidades.isPending ? (
            <Carregando />
          ) : unidades.error ? (
            <Erro erro={unidades.error} aoTentarDeNovo={() => void unidades.refetch()} />
          ) : listaUnidades.length === 0 ? (
            <Vazio
              titulo="Nenhuma unidade atendida."
              descricao="As unidades aparecem conforme forem incluidas como itens dos contratos, com o teto mensal de cada uma."
              acao={
                <Link
                  to="/controle/governanca/contratos"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Cadastrar contrato
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className={th}>Codigo</th>
                    <th className={th}>Servico contratado</th>
                    <th className={th}>Contratos</th>
                    <th className={th}>Situacao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {listaUnidades.map((u) => (
                    <tr key={u.codigo} className="hover:bg-muted/60">
                      <td className="py-3 pr-3 font-mono text-[12px] font-semibold">
                        {u.codigo}
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{u.servico ?? "—"}</td>
                      <td className="py-3 pr-3 font-mono">{u.contratos}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`text-[11px] font-semibold ${
                            u.situacao === "Ativa" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {u.situacao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Cartao>
      </div>
    </>
  );
}
