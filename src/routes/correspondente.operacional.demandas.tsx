import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/operacional/demandas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Operacional"
      title="Demandas & SLA"
      description="Controle de demandas, prazos e acordos de nível de serviço."
      icon={Clock}
    />
  ),
});
