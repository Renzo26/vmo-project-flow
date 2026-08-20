import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Plus, Trash2, Upload, Paperclip, X, CheckCircle2, AlertCircle,
  FileText, Receipt, Building2, CalendarDays, ClipboardList,
} from "lucide-react";
import {
  contratosAtivos, statusDoContrato, formatarData, hojeISO, brl,
  ESPECIES_NOTA, TIPOS_NOTA, UNIDADES_ITEM,
  type ContratoAtivo,
} from "@/data/contratosAtivos";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ItemNota {
  id: string;
  descricao: string;
  unidade: string;
  quantidade: string;
  valorUnitario: string;
}

interface FormNota {
  contratoId: string;
  numero: string;
  contatoComprador: string;
  serie: string;
  dataEmissao: string;
  cnpj: string;
  pedidoCompra: string;
  codigoProjeto: string;
  tipo: string;
  especie: string;
  observacoes: string;
}

const FORM_VAZIO: FormNota = {
  contratoId: "", numero: "", contatoComprador: "", serie: "", dataEmissao: "",
  cnpj: "", pedidoCompra: "", codigoProjeto: "", tipo: "", especie: "", observacoes: "",
};

const novoItem = (): ItemNota => ({
  id: crypto.randomUUID(),
  descricao: "",
  unidade: "PF",
  quantidade: "",
  valorUnitario: "",
});

