import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/operacional/propostas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Operacional"
      title="Propostas"
      description="Acompanhamento e gestão das propostas em andamento."
      icon={CheckCircle2}
    />
  ),
});
