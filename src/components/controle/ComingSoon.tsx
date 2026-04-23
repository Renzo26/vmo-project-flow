import { Construction } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  bullets?: string[];
}

const ComingSoon = ({ title, description, icon: Icon = Construction, bullets }: ComingSoonProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Icon className="h-5 w-5" /> {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="bg-card rounded-xl border border-border border-dashed p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Em breve</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Este módulo está em desenvolvimento e será disponibilizado em breve.
        </p>

        {bullets && bullets.length > 0 && (
          <div className="mt-6 w-full max-w-md text-left">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              O que estará disponível:
            </p>
            <ul className="space-y-1.5">
              {bullets.map((b) => (
                <li key={b} className="text-sm text-foreground flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComingSoon;