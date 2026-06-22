import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/operacional/atualizacao")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Operacional"
      title="Atualização de Proposta"
      description="Atualização e acompanhamento de status das propostas."
      icon={RefreshCw}
    />
  ),
});
