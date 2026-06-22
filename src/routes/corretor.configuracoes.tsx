import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/configuracoes")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor"
      title="Configurações"
      description="Preferências e ajustes do corretor."
      icon={Settings}
    />
  ),
});
