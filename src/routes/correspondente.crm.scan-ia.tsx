import { createFileRoute } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";
import { IntegrationPendingBanner } from "@/components/portal/integration-pending-banner";

export const Route = createFileRoute("/correspondente/crm/scan-ia")({
  component: () => (
    <div>
      <IntegrationPendingBanner />
      <SectionPlaceholder
        eyebrow="Correspondente · CRM"
        title="Scan IA"
        description="Leitura inteligente de documentos e dados do cliente via IA."
        icon={ScanLine}
      />
    </div>
  ),
});
