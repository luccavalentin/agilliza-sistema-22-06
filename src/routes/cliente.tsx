import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileSearch,
  FolderOpen,
  MessageCircle,
  History,
  UserCircle2,
} from "lucide-react";
import { PortalShell, type PortalNavGroup } from "@/components/portal-shell";

const groups: PortalNavGroup[] = [
  {
    label: "Minha Proposta",
    items: [
      { label: "Painel de Monitoramento", to: "/cliente", icon: LayoutDashboard },
      { label: "Acompanhar Minha Proposta", to: "/cliente/proposta", icon: FileSearch },
      { label: "Meus Documentos", to: "/cliente/documentos", icon: FolderOpen },
      { label: "Mensagens", to: "/cliente/mensagens", icon: MessageCircle },
      { label: "Histórico", to: "/cliente/historico", icon: History },
      { label: "Meus Dados", to: "/cliente/perfil", icon: UserCircle2 },
    ],
  },
];

export const Route = createFileRoute("/cliente")({
  head: () => ({
    meta: [{ title: "Cliente — Plataforma Agilliza" }],
  }),
  component: () => (
    <PortalShell kind="cliente" groups={groups}>
      <Outlet />
    </PortalShell>
  ),
});
