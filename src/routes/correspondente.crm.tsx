import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/crm")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente"
      title="CRM e Gestão de Cliente"
      description="Centralização do relacionamento com clientes, cadastros, consultas e acompanhamento de jornada de crédito."
      icon={Users}
    />
  ),
});
