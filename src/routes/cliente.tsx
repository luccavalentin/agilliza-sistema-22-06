import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { PortalShell, type PortalNavGroup } from "@/components/portal-shell";

const groups: PortalNavGroup[] = [
  {
    label: "Principal",
    items: [
      { label: "Visão Geral", to: "/cliente", icon: LayoutDashboard },
    ],
  },
];

export const Route = createFileRoute("/cliente")({
  head: () => ({
    meta: [{ title: "Cliente — Plataforma de Crédito" }],
  }),
  component: () => (
    <PortalShell kind="cliente" groups={groups}>
      <Outlet />
    </PortalShell>
  ),
});
