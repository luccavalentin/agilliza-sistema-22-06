import { createFileRoute } from "@tanstack/react-router";
import { ConfiguracoesView } from "@/components/portal/configuracoes-view";

export const Route = createFileRoute("/corretor/configuracoes")({
  component: () => <ConfiguracoesView escopo="corretor" />,
});
