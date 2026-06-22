import { createFileRoute } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/crm/scan-ia")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor · CRM"
      title="Scan IA"
      description="Leitura inteligente de documentos do cliente via IA."
      icon={ScanLine}
    />
  ),
});
