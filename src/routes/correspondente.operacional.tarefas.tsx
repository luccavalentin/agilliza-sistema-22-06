import { createFileRoute } from "@tanstack/react-router";
import { MinhasTarefas } from "@/components/operacional/minhas-tarefas";

export const Route = createFileRoute("/correspondente/operacional/tarefas")({
  component: () => <MinhasTarefas escopo="correspondente" />,
});
