import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/crm/relatorios")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · CRM"
      title="Relatórios"
      description="Relatórios da carteira de clientes."
      icon={BarChart3}
    />
  ),
});
