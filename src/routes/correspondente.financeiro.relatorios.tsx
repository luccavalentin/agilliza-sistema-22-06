import { createFileRoute } from "@tanstack/react-router";
import { RelatoriosFinanceiros } from "@/components/financeiro/relatorios-financeiros";

export const Route = createFileRoute("/correspondente/financeiro/relatorios")({
  component: () => <div className="p-6"><RelatoriosFinanceiros escopo="correspondente" /></div>,
});
