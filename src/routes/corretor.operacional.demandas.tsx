import { createFileRoute } from "@tanstack/react-router";
import { DemandasSLA } from "@/components/operacional/demandas-sla";

export const Route = createFileRoute("/corretor/operacional/demandas")({
  component: () => <div className="p-6"><DemandasSLA escopo="corretor" /></div>,
});
