import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/crm/flash-ia")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · CRM"
      title="Flash IA"
      description="Insights rápidos gerados por IA para apoio à decisão."
      icon={BrainCircuit}
    />
  ),
});
