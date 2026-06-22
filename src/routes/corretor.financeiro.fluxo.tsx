import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/financeiro/fluxo")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Financeiro"
      title="Fluxo de Caixa"
      description="Fluxo de caixa do corretor."
      icon={TrendingUp}
    />
  ),
});
