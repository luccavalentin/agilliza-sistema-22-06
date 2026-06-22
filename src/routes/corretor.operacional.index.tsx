import { createFileRoute } from "@tanstack/react-router";
import { PainelOperacional } from "@/components/operacional/painel-operacional";

export const Route = createFileRoute("/corretor/operacional/")({
  component: () => <div className="p-6"><PainelOperacional escopo="corretor" /></div>,
});
