import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Activity,
  Wallet,
  BarChart3,
} from "lucide-react";
import { PortalShell, type PortalNavGroup } from "@/components/portal-shell";

const groups: PortalNavGroup[] = [
  {
    label: "Principal",
    items: [
      { label: "Visão Geral", to: "/corretor", icon: LayoutDashboard },
      { label: "CRM e Gestão de Clientes", to: "/corretor/crm", icon: Users },
      { label: "Operacional", to: "/corretor/operacional", icon: Activity },
      { label: "Gestão Financeira", to: "/corretor/financeiro", icon: Wallet },
      { label: "Relatórios e Dashboards", to: "/corretor/relatorios", icon: BarChart3 },
    ],
  },
];

export const Route = createFileRoute("/corretor")({
  head: () => ({
    meta: [{ title: "Corretor — Plataforma de Crédito" }],
  }),
  component: () => (
    <PortalShell kind="corretor" groups={groups}>
      <Outlet />
    </PortalShell>
  ),
});
