import ComingSoon from "@/components/controle/ComingSoon";
import { PlusCircle } from "lucide-react";

const APFNovaContagem = () => (
  <ComingSoon
    title="Nova Contagem APF"
    description="Criar uma nova contagem de pontos de função"
    icon={PlusCircle}
    bullets={[
      "Cadastro de funções de dados (ALI, AIE)",
      "Cadastro de funções transacionais (EE, SE, CE)",
      "Cálculo automático de PF e valor estimado",
    ]}
  />
);

export default APFNovaContagem;