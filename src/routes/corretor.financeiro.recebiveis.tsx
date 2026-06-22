import { createFileRoute } from "@tanstack/react-router";
import { ContasReceber } from "@/components/financeiro/contas-receber";

export const Route = createFileRoute("/corretor/financeiro/recebiveis")({
  component: () => <div className="p-6"><ContasReceber /></div>,
});
