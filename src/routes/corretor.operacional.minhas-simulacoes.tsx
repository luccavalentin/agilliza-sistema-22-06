import { createFileRoute } from "@tanstack/react-router";
import { MinhasSimulacoes } from "@/components/operacional/minhas-simulacoes";

export const Route = createFileRoute("/corretor/operacional/minhas-simulacoes")({
  component: () => <div className="p-6"><MinhasSimulacoes escopo="corretor" /></div>,
});
