import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/operacional/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Operacional"
      title="Painel"
      description="Painel de acompanhamento operacional consolidado."
      icon={Activity}
    />
  ),
});
