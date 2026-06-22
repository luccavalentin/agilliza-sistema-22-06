import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/correspondente/backup")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Correspondente"
      title="Backup do Sistema"
      description="Rotinas de backup e proteção dos dados do ecossistema."
      icon={Database}
    />
  ),
});
