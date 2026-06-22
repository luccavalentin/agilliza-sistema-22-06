import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownCircle } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/financeiro/receber")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Financeiro"
      title="Contas a Receber"
      description="Controle de recebíveis e cobranças."
      icon={ArrowDownCircle}
    />
  ),
});
