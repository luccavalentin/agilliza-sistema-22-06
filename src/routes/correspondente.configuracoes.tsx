import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/configuracoes")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente"
      title="Configurações"
      description="Preferências, parâmetros e ajustes da operação."
      icon={Settings}
    />
  ),
});
