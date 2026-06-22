import { createFileRoute } from "@tanstack/react-router";
import { ContasPagar } from "@/components/financeiro/contas-pagar";

export const Route = createFileRoute("/corretor/financeiro/despesas")({
  component: () => <div className="p-6"><ContasPagar /></div>,
});
