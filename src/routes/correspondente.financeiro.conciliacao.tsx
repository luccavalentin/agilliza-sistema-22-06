import { createFileRoute } from "@tanstack/react-router";
import { ConciliacaoView } from "@/components/financeiro/conciliacao-view";
export const Route = createFileRoute("/correspondente/financeiro/conciliacao")({ component: () => <ConciliacaoView /> });
