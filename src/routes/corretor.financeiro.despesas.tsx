import { createFileRoute } from "@tanstack/react-router";
import { LancamentosLista } from "@/components/financeiro/lancamentos-lista";
export const Route = createFileRoute("/corretor/financeiro/despesas")({ component: () => <LancamentosLista tipo="pagar" escopo="corretor" /> });
