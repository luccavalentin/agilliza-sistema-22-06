import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/crm/cadastro")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · CRM"
      title="Cadastro de Cliente"
      description="Registro e manutenção dos dados dos clientes."
      icon={UserPlus}
    />
  ),
});
