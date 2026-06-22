import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/operacional")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente"
      title="Operacional"
      description="Gestão de simulações, propostas, demandas e fluxo operacional de crédito imobiliário e home equity."
      icon={Activity}
    />
  ),
});
