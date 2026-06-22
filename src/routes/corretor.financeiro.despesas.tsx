import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpCircle } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/financeiro/despesas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Financeiro"
      title="Minhas Despesas"
      description="Despesas do corretor."
      icon={ArrowUpCircle}
    />
  ),
});
