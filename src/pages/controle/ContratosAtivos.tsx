import ComingSoon from "@/components/controle/ComingSoon";
import { FileSignature } from "lucide-react";

const ContratosAtivos = () => (
  <ComingSoon
    title="Contratos Ativos"
    description="Contratos vigentes com fornecedores"
    icon={FileSignature}
    bullets={[
      "Listagem de contratos com vigência",
      "Alertas de renovação e vencimento",
      "Acesso rápido a aditivos e anexos",
    ]}
  />
);

export default ContratosAtivos;