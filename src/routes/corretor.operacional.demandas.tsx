import { createFileRoute } from "@tanstack/react-router";
import { DemandasSLA } from "@/components/operacional/demandas-sla";

export const Route = createFileRoute("/corretor/operacional/demandas")({
  component: () => <DemandasSLA escopo="corretor" />,
});
