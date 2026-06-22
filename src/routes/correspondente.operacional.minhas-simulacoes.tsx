import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/operacional/minhas-simulacoes")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Operacional"
      title="Minhas Simulações"
      description="Simulações criadas pelo usuário logado."
      icon={Sparkles}
    />
  ),
});
