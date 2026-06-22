import { createFileRoute } from "@tanstack/react-router";
import { FileSearch } from "lucide-react";
import { SectionPlaceholder } from "@/components/portal/section-placeholder";

export const Route = createFileRoute("/cliente/proposta")({
  component: () => (
    <SectionPlaceholder
      eyebrow="Cliente"
      title="Acompanhar Minha Proposta"
      description="Acompanhamento seguro do andamento da proposta do cliente."
      icon={FileSearch}
    />
  ),
});
