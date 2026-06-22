import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/crm")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor"
      title="CRM e Gestão de Clientes"
      description="Acompanhamento da carteira de clientes do corretor, jornadas e oportunidades comerciais."
      icon={Users}
    />
  ),
});
