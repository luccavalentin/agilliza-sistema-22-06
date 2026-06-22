import { createFileRoute } from "@tanstack/react-router";
import { AtualizacaoPropostas } from "@/components/operacional/atualizacao-propostas";

export const Route = createFileRoute("/corretor/operacional/atualizacao")({
  component: () => <div className="p-6"><AtualizacaoPropostas /></div>,
});
