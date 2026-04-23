import ComingSoon from "@/components/controle/ComingSoon";
import { Building2 } from "lucide-react";

const FornecedoresBase = () => (
  <ComingSoon
    title="Base de Fornecedores"
    description="Cadastro consolidado de fornecedores parceiros"
    icon={Building2}
    bullets={[
      "Listagem completa com filtros e busca",
      "Status de homologação por fornecedor",
      "Acesso rápido a contratos e scorecard",
    ]}
  />
);

export default FornecedoresBase;