import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/gestao")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente"
      title="Gestão Administrativa"
      description="Cadastros estruturais, gestão de corretores e clientes, permissões e parâmetros administrativos do ecossistema."
      icon={Database}
    />
  ),
});
