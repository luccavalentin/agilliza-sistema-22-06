import { createFileRoute } from "@tanstack/react-router";
import { Banknote } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/financeiro/comissoes")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Financeiro"
      title="Minhas Comissões"
      description="Apuração das comissões do corretor."
      icon={Banknote}
    />
  ),
});
