import { createFileRoute } from "@tanstack/react-router";
import { FlashIaView } from "@/components/crm/flash-ia";

export const Route = createFileRoute("/correspondente/crm/flash-ia")({
  component: () => <FlashIaView scope="correspondente" />,
});
