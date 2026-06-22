import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/relatorios")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor"
      title="Relatórios e Dashboards"
      description="Indicadores comerciais, métricas de produção e relatórios analíticos do corretor."
      icon={BarChart3}
    />
  ),
});
