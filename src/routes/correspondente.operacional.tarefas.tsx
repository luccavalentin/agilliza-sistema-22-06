import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/operacional/tarefas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Operacional"
      title="Minhas Tarefas"
      description="Lista de tarefas operacionais do usuário logado."
      icon={ListChecks}
    />
  ),
});
