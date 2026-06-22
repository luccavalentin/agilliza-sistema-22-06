import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/correspondente/financeiro")({
  component: () => <Outlet />,
});
