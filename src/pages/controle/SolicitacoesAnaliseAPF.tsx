import ComingSoon from "@/components/controle/ComingSoon";
import { Calculator } from "lucide-react";

const SolicitacoesAnaliseAPF = () => (
  <ComingSoon
    title="Em Análise APF"
    description="Solicitações em processo de contagem de pontos de função"
    icon={Calculator}
    bullets={[
      "Solicitações encaminhadas para análise APF",
      "Status de contagem em andamento",
      "Vinculação com a contagem APF gerada",
    ]}
  />
);

export default SolicitacoesAnaliseAPF;