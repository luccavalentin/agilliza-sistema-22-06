import { createFileRoute } from "@tanstack/react-router";
import { ComissoesView } from "@/components/financeiro/comissoes-view";
export const Route = createFileRoute("/corretor/financeiro/comissoes")({ component: () => <ComissoesView escopo="corretor" /> });
