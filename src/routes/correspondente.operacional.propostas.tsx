import { createFileRoute } from "@tanstack/react-router";
import { PropostasKanban } from "@/components/operacional/propostas-kanban";

export const Route = createFileRoute("/correspondente/operacional/propostas")({
  component: () => <div className="p-6"><PropostasKanban escopo="correspondente" /></div>,
});
