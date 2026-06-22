import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/operacional/consultas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Operacional"
      title="Consultas"
      description="Consultas operacionais aos processos em andamento."
      icon={Search}
    />
  ),
});
