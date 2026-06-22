import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/financeiro/categorias")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Financeiro"
      title="Categorias Financeiras"
      description="Plano de contas e categorização financeira."
      icon={Layers}
    />
  ),
});
