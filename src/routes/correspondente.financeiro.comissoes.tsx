import { createFileRoute } from "@tanstack/react-router";
import { ComissoesView } from "@/components/financeiro/comissoes-view";

export const Route = createFileRoute("/correspondente/financeiro/comissoes")({
  component: () => <div className="p-6"><ComissoesView escopo="correspondente" /></div>,
});
