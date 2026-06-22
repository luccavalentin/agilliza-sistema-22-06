import { createFileRoute } from "@tanstack/react-router";
import { CadastrosGeraisView } from "@/components/portal/cadastros-gerais-view";

export const Route = createFileRoute("/correspondente/gestao")({
  component: () => <CadastrosGeraisView />,
});
