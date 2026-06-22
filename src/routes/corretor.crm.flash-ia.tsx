import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/crm/flash-ia")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · CRM"
      title="Flash IA"
      description="Insights rápidos por IA para apoio comercial."
      icon={BrainCircuit}
    />
  ),
});
