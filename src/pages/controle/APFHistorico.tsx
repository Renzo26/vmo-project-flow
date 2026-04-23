import ComingSoon from "@/components/controle/ComingSoon";
import { History } from "lucide-react";

const APFHistorico = () => (
  <ComingSoon
    title="Histórico de Contagens"
    description="Consulta de todas as contagens APF realizadas"
    icon={History}
    bullets={[
      "Lista completa de contagens por projeto",
      "Comparativo entre versões de contagem",
      "Exportação de relatórios em PDF/Excel",
    ]}
  />
);

export default APFHistorico;