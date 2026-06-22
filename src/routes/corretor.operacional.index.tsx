import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/operacional/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Operacional"
      title="Painel"
      description="Painel operacional do corretor."
      icon={Activity}
    />
  ),
});
