import { createFileRoute } from "@tanstack/react-router";
import { DemandasSLA } from "@/components/operacional/demandas-sla";

export const Route = createFileRoute("/correspondente/operacional/demandas")({
  component: () => <DemandasSLA escopo="correspondente" />,
});
