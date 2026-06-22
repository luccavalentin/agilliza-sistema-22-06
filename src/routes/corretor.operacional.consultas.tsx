import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/operacional/consultas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Operacional"
      title="Consultas"
      description="Consultas operacionais aos processos."
      icon={Search}
    />
  ),
});
