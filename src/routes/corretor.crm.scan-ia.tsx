import { createFileRoute } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";
import { IntegrationPendingBanner } from "@/components/portal/integration-pending-banner";

export const Route = createFileRoute("/corretor/crm/scan-ia")({
  component: () => (
    <div>
      <IntegrationPendingBanner />
      <SectionPlaceholder
        eyebrow="Corretor · CRM"
        title="Scan IA"
        description="Leitura inteligente de documentos do cliente via IA."
        icon={ScanLine}
      />
    </div>
  ),
});
