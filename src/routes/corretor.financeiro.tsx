import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/financeiro")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor"
      title="Gestão Financeira"
      description="Recebíveis, comissões e visão financeira individual do corretor."
      icon={Wallet}
    />
  ),
});
