import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/financeiro/relatorios")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Financeiro"
      title="Relatórios Financeiros e Métricas Operacionais"
      description="Indicadores e relatórios financeiros."
      icon={FileBarChart}
    />
  ),
});
