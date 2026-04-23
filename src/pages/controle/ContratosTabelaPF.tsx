import ComingSoon from "@/components/controle/ComingSoon";
import { Table } from "lucide-react";

const ContratosTabelaPF = () => (
  <ComingSoon
    title="Tabela R$/PF"
    description="Tabela de valores por ponto de função e por fornecedor"
    icon={Table}
    bullets={[
      "Valores contratados por fornecedor",
      "Histórico de reajustes",
      "Comparativo de preços entre fornecedores",
    ]}
  />
);

export default ContratosTabelaPF;