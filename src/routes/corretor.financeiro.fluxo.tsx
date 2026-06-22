import { createFileRoute } from "@tanstack/react-router";
import { FluxoCaixaView } from "@/components/financeiro/fluxo-caixa";

export const Route = createFileRoute("/corretor/financeiro/fluxo")({
  component: () => <div className="p-6"><FluxoCaixaView escopo="corretor" /></div>,
});
