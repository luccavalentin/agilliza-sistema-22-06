import { createFileRoute } from "@tanstack/react-router";
import { ClienteCadastro } from "@/components/crm/cliente-cadastro";

export const Route = createFileRoute("/corretor/crm/cadastro")({
  component: () => <ClienteCadastro scope="corretor" />,
});
