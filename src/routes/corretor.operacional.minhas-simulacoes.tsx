import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/operacional/minhas-simulacoes")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Operacional"
      title="Minhas Simulações"
      description="Simulações do corretor logado."
      icon={Sparkles}
    />
  ),
});
