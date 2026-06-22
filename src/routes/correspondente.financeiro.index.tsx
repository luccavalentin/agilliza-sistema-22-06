import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/financeiro/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · Financeiro"
      title="Painel Financeiro"
      description="Visão consolidada da saúde financeira do correspondente."
      icon={Wallet}
    />
  ),
});
