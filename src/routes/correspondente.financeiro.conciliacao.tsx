import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/financeiro/conciliacao")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Financeiro"
      title="Conciliação"
      description="Conciliação bancária e financeira."
      icon={CheckSquare}
    />
  ),
});
