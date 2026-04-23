import ComingSoon from "@/components/controle/ComingSoon";
import { UserPlus } from "lucide-react";

const FornecedoresNovo = () => (
  <ComingSoon
    title="Novo Cadastro de Fornecedor"
    description="Cadastrar novo fornecedor na base"
    icon={UserPlus}
    bullets={[
      "Dados cadastrais e fiscais",
      "Categorias de serviço atendidas",
      "Upload de documentação inicial",
    ]}
  />
);

export default FornecedoresNovo;