import { createFileRoute } from "@tanstack/react-router";
import { Banknote } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/financeiro/comissoes")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Financeiro"
      title="Comissões"
      description="Apuração e gestão de comissões."
      icon={Banknote}
    />
  ),
});
