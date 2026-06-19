import { createFileRoute } from "@tanstack/react-router";
import { LancamentosLista } from "@/components/financeiro/lancamentos-lista";
export const Route = createFileRoute("/correspondente/financeiro/receber")({ component: () => <LancamentosLista tipo="receber" escopo="correspondente" /> });
