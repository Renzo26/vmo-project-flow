import ComingSoon from "@/components/controle/ComingSoon";
import { ShieldCheck } from "lucide-react";

const FornecedoresHomologacao = () => (
  <ComingSoon
    title="Homologação de Fornecedores"
    description="Processo de validação e aprovação de fornecedores"
    icon={ShieldCheck}
    bullets={[
      "Checklist de requisitos por fornecedor",
      "Workflow de aprovação multinível",
      "Histórico de homologações e revisões",
    ]}
  />
);

export default FornecedoresHomologacao;