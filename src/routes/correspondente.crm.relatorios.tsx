import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/crm/relatorios")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · CRM"
      title="Relatórios"
      description="Relatórios analíticos e de gestão da base de clientes."
      icon={BarChart3}
    />
  ),
});
