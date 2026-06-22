import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/corretor/crm")({
  component: () => <Outlet />,
});
