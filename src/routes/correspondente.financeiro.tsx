import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/financeiro")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente"
      title="Gestão Financeira"
      description="Controle financeiro consolidado: contas, comissões, fluxo de caixa e conciliação do ecossistema."
      icon={Wallet}
    />
  ),
});
