import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/operacional/simulacoes")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Operacional"
      title="Simulações"
      description="Simulações de crédito."
      icon={Calculator}
    />
  ),
});
