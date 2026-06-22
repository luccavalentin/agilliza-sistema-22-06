import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Portal do Corretor"
      title="Painel de Monitoramento"
      description="Indicadores de carteira, acompanhamento de clientes e produção comercial."
      icon={LayoutDashboard}
    />
  ),
});
