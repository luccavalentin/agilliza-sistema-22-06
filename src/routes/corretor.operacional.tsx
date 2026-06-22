import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/operacional")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor"
      title="Operacional"
      description="Simulações, propostas e acompanhamento operacional dos processos de crédito do corretor."
      icon={Activity}
    />
  ),
});
