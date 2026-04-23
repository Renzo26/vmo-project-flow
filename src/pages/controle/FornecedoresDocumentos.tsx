import ComingSoon from "@/components/controle/ComingSoon";
import { FileCheck2 } from "lucide-react";

const FornecedoresDocumentos = () => (
  <ComingSoon
    title="Documentos e Certidões"
    description="Gestão de documentos e certidões dos fornecedores"
    icon={FileCheck2}
    bullets={[
      "Controle de validade de certidões",
      "Alertas de vencimento próximo",
      "Repositório centralizado de documentos",
    ]}
  />
);

export default FornecedoresDocumentos;