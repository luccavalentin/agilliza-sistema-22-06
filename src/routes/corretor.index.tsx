import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Portal do Corretor"
      title="Visão Geral"
      description="Painel comercial do corretor com indicadores de carteira, acompanhamento de clientes e produção."
      icon={LayoutDashboard}
    />
  ),
});
