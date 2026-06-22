import { createFileRoute } from "@tanstack/react-router";
import { ConsultasOperacionais } from "@/components/operacional/consultas-operacionais";

export const Route = createFileRoute("/corretor/operacional/consultas")({
  component: () => <div className="p-6"><ConsultasOperacionais escopo="corretor" /></div>,
});
