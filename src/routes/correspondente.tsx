import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Activity,
  Wallet,
  Database,
} from "lucide-react";
import { PortalShell, type PortalNavGroup } from "@/components/portal-shell";

const groups: PortalNavGroup[] = [
  {
    label: "Principal",
    items: [
      { label: "Visão Geral", to: "/correspondente", icon: LayoutDashboard },
      { label: "CRM e Gestão de Cliente", to: "/correspondente/crm", icon: Users },
      { label: "Operacional", to: "/correspondente/operacional", icon: Activity },
      { label: "Gestão Financeira", to: "/correspondente/financeiro", icon: Wallet },
      { label: "Gestão Administrativa", to: "/correspondente/gestao", icon: Database },
    ],
  },
];

export const Route = createFileRoute("/correspondente")({
  head: () => ({
    meta: [{ title: "Correspondente — Plataforma de Crédito" }],
  }),
  component: () => (
    <PortalShell kind="correspondente" groups={groups}>
      <Outlet />
    </PortalShell>
  ),
});
