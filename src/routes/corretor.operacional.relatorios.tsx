import { createFileRoute } from "@tanstack/react-router";
import { RelatoriosOperacionais } from "@/components/operacional/relatorios-operacionais";

export const Route = createFileRoute("/corretor/operacional/relatorios")({
  component: () => <div className="p-6"><RelatoriosOperacionais escopo="corretor" /></div>,
});
