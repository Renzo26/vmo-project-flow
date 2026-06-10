import { FileText, DollarSign } from "lucide-react";
import { mockSuppliers, mockPriceTable } from "@/data/mockData";
import EmptyState from "@/components/EmptyState";

const ControleContratos = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Contratos e Preços</h2>
        <p className="text-sm text-muted-foreground mt-1">Tabela de preços por fornecedor</p>
      </div>

      {mockSuppliers.length === 0 && (
        <div className="bg-card rounded-xl border border-border">
          <EmptyState
            title="Nenhum contrato cadastrado"
            description="As tabelas de preço por fornecedor aparecerão aqui após a contratação."
          />
        </div>
      )}

      <div className="grid gap-4">
        {mockSuppliers.map(s => {
          const prices = mockPriceTable[s.id] || {};
          return (
            <div key={s.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">Parceiro desde {s.since}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(prices).map(([service, price]) => (
                  <div key={service} className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{service}</p>
                    <p className="font-semibold text-foreground flex items-center gap-1 mt-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      R$ {price}/h
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ControleContratos;