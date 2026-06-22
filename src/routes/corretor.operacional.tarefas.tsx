import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/operacional/tarefas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Operacional"
      title="Minhas Tarefas"
      description="Lista de tarefas do corretor."
      icon={ListChecks}
    />
  ),
});
