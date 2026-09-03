import type { ReactNode } from "react";

export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-10 text-sm text-muted-foreground">
      <span className="size-2 animate-pulse rounded-full bg-primary" />
      {texto}
    </div>
  );
}

export function Vazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-10 text-center">
      <p className="text-sm font-semibold">{titulo}</p>
      <p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">{descricao}</p>
      {acao ? <div className="mt-4 flex justify-center">{acao}</div> : null}
    </div>
  );
}

export function Erro({ erro, aoTentarDeNovo }: { erro: unknown; aoTentarDeNovo?: () => void }) {
  const mensagem =
    erro instanceof Error ? erro.message : "Falha inesperada ao consultar a API.";

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm font-semibold text-destructive">Não foi possível carregar os dados.</p>
      <p className="mt-1 text-sm text-destructive/90">{mensagem}</p>
      {aoTentarDeNovo ? (
        <button
          onClick={aoTentarDeNovo}
          className="mt-3 rounded-lg border border-destructive/30 bg-card px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5"
        >
          Tentar de novo
        </button>
      ) : null}
    </div>
  );
}
