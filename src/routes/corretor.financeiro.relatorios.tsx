import { createFileRoute } from "@tanstack/react-router";
import { RelatoriosFinanceiros } from "@/components/financeiro/relatorios-financeiros";

export const Route = createFileRoute("/corretor/financeiro/relatorios")({
  component: () => <div className="p-6"><RelatoriosFinanceiros escopo="corretor" /></div>,
});
