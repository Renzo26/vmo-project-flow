// Fonte única dos documentos/certidões de fornecedores.
// Usado tanto pela página "Documentos e certidões" quanto pelo Dashboard de Fornecedores.
// Enquanto não houver backend, a lista abaixo funciona como mock (vazia por padrão).

export type TipoDoc = "Fiscal" | "Trabalhista" | "Certificação" | "Jurídico" | "Técnico";
export type StatusDoc = "Vencido" | "Vencendo" | "Válido";

export interface Documento {
  id: string;
  fornecedor: string;
  documento: string;
  tipo: TipoDoc;
  vencimento: string;
  vencimentoTs: number;
  status: StatusDoc;
  diasRestantes: number | null;
}

export const TIPO_CONFIG: Record<TipoDoc, string> = {
  Fiscal:       "bg-yellow-100 text-yellow-700",
  Trabalhista:  "bg-orange-100 text-orange-700",
  Certificação: "bg-purple-100 text-purple-700",
  Jurídico:     "bg-blue-100 text-blue-700",
  Técnico:      "bg-cyan-100 text-cyan-700",
};

export const DOCUMENTOS: Documento[] = [];

/** Documento com pendência = vencido ou vencendo (não "Válido"). */
export const isPendente = (d: Documento): boolean =>
  d.status === "Vencido" || d.status === "Vencendo";

/** Documentos vencidos ou vencendo (todos os fornecedores). */
export function documentosPendentes(docs: Documento[] = DOCUMENTOS): Documento[] {
  return docs.filter(isPendente);
}

/** Nomes distintos de fornecedores com ao menos uma certidão vencida ou vencendo. */
export function fornecedoresComPendenciaDoc(docs: Documento[] = DOCUMENTOS): string[] {
  const set = new Set<string>();
  for (const d of docs) {
    if (isPendente(d)) set.add(d.fornecedor);
  }
  return [...set];
}

/** Pendências agrupadas por fornecedor (nome → documentos pendentes). */
export function pendenciasPorFornecedor(docs: Documento[] = DOCUMENTOS): Map<string, Documento[]> {
  const map = new Map<string, Documento[]>();
  for (const d of documentosPendentes(docs)) {
    const arr = map.get(d.fornecedor) ?? [];
    arr.push(d);
    map.set(d.fornecedor, arr);
  }
  return map;
}
