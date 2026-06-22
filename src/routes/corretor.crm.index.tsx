import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/crm/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · CRM"
      title="Dashboard de Clientes"
      description="Visão consolidada da carteira do corretor."
      icon={LayoutDashboard}
    />
  ),
});
