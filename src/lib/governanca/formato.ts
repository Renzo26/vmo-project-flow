export const brl = (valor: number | string | null | undefined) =>
  valor === null || valor === undefined || valor === ""
    ? "—"
    : Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      });

export const dataBr = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
};

export const dataHoraBr = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const quando = new Date(iso);
  if (Number.isNaN(quando.getTime())) return iso;
  return quando.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
] as const;

export const competenciaBr = (competencia: string | null | undefined) => {
  if (!competencia) return "—";
  const [ano, mes] = competencia.split("-");
  const nome = MESES[Number(mes) - 1];
  if (!ano || !nome) return competencia;
  return `${nome}/${ano}`;
};

export const mascararCnpj = (bruto: string) => {
  const d = bruto.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export const statusLabel: Record<string, string> = {
  conciliada: "Conciliada",
  divergente: "Divergente",
  pendente: "Pendente",
  recebida: "Recebida",
};

export const rotuloStatus = (status: string) => statusLabel[status] ?? status;
