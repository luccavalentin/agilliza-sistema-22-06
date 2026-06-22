import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownCircle } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/financeiro/recebiveis")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Financeiro"
      title="Meus Recebíveis"
      description="Recebíveis do corretor."
      icon={ArrowDownCircle}
    />
  ),
});
