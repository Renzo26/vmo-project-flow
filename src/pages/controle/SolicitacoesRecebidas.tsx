import ComingSoon from "@/components/controle/ComingSoon";
import { Inbox } from "lucide-react";

const SolicitacoesRecebidas = () => (
  <ComingSoon
    title="Solicitações Recebidas"
    description="Solicitações enviadas pelos solicitantes para análise"
    icon={Inbox}
    bullets={[
      "Lista de solicitações recém-recebidas",
      "Triagem inicial e atribuição de responsável",
      "Filtros por área, prioridade e categoria",
    ]}
  />
);

export default SolicitacoesRecebidas;