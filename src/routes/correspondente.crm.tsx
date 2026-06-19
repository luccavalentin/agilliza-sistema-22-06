import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/correspondente/crm")({
  component: () => <Outlet />,
});
