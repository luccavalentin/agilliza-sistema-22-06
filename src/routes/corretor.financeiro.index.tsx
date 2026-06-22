import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/financeiro/")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · Financeiro"
      title="Painel Financeiro"
      description="Visão financeira individual do corretor."
      icon={Wallet}
    />
  ),
});
