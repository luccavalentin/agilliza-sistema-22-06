import { createFileRoute } from "@tanstack/react-router";
import { MinhasTarefas } from "@/components/operacional/minhas-tarefas";

export const Route = createFileRoute("/corretor/operacional/tarefas")({
  component: () => <MinhasTarefas escopo="corretor" />,
});
