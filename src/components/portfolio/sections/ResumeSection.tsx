import { motion } from "framer-motion";
import { Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionBlock } from "@/components/portfolio/ui/SectionBlock";

interface ResumeSectionProps {
  icon: LucideIcon;
  cvUrl: string;
}

export function ResumeSection({ icon, cvUrl }: ResumeSectionProps) {
  return (
    <SectionBlock
      id="cv"
      title="Currículum"
      description="Resumen de experiencia, formación y resultados técnicos en formato PDF para revisión rápida en procesos de selección o propuestas de proyecto."
      icon={icon}
    >
      <motion.a
        href={cvUrl}
        download="CV-Rommel.pdf"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="group mx-auto flex max-w-md flex-col items-center justify-center gap-4 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-secondary/35 px-8 py-10 text-center shadow-sm transition-all duration-300 hover:shadow-xl"
      >
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-background/85 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Download className="h-8 w-8" />
        </span>
        <span className="font-display text-2xl font-semibold text-foreground">Descargar CV</span>
        <span className="text-sm text-muted-foreground">Formato PDF actualizado</span>
      </motion.a>
    </SectionBlock>
  );
}
