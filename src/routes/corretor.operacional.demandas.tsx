import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/operacional/demandas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Operacional"
      title="Demandas & SLA"
      description="Demandas, prazos e SLA."
      icon={Clock}
    />
  ),
});
