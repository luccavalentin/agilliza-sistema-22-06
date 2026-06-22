import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente Imobiliário"
      title="Visão Geral"
      description="Painel central do correspondente com indicadores estratégicos, monitoramento operacional e visão consolidada do ecossistema."
      icon={LayoutDashboard}
    />
  ),
});
