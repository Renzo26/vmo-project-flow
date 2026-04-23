import ComingSoon from "@/components/controle/ComingSoon";
import { ClipboardList } from "lucide-react";

const AcompanharProjetos = () => (
  <ComingSoon
    title="Acompanhar Projetos"
    description="Visão consolidada do andamento dos projetos contratados"
    icon={ClipboardList}
    bullets={[
      "Status de execução por projeto",
      "Marcos, entregas e prazos",
      "Indicadores financeiros e de qualidade",
    ]}
  />
);

export default AcompanharProjetos;