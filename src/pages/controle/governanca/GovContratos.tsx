import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  ErroDeValidacao,
  govApi,
  contratoSchema,
  type Contrato,
  type ContratoFormulario,
  type ContratoResumo,
} from "@/lib/governanca/api";
import { brl, dataBr, mascararCnpj } from "@/lib/governanca/formato";

const vazio: ContratoFormulario = {
  numero: "",
  fornecedor_cnpj: "",
  fornecedor_nome: "",
  fornecedor_id: "",
  objeto: "",
  categoria_servico: "",
  gestor: "",
  email_fornecedor: "",
  vigencia_inicio: "",
  vigencia_fim: "",
  tolerancia_percentual: 0,
  ativo: true,
  itens: [{ unidade: "", descricao: "", valor_mensal: 0 }],
};

const rotulo = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-primary";
const campo =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-ink";
const th = "pb-2.5 pr-3 font-semibold";

export default function GovContratos() {
  const cliente = useQueryClient();
  const [editando, setEditando] = useState<Contrato | "novo" | null>(null);

  const { data: contratos = [], isLoading, error } = useQuery({
    queryKey: ["gov-contratos"],
    queryFn: govApi.listarContratos,
  });

  const abrir = useMutation({
    mutationFn: govApi.obterContrato,
    onSuccess: (contrato) => setEditando(contrato),
  });

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Contratos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O teto contra o qual cada nota e medida. E este cadastro que decide se a fatura segue ou volta ao fornecedor.
          </p>
        </div>
        <button
          onClick={() => setEditando("novo")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          + Novo contrato
        </button>
      </div>

      {error || abrir.error ? (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
          {((error ?? abrir.error) as Error).message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : contratos.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold">Nenhum contrato cadastrado.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sem contrato, a medicao nao tem contra o que comparar e toda nota vira
              conferencia humana.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className={th}>Contrato</th>
                  <th className={th}>Fornecedor</th>
                  <th className={th}>Servico</th>
                  <th className={th}>Vigencia</th>
                  <th className={th}>Unidades</th>
                  <th className={th}>Teto mensal</th>
                  <th className={th}>Tolerancia</th>
                  <th className={th}>Situacao</th>
                  <th className="pb-2.5 text-right font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {contratos.map((c: ContratoResumo) => (
                  <tr key={c.id} className={c.ativo ? "hover:bg-muted/60" : "opacity-55"}>
                    <td className="py-3 pr-3 font-mono text-[12px] font-semibold">{c.numero}</td>
                    <td className="py-3 pr-3">
                      <p className="font-semibold">{c.fornecedor_nome}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{c.fornecedor_cnpj}</p>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">{c.categoria_servico ?? "—"}</td>
                    <td className="py-3 pr-3 text-muted-foreground">
                      {dataBr(c.vigencia_inicio)} → {dataBr(c.vigencia_fim)}
                    </td>
                    <td className="py-3 pr-3 font-mono">{c.total_itens}</td>
                    <td className="py-3 pr-3 font-mono font-semibold">
                      {brl(c.valor_mensal_total)}
                    </td>
                    <td className="py-3 pr-3 font-mono text-muted-foreground">
                      +{Number(c.tolerancia_percentual)}%
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          c.ativo ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-amber/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${c.ativo ? "bg-green-500" : "bg-amber"}`}
                        />
                        {c.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => abrir.mutate(c.id)}
                        disabled={abrir.isPending}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
                      >
                        {abrir.isPending && abrir.variables === c.id ? "Abrindo..." : "Editar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editando ? (
        <FormularioContrato
          contrato={editando === "novo" ? null : editando}
          onFechar={() => setEditando(null)}
        />
      ) : null}
    </>
  );
}

function FormularioContrato({
  contrato,
  onFechar,
}: {
  contrato: Contrato | null;
  onFechar: () => void;
}) {
  const cliente = useQueryClient();
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContratoFormulario>({
    resolver: zodResolver(contratoSchema),
    defaultValues: contrato
      ? {
          ...contrato,
          tolerancia_percentual: Number(contrato.tolerancia_percentual),
          itens: contrato.itens.map((i) => ({ ...i, valor_mensal: Number(i.valor_mensal) })),
        }
      : vazio,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const itens = watch("itens");
  const ativo = watch("ativo");
  const total = (itens ?? []).reduce((soma, i) => soma + (Number(i?.valor_mensal) || 0), 0);

  const salvar = useMutation({
    mutationFn: (dados: ContratoFormulario) =>
      contrato ? govApi.atualizarContrato(contrato.id, dados) : govApi.criarContrato(dados),
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: ["gov-contratos"] });
      onFechar();
    },
    onError: (erro: unknown) => {
      if (erro instanceof ErroDeValidacao && erro.campo) {
        setError(erro.campo as keyof ContratoFormulario, { message: erro.message });
        return;
      }
      setErroGeral((erro as Error).message);
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-primary/40 p-4 sm:p-8">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">
              {contrato ? `Editar ${contrato.numero}` : "Novo contrato"}
            </h2>
            <p className="text-xs text-muted-foreground">
              O agente mede toda nota deste fornecedor contra os valores abaixo.
            </p>
          </div>
          <button onClick={onFechar} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            Fechar
          </button>
        </div>

        <form
          onSubmit={handleSubmit((dados) => {
            setErroGeral(null);
            return salvar.mutateAsync(dados).catch(() => {});
          })}
          className="space-y-5 px-6 py-5"
        >
          {erroGeral ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600 dark:text-red-400">
              {erroGeral}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Numero do contrato" erro={errors.numero?.message}>
              <input {...register("numero")} className={campo} placeholder="CT-2026-ALPHA-001" />
            </Campo>
            <Campo rotulo="CNPJ do fornecedor" erro={errors.fornecedor_cnpj?.message}>
              <input
                {...register("fornecedor_cnpj")}
                className={`${campo} font-mono`}
                placeholder="11.222.333/0001-44"
                onChange={(e) => setValue("fornecedor_cnpj", mascararCnpj(e.target.value))}
              />
            </Campo>
            <Campo rotulo="Nome do fornecedor" erro={errors.fornecedor_nome?.message}>
              <input {...register("fornecedor_nome")} className={campo} />
            </Campo>
            <Campo
              rotulo="Categoria do servico"
              dica="Vira a pasta de servico no arquivamento."
              erro={errors.categoria_servico?.message}
            >
              <input
                {...register("categoria_servico")}
                className={campo}
                placeholder="Limpeza e Conservacao"
              />
            </Campo>
            <Campo rotulo="Vigencia — inicio" erro={errors.vigencia_inicio?.message}>
              <input type="date" {...register("vigencia_inicio")} className={campo} />
            </Campo>
            <Campo rotulo="Vigencia — fim" erro={errors.vigencia_fim?.message}>
              <input type="date" {...register("vigencia_fim")} className={campo} />
            </Campo>
            <Campo
              rotulo="Tolerancia (%)"
              dica="Aceita so PARA MAIS. Cobrar abaixo do contratado nunca reprova."
              erro={errors.tolerancia_percentual?.message}
            >
              <input
                type="number"
                step="0.001"
                {...register("tolerancia_percentual")}
                className={campo}
              />
            </Campo>
            <Campo rotulo="E-mail de faturamento" erro={errors.email_fornecedor?.message}>
              <input
                {...register("email_fornecedor")}
                className={campo}
                placeholder="faturamento@fornecedor.com.br"
              />
            </Campo>
          </div>

          <Campo rotulo="Objeto do contrato" erro={errors.objeto?.message}>
            <textarea {...register("objeto")} rows={2} className={campo} />
          </Campo>

          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Teto mensal por unidade
                </p>
                <p className="text-xs text-muted-foreground">
                  E contra estes valores que a nota e comparada na medicao.
                </p>
              </div>
              <button
                type="button"
                onClick={() => append({ unidade: "", descricao: "", valor_mensal: 0 })}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-primary/10"
              >
                + Unidade
              </button>
            </div>

            <div className="space-y-2">
              {fields.map((linha, indice) => (
                <div key={linha.id} className="grid grid-cols-12 gap-2">
                  <input
                    {...register(`itens.${indice}.unidade`)}
                    placeholder="UN-014"
                    className={`${campo} col-span-3 font-mono uppercase`}
                  />
                  <input
                    {...register(`itens.${indice}.descricao`)}
                    placeholder="Descricao do servico nesta unidade"
                    className={`${campo} col-span-6`}
                  />
                  <input
                    type="number"
                    step="0.01"
                    {...register(`itens.${indice}.valor_mensal`)}
                    className={`${campo} col-span-2 text-right font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => remove(indice)}
                    disabled={fields.length === 1}
                    title={
                      fields.length === 1
                        ? "Um contrato precisa de ao menos uma unidade."
                        : "Remover unidade"
                    }
                    className="col-span-1 rounded-lg border border-border bg-card text-xs font-semibold text-red-600 dark:text-red-400 disabled:cursor-not-allowed disabled:text-muted-foreground/40"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {errors.itens?.message ? (
              <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{errors.itens.message}</p>
            ) : null}

            <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
              <span className="font-semibold text-primary">Teto mensal somado</span>
              <span className="font-mono font-bold">{brl(total)}</span>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              ativo ? "border-green-500/30 bg-green-500/5" : "border-amber/40 bg-amber/5"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" {...register("ativo")} className="mt-0.5 size-4" />
              <span className="text-sm">
                <span className="font-semibold">
                  {ativo ? "Contrato ativo" : "Contrato inativo"}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {ativo
                    ? "O agente mede as notas deste fornecedor contra os valores acima."
                    : "O agente deixa de medir por este contrato. As notas do fornecedor passam a cair em conferencia humana ate que exista outro contrato ativo."}
                </span>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end border-t border-border pt-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onFechar}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {isSubmitting ? "Salvando..." : "Salvar contrato"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Campo({
  rotulo: texto,
  dica,
  erro,
  children,
}: {
  rotulo: string;
  dica?: string | undefined;
  erro?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={rotulo}>{texto}</label>
      {children}
      {dica && !erro ? <p className="mt-1 text-[11px] text-muted-foreground">{dica}</p> : null}
      {erro ? <p className="mt-1 text-[11px] font-semibold text-red-600 dark:text-red-400">{erro}</p> : null}
    </div>
  );
}
