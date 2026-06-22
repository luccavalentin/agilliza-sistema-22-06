import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/crm/consultas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · CRM"
      title="Consultas"
      description="Pesquisa e filtros sobre a base de clientes."
      icon={Search}
    />
  ),
});
