import { Cpu } from "lucide-react";

interface PortfolioFooterProps {
  year: number;
}

export function PortfolioFooter({ year }: PortfolioFooterProps) {
  return (
    <footer className="border-t border-border/70 bg-background/70">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:text-sm">
        <p className="inline-flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          Diseñado con React, Tailwind y componentes modulares.
        </p>
        <p>© {year} Rommel Soriano</p>
      </div>
    </footer>
  );
}
