import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/cliente/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Portal do Cliente"
      title="Visão Geral"
      description="Acesso simplificado e seguro do cliente ao acompanhamento do seu processo de crédito."
      icon={LayoutDashboard}
    />
  ),
});