const num = (v: string) => {
  const parsed = Number(String(v).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const totalDoItem = (i: ItemNota) => num(i.quantidade) * num(i.valorUnitario);

// ─── Blocos de UI ─────────────────────────────────────────────────────────────

const Bloco = ({
  titulo, descricao, icone: Icone, children, acao,
}: {
  titulo: string;
  descricao?: string;
  icone: typeof FileText;
  children: React.ReactNode;
  acao?: React.ReactNode;
}) => (
  <section className="bg-card rounded-xl border border-border p-4 sm:p-5 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-ctrl/10 flex items-center justify-center shrink-0">
          <Icone className="h-4 w-4 text-ctrl" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
          {descricao && <p className="text-xs text-muted-foreground">{descricao}</p>}
        </div>
      </div>
      {acao}
    </div>
    {children}
  </section>
);

const Campo = ({
  label, obrigatorio, hint, children,
}: {
  label: string;
  obrigatorio?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="min-w-0">
    <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
      {obrigatorio && <span className="text-destructive mr-1">*</span>}
      {label}
    </Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

// ─── Página ───────────────────────────────────────────────────────────────────

const ContratoNotaFiscalNova = () => {
  const navigate = useNavigate();
  const { contratoId } = useParams<{ contratoId: string }>();
  const fileRef = useRef<HTMLInputElement>(null);

  const contratosDisponiveis = useMemo(
    () => contratosAtivos.filter(c => statusDoContrato(c) !== "vencido"),
    [],
  );

  const [form, setForm] = useState<FormNota>(() => {
    const inicial = contratoId ? contratosAtivos.find(c => c.id === contratoId) : undefined;
    return {
      ...FORM_VAZIO,
      contratoId: inicial?.id ?? "",
      cnpj: inicial?.cnpjsEmissores.length === 1 ? inicial.cnpjsEmissores[0].cnpj : "",
    };
  });
  const [itens, setItens] = useState<ItemNota[]>([novoItem()]);
  const [anexos, setAnexos] = useState<File[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [registrada, setRegistrada] = useState(false);

  const contrato: ContratoAtivo | undefined = useMemo(
    () => contratosAtivos.find(c => c.id === form.contratoId),
    [form.contratoId],
  );

  const emissores = contrato?.cnpjsEmissores ?? [];
  const nomeEmissor = emissores.find(e => e.cnpj === form.cnpj)?.nome ?? "";
  const pedidoSelecionado = contrato?.pedidos.find(p => p.numero === form.pedidoCompra);

  const set = <K extends keyof FormNota>(campo: K, valor: FormNota[K]) =>
    setForm(atual => ({ ...atual, [campo]: valor }));

  const trocarContrato = (id: string) => {
    const novo = contratosAtivos.find(c => c.id === id);
    setForm(atual => ({
      ...atual,
      contratoId: id,
      cnpj: novo?.cnpjsEmissores.length === 1 ? novo.cnpjsEmissores[0].cnpj : "",
      pedidoCompra: "",
    }));
  };

  const setItem = (id: string, campo: keyof ItemNota, valor: string) =>
    setItens(atual => atual.map(i => (i.id === id ? { ...i, [campo]: valor } : i)));

  const removerItem = (id: string) =>
    setItens(atual => (atual.length === 1 ? atual : atual.filter(i => i.id !== id)));

  const adicionarArquivos = (lista: FileList | null) => {
    if (!lista) return;
    setAnexos(atual => [...atual, ...Array.from(lista)]);
  };

  const totalNota = itens.reduce((acc, i) => acc + totalDoItem(i), 0);
  const itensValidos = itens.filter(i => i.descricao.trim() && totalDoItem(i) > 0);
  const excedeSaldoPedido = !!pedidoSelecionado && totalNota > pedidoSelecionado.saldo;

  const pendencias = [
    !form.contratoId && "Selecione o contrato",
    !form.numero.trim() && "Informe o número da nota fiscal",
    !form.serie.trim() && "Informe a série",
    !form.dataEmissao && "Informe a data de emissão",
    !form.cnpj && "Selecione o CNPJ emissor",
    !form.tipo && "Selecione o tipo",
    !form.especie && "Selecione a espécie",
    itensValidos.length === 0 && "Adicione ao menos um item com quantidade e valor",
    anexos.length === 0 && "Anexe a nota fiscal e/ou o acordo da prestação de serviço",
  ].filter(Boolean) as string[];

  const podeRegistrar = pendencias.length === 0;

  const registrar = () => {
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setRegistrada(true);
    }, 1200);
  };

  const registrarOutra = () => {
    setForm({ ...FORM_VAZIO, contratoId: contrato?.id ?? "", cnpj: emissores.length === 1 ? emissores[0].cnpj : "" });
    setItens([novoItem()]);
    setAnexos([]);
    setRegistrada(false);
  };

  // ── Tela de sucesso ──
  if (registrada) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold text-foreground text-center">Nota fiscal registrada!</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          A nota <strong className="text-foreground">nº {form.numero}</strong> (série {form.serie}), no valor de{" "}
          <strong className="text-foreground">{brl(totalNota)}</strong>, foi registrada no contrato{" "}
          <strong className="text-foreground">{contrato?.numero}</strong> e seguiu para validação do VMO.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">
          <Button variant="outline" className="rounded-full" onClick={registrarOutra}>
            Registrar outra nota
          </Button>
          <Button
            className="rounded-full bg-ctrl hover:bg-ctrl/90 text-white border-0"
            onClick={() => navigate("/controle/contratos/ativos")}
          >
            Voltar aos contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button
          variant="ghost"
          className="gap-2 rounded-full text-muted-foreground hover:text-foreground self-start -ml-2"
          onClick={() => navigate("/controle/contratos/ativos")}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <div className="sm:border-l sm:border-border sm:pl-4">
          <h2 className="text-xl font-bold text-foreground">Nova nota fiscal</h2>
          <p className="text-sm text-muted-foreground">
            {contrato
              ? <>Contrato <span className="font-mono text-foreground">{contrato.numero}</span> · {contrato.fornecedor}</>
              : "Selecione o contrato e preencha os dados da nota fiscal"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Coluna do formulário */}
        <div className="lg:col-span-2 space-y-5">
          {/* Identificação da nota */}
          <Bloco
            titulo="Identificação da nota fiscal"
            descricao="Dados do documento emitido pelo fornecedor"
            icone={Receipt}
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Campo label="Número da nota fiscal" obrigatorio>
                <Input
                  value={form.numero}
                  onChange={e => set("numero", e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="000000"
                  className="font-mono"
                />
              </Campo>
              <Campo label="Contato do comprador">
                <Input
                  value={form.contatoComprador}
                  onChange={e => set("contatoComprador", e.target.value)}
                  placeholder="Nome do comprador"
                />
              </Campo>
              <Campo label="Série" obrigatorio>
                <Input
                  value={form.serie}
                  onChange={e => set("serie", e.target.value)}
                  placeholder="1"
                  className="font-mono"
                />
              </Campo>
              <Campo label="Data de emissão" obrigatorio>
                <Input
                  type="date"
                  max={hojeISO()}
                  value={form.dataEmissao}
                  onChange={e => set("dataEmissao", e.target.value)}
                />
              </Campo>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Tipo" obrigatorio>
                <Select value={form.tipo} onValueChange={v => set("tipo", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_NOTA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="Espécie" obrigatorio>
                <Select value={form.especie} onValueChange={v => set("especie", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {ESPECIES_NOTA.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Campo>
            </div>
          </Bloco>

          {/* Vínculo com o contrato */}
          <Bloco
            titulo="Contrato e emissor"
            descricao="Contra qual contrato e pedido a nota será lançada"
            icone={Building2}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Contrato" obrigatorio>
                <Select value={form.contratoId} onValueChange={trocarContrato}>
                  <SelectTrigger><SelectValue placeholder="Selecione o contrato" /></SelectTrigger>
                  <SelectContent>
                    {contratosDisponiveis.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.numero} — {c.fornecedor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="CNPJ" obrigatorio hint={contrato ? undefined : "Selecione o contrato para listar os CNPJs"}>
                <Select value={form.cnpj} onValueChange={v => set("cnpj", v)} disabled={!contrato}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {emissores.map(e => (
                      <SelectItem key={e.cnpj} value={e.cnpj}>{e.cnpj}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
            </div>

            <Campo label="Nome">
              <Input value={nomeEmissor} readOnly placeholder="Preenchido pelo CNPJ" className="bg-muted/40 text-muted-foreground" />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Pedido de compra" hint={pedidoSelecionado ? `Saldo do pedido: ${brl(pedidoSelecionado.saldo)}` : undefined}>
                <Select value={form.pedidoCompra} onValueChange={v => set("pedidoCompra", v)} disabled={!contrato || contrato.pedidos.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={contrato && contrato.pedidos.length === 0 ? "Sem pedidos em aberto" : "Selecione"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(contrato?.pedidos ?? []).map(p => (
                      <SelectItem key={p.numero} value={p.numero}>{p.numero} — {p.descricao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
              <Campo label="Código do projeto">
                <Input
                  value={form.codigoProjeto}
                  onChange={e => set("codigoProjeto", e.target.value)}
                  placeholder={contrato?.projetos[0] ?? "PRJ-0000"}
                  className="font-mono"
                />
              </Campo>
            </div>

            {excedeSaldoPedido && (
              <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
                <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">
                  O valor total da nota ({brl(totalNota)}) excede o saldo do pedido {pedidoSelecionado?.numero} ({brl(pedidoSelecionado!.saldo)}).
                  O registro seguirá para aprovação com exceção.
                </p>
              </div>
            )}
          </Bloco>

          {/* Itens */}
          <Bloco
            titulo="Itens da nota"
            descricao="Serviços ou materiais faturados"
            icone={ClipboardList}
            acao={
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-full shrink-0"
                onClick={() => setItens(atual => [...atual, novoItem()])}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar item
              </Button>
            }
          >
            <div className="space-y-3">
              {itens.map((item, indice) => (
                <div key={item.id} className="rounded-xl border border-border p-3 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Item {indice + 1}
                    </span>
                    <button
                      onClick={() => removerItem(item.id)}
                      disabled={itens.length === 1}
                      aria-label={`Remover item ${indice + 1}`}
                      className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30 disabled:hover:text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <Campo label="Descrição">
                    <Input
                      value={item.descricao}
                      onChange={e => setItem(item.id, "descricao", e.target.value)}
                      placeholder="Ex.: Sustentação — sprint 12 (PF entregues)"
                    />
                  </Campo>

                  <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <Campo label="Unidade">
                      <Select value={item.unidade} onValueChange={v => setItem(item.id, "unidade", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {UNIDADES_ITEM.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Campo>
                    <Campo label="Quantidade">
                      <Input
                        value={item.quantidade}
                        onChange={e => setItem(item.id, "quantidade", e.target.value)}
                        inputMode="decimal"
                        placeholder="0"
                        className="tabular-nums"
                      />
                    </Campo>
                    <Campo label="Valor unitário">
                      <Input
                        value={item.valorUnitario}
                        onChange={e => setItem(item.id, "valorUnitario", e.target.value)}
                        inputMode="decimal"
                        placeholder={contrato ? String(contrato.valorPF) : "0,00"}
                        className="tabular-nums"
                      />
                    </Campo>
                    <Campo label="Total">
                      <div className="h-10 flex items-center px-3 rounded-md border border-border bg-muted/40 text-sm font-semibold text-foreground tabular-nums">
                        {brl(totalDoItem(item))}
                      </div>
                    </Campo>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-sm text-muted-foreground">
                {itensValidos.length} de {itens.length} item(ns) preenchido(s)
              </span>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Total da nota</p>
                <p className="font-display text-xl font-bold text-foreground tabular-nums">{brl(totalNota)}</p>
              </div>
            </div>
          </Bloco>

          {/* Anexos */}
          <Bloco
            titulo="Anexos"
            descricao="Nota fiscal e/ou acordo da prestação de serviço"
            icone={Paperclip}
          >
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setArrastando(true); }}
              onDragLeave={() => setArrastando(false)}
              onDrop={e => { e.preventDefault(); setArrastando(false); adicionarArquivos(e.dataTransfer.files); }}
              className={`rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors ${
                arrastando
                  ? "border-ctrl bg-ctrl/5"
                  : anexos.length === 0
                    ? "border-destructive/40 hover:border-ctrl/60 hover:bg-ctrl/5"
                    : "border-border hover:border-ctrl/60 hover:bg-ctrl/5"
              }`}
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Anexar nota fiscal e/ou acordo da prestação de serviço
              </p>
              <p className="text-xs text-muted-foreground">
                Arraste os arquivos ou clique para selecionar — PDF, XML, PNG ou JPG (máx. 10 MB)
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.xml,.png,.jpg,.jpeg"
              className="hidden"
              onChange={e => { adicionarArquivos(e.target.files); e.target.value = ""; }}
            />

            {anexos.length > 0 && (
              <ul className="space-y-2">
                {anexos.map((arquivo, indice) => (
                  <li key={`${arquivo.name}-${indice}`} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                    <FileText className="h-4 w-4 text-ctrl shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">{arquivo.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                      {(arquivo.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      onClick={() => setAnexos(atual => atual.filter((_, i) => i !== indice))}
                      aria-label={`Remover ${arquivo.name}`}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Campo label="Observações">
              <Textarea
                value={form.observacoes}
                onChange={e => set("observacoes", e.target.value)}
                placeholder="Informações adicionais para o VMO (opcional)"
                className="min-h-[72px] text-sm"
              />
            </Campo>
          </Bloco>
        </div>

        {/* Coluna de resumo */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Resumo</p>

            {contrato ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Contrato</p>
                  <p className="font-semibold text-foreground font-mono">{contrato.numero}</p>
                  <p className="text-xs text-muted-foreground">{contrato.fornecedor}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo do contrato</p>
                    <p className="font-medium text-foreground tabular-nums">{brl(contrato.valorTotal - contrato.valorConsumido)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vigência</p>
                    <p className="font-medium text-foreground text-xs tabular-nums">até {formatarData(contrato.vigenciaFim)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Selecione um contrato para ver saldo e vigência.</p>
            )}

            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Total da nota</p>
              <p className="font-display text-2xl font-bold text-foreground tabular-nums mt-1">{brl(totalNota)}</p>
              {form.dataEmissao && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> emissão em {formatarData(form.dataEmissao)}
                </p>
              )}
            </div>

            {pendencias.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Pendências ({pendencias.length})
                </p>
                <ul className="space-y-1.5">
                  {pendencias.map(p => (
                    <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">Tudo preenchido — pronto para registrar.</p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <Button
                onClick={registrar}
                disabled={!podeRegistrar || enviando}
                className="w-full gap-2 rounded-full bg-ctrl hover:bg-ctrl/90 text-white border-0 disabled:opacity-40"
              >
                {enviando ? "Registrando..." : <><Receipt className="h-4 w-4" /> Registrar nota fiscal</>}
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => navigate("/controle/contratos/ativos")}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ContratoNotaFiscalNova;
