import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, Save } from "lucide-react";

const ControleAPF = () => {
  const [config, setConfig] = useState({
    valorPF: "850",
    fatorAjuste: "1.0",
    complexidadeBaixa: "0.8",
    complexidadeMedia: "1.0",
    complexidadeAlta: "1.3",
  });

  const update = (k: string, v: string) => setConfig(p => ({ ...p, [k]: v }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" /> Configuração APF
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Análise de Pontos de Função</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div>
          <Label>Valor do Ponto de Função (R$)</Label>
          <Input value={config.valorPF} onChange={e => update("valorPF", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Fator de Ajuste</Label>
          <Input value={config.fatorAjuste} onChange={e => update("fatorAjuste", e.target.value)} className="mt-1" />
        </div>

        <div className="pt-2">
          <h3 className="font-semibold text-foreground text-sm mb-3">Multiplicadores de Complexidade</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Baixa</Label>
              <Input value={config.complexidadeBaixa} onChange={e => update("complexidadeBaixa", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Média</Label>
              <Input value={config.complexidadeMedia} onChange={e => update("complexidadeMedia", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Alta</Label>
              <Input value={config.complexidadeAlta} onChange={e => update("complexidadeAlta", e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        <Button className="gap-2 mt-4">
          <Save className="h-4 w-4" /> Salvar configuração
        </Button>
      </div>
    </div>
  );
};

export default ControleAPF;