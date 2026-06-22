import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/cliente/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Portal do Cliente"
      title="Painel de Monitoramento"
      description="Acesso simplificado e seguro para acompanhar o seu processo de crédito."
      icon={LayoutDashboard}
    />
  ),
});
