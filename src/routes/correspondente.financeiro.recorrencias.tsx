import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/financeiro/recorrencias")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Financeiro"
      title="Recorrências"
      description="Gestão de lançamentos recorrentes."
      icon={RefreshCw}
    />
  ),
});
