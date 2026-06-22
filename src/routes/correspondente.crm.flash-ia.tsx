import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";
import { IntegrationPendingBanner } from "@/components/portal/integration-pending-banner";

export const Route = createFileRoute("/correspondente/crm/flash-ia")({
  component: () => (
    <div>
      <IntegrationPendingBanner />
      <SectionPlaceholder
        eyebrow="Correspondente · CRM"
        title="Flash IA"
        description="Insights rápidos gerados por IA para apoio à decisão."
        icon={BrainCircuit}
      />
    </div>
  ),
});
