import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/financeiro/fluxo")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Financeiro"
      title="Fluxo de Caixa"
      description="Acompanhamento do fluxo de caixa."
      icon={TrendingUp}
    />
  ),
});
