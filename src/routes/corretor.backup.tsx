import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/corretor/backup")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Corretor"
      title="Backup do Sistema"
      description="Rotinas de backup e proteção dos dados."
      icon={Database}
    />
  ),
});
