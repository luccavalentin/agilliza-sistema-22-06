import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/crm/cadastro")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · CRM"
      title="Cadastro de Cliente"
      description="Registro e manutenção de dados cadastrais dos clientes."
      icon={UserPlus}
    />
  ),
});
