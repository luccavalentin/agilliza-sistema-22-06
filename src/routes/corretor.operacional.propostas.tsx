import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/operacional/propostas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Operacional"
      title="Propostas"
      description="Propostas em andamento."
      icon={CheckCircle2}
    />
  ),
});
