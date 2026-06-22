import { createFileRoute } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/crm/scan-ia")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente · CRM"
      title="Scan IA"
      description="Leitura inteligente de documentos e dados do cliente via IA."
      icon={ScanLine}
    />
  ),
});
