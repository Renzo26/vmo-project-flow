import { Fragment, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard, { HeroChip } from "@/components/dashboard/StatCard";
import EmptyState from "@/components/EmptyState";
import {
  Search, Plus, ChevronRight, FileSignature, CalendarClock, Receipt,
  Building2, User, Hash, CircleDollarSign,
} from "lucide-react";
import {
  contratosAtivos, statusDoContrato, diasParaVencer, formatarData, brl, brlCurto,
  type ContratoAtivo, type ContratoStatus,
} from "@/data/contratosAtivos";

const STATUS_CONFIG: Record<ContratoStatus, { label: string; pill: string; dot: string }> = {
  vigente:  { label: "Vigente",  pill: "bg-success/15 text-success",         dot: "bg-success" },
  a_vencer: { label: "A vencer", pill: "bg-warning/15 text-warning",         dot: "bg-warning" },
  vencido:  { label: "Vencido",  pill: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

type Filtro = "todos" | ContratoStatus;

const StatusPill = ({ status }: { status: ContratoStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/** Barra de consumo do contrato (executado x total). */
const BarraConsumo = ({ contrato }: { contrato: ContratoAtivo }) => {
  const pct = Math.min(100, Math.round((contrato.valorConsumido / contrato.valorTotal) * 100));
  const tone = pct >= 95 ? "bg-destructive" : pct >= 80 ? "bg-warning" : "bg-ctrl";
  return (
    <div className="space-y-1 min-w-[140px]">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground tabular-nums">{pct}% executado</span>
        <span className="font-medium text-foreground tabular-nums">{brlCurto(contrato.valorTotal - contrato.valorConsumido)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/** Painel de detalhes do contrato — pedidos, projetos e notas já registradas. */
const DetalhesContrato = ({ contrato }: { contrato: ContratoAtivo }) => (
  <div className="grid gap-4 lg:grid-cols-3 p-4 sm:p-5 bg-muted/20 border-t border-border">
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Pedidos de compra</p>
      {contrato.pedidos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pedido em aberto.</p>}
      {contrato.pedidos.map(p => (
        <div key={p.numero} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground font-mono">{p.numero}</p>
            <p className="text-xs text-muted-foreground truncate">{p.descricao}</p>
          </div>
          <span className="text-xs font-semibold text-foreground tabular-nums shrink-0">{brlCurto(p.saldo)}</span>
        </div>
      ))}
    </div>

    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Dados do contrato</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Gestor</p>
          <p className="font-medium text-foreground">{contrato.gestor}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">R$/PF</p>
          <p className="font-medium text-foreground tabular-nums">{brl(contrato.valorPF)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">CNPJ</p>
          <p className="font-mono text-xs text-foreground">{contrato.cnpj}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Projetos</p>
          <p className="font-mono text-xs text-foreground">{contrato.projetos.join(" · ") || "—"}</p>
        </div>
      </div>
    </div>

    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Notas fiscais recentes</p>
      {contrato.notas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma nota registrada.</p>}
      {contrato.notas.map(n => (
        <div key={n.numero} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              NF {n.numero}<span className="text-muted-foreground font-normal"> · série {n.serie}</span>
            </p>
            <p className="text-xs text-muted-foreground">{formatarData(n.emissao)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-foreground tabular-nums">{brlCurto(n.valor)}</p>
            <p className={`text-[11px] ${n.situacao === "Aprovada" ? "text-success" : n.situacao === "Recusada" ? "text-destructive" : "text-warning"}`}>
              {n.situacao}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ContratosAtivos = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [expandido, setExpandido] = useState<string | null>(null);

  const contratos = useMemo(
    () => contratosAtivos.map(c => ({ ...c, status: statusDoContrato(c) })),
    [],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return contratos.filter(c => {
      const casaFiltro = filtro === "todos" || c.status === filtro;
      const casaBusca = !termo ||
        c.numero.toLowerCase().includes(termo) ||
        c.fornecedor.toLowerCase().includes(termo) ||
        c.objeto.toLowerCase().includes(termo) ||
        c.cnpj.includes(termo);
      return casaFiltro && casaBusca;
    });
  }, [contratos, busca, filtro]);

  const kpis = useMemo(() => {
    const vigentes = contratos.filter(c => c.status !== "vencido");
    const total = vigentes.reduce((acc, c) => acc + c.valorTotal, 0);
    const saldo = vigentes.reduce((acc, c) => acc + (c.valorTotal - c.valorConsumido), 0);
    const aVencer = contratos.filter(c => c.status === "a_vencer").length;
    const notasEmAnalise = contratos.reduce(
      (acc, c) => acc + c.notas.filter(n => n.situacao === "Em análise").length, 0,
    );
    return { qtd: vigentes.length, total, saldo, aVencer, notasEmAnalise };
  }, [contratos]);

  const contagem = (f: Filtro) => f === "todos" ? contratos.length : contratos.filter(c => c.status === f).length;

  const novaNota = (contratoId?: string) =>
    navigate(contratoId ? `/controle/contratos/ativos/${contratoId}/nova-nota` : "/controle/contratos/ativos/nova-nota");

  const toggle = (id: string) => setExpandido(atual => (atual === id ? null : id));

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Contratos ativos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Contratos vigentes com fornecedores e registro de notas fiscais.
          </p>
        </div>
        <Button onClick={() => novaNota()} className="gap-2 rounded-full bg-ctrl hover:bg-ctrl/90 text-white border-0 shrink-0">
          <Plus className="h-4 w-4" /> Nova nota fiscal
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          variant="hero"
          label="Valor contratado ativo"
          value={brlCurto(kpis.total)}
          hint={`${kpis.qtd} contratos vigentes`}
          footer={
            <div className="flex flex-wrap gap-2">
              <HeroChip>Saldo {brlCurto(kpis.saldo)}</HeroChip>
              <HeroChip>{kpis.notasEmAnalise} NF em análise</HeroChip>
            </div>
          }
        />
        <StatCard label="Saldo disponível" value={brlCurto(kpis.saldo)} hint="não consumido nos contratos" tone="primary" />
        <StatCard
          label="A vencer em 90 dias"
          value={kpis.aVencer}
          hint="renovação ou aditivo"
          tone="warning"
          badge={kpis.aVencer > 0 ? { label: "requer ação", tone: "warning" } : undefined}
        />
        <StatCard label="Notas em análise" value={kpis.notasEmAnalise} hint="aguardando validação do VMO" tone="neutral" />
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por contrato, fornecedor, objeto ou CNPJ"
            className="pl-10 rounded-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["todos", "vigente", "a_vencer", "vencido"] as Filtro[]).map(f => {
            const ativo = filtro === f;
            const label = f === "todos" ? "Todos" : STATUS_CONFIG[f].label;
            return (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`flex items-center gap-2 h-9 px-4 rounded-full border text-sm transition-colors ${
                  ativo
                    ? "bg-foreground text-background border-transparent font-medium"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {label}
                <span className={`text-[11px] font-semibold px-1.5 rounded-full ${ativo ? "bg-background/20" : "bg-muted"}`}>
                  {contagem(f)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista — tabela no desktop */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contrato</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fornecedor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vigência</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Consumo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => {
                const dias = diasParaVencer(c.vigenciaFim);
                const aberto = expandido === c.id;
                return (
                  <Fragment key={c.id}>
                    <tr
                      onClick={() => toggle(c.id)}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${aberto ? "rotate-90" : ""}`} />
                          <div>
                            <p className="font-semibold text-foreground font-mono">{c.numero}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[240px]">{c.objeto}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{c.fornecedor}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.cnpj}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground tabular-nums">{formatarData(c.vigenciaInicio)} – {formatarData(c.vigenciaFim)}</p>
                        <p className={`text-xs ${dias < 0 ? "text-destructive" : dias <= 90 ? "text-warning" : "text-muted-foreground"}`}>
                          {dias < 0 ? `vencido há ${Math.abs(dias)} dias` : `${dias} dias restantes`}
                        </p>
                      </td>
                      <td className="px-4 py-3"><BarraConsumo contrato={c} /></td>
                      <td className="px-4 py-3"><StatusPill status={c.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          onClick={e => { e.stopPropagation(); novaNota(c.id); }}
                          disabled={c.status === "vencido"}
                          className="gap-1.5 rounded-full bg-ctrl hover:bg-ctrl/90 text-white border-0 disabled:opacity-40"
                        >
                          <Receipt className="h-3.5 w-3.5" /> Nova NF
                        </Button>
                      </td>
                    </tr>
                    {aberto && (
                      <tr className="border-b border-border last:border-0">
                        <td colSpan={6} className="p-0"><DetalhesContrato contrato={c} /></td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="Nenhum contrato encontrado"
                      description="Ajuste a busca ou o filtro de status para ver os contratos."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista — cards no mobile */}
      <div className="md:hidden space-y-3">
        {filtrados.map(c => {
          const dias = diasParaVencer(c.vigenciaFim);
          const aberto = expandido === c.id;
          return (
            <div key={c.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => toggle(c.id)} className="w-full text-left p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground font-mono">{c.numero}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{c.objeto}</p>
                  </div>
                  <StatusPill status={c.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{c.fornecedor}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground tabular-nums">
                    {formatarData(c.vigenciaInicio)} – {formatarData(c.vigenciaFim)}
                  </span>
                  <span className={dias < 0 ? "text-destructive" : dias <= 90 ? "text-warning" : "text-muted-foreground"}>
                    · {dias < 0 ? `vencido há ${Math.abs(dias)}d` : `${dias}d`}
                  </span>
                </div>
                <BarraConsumo contrato={c} />
              </button>
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border bg-muted/20">
                <span className="text-xs text-muted-foreground">
                  {aberto ? "Toque no card para recolher" : "Toque no card para ver detalhes"}
                </span>
                <Button
                  size="sm"
                  onClick={() => novaNota(c.id)}
                  disabled={c.status === "vencido"}
                  className="gap-1.5 rounded-full bg-ctrl hover:bg-ctrl/90 text-white border-0 disabled:opacity-40 shrink-0"
                >
                  <Receipt className="h-3.5 w-3.5" /> Nova NF
                </Button>
              </div>
              {aberto && <DetalhesContrato contrato={c} />}
            </div>
          );
        })}
        {filtrados.length === 0 && (
          <div className="bg-card rounded-xl border border-border">
            <EmptyState
              title="Nenhum contrato encontrado"
              description="Ajuste a busca ou o filtro de status para ver os contratos."
            />
          </div>
        )}
      </div>

      {/* Rodapé informativo */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><FileSignature className="h-3.5 w-3.5" /> {filtrados.length} contrato(s) listado(s)</span>
        <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> valores em BRL</span>
        <span className="flex items-center gap-1.5"><CircleDollarSign className="h-3.5 w-3.5" /> saldo = contratado − executado</span>
        <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> gestor responsável no detalhe do contrato</span>
      </div>
    </div>
  );
};

export default ContratosAtivos;
