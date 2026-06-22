import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/financeiro/recorrencias")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Financeiro"
      title="Recorrências"
      description="Lançamentos recorrentes do corretor."
      icon={RefreshCw}
    />
  ),
});
