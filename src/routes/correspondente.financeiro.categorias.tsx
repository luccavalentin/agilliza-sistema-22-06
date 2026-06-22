import { createFileRoute } from "@tanstack/react-router";
import { CategoriasView } from "@/components/financeiro/categorias-view";

export const Route = createFileRoute("/correspondente/financeiro/categorias")({
  component: () => <div className="p-6"><CategoriasView /></div>,
});
