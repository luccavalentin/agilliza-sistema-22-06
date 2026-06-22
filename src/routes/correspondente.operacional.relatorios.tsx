import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/operacional/relatorios")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Operacional"
      title="Relatórios e Métricas Operacionais"
      description="Indicadores e relatórios da operação."
      icon={BarChart3}
    />
  ),
});
