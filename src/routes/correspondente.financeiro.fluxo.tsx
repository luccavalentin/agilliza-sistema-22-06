import { createFileRoute } from "@tanstack/react-router";
import { FluxoCaixaView } from "@/components/financeiro/fluxo-caixa";
export const Route = createFileRoute("/correspondente/financeiro/fluxo")({ component: () => <FluxoCaixaView escopo="correspondente" /> });
