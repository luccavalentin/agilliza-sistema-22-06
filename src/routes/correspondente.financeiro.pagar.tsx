import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpCircle } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/financeiro/pagar")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Financeiro"
      title="Contas a Pagar"
      description="Controle de obrigações e pagamentos."
      icon={ArrowUpCircle}
    />
  ),
});
