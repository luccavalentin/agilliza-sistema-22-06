import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/operacional/simulacoes")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Operacional"
      title="Simulações"
      description="Simulações de crédito imobiliário e home equity."
      icon={Calculator}
    />
  ),
});
