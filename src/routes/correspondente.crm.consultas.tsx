import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/crm/consultas")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · CRM"
      title="Consultas"
      description="Pesquisa avançada e filtros sobre a base de clientes."
      icon={Search}
    />
  ),
});
