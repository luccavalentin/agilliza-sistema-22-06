import { useState } from "react";
import {
  Database, Users, Building2, Briefcase, MapPin, Tags,
  Layers, Search, Plus, Pencil, Trash2,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";

type EntityKey =
  | "corretores"
  | "imobiliarias"
  | "bancos"
  | "produtos"
  | "regioes"
  | "categorias";

const entities: { key: EntityKey; label: string; icon: typeof Database; count: number }[] = [
  { key: "corretores", label: "Corretores", icon: Users, count: 24 },
  { key: "imobiliarias", label: "Imobiliárias Parceiras", icon: Building2, count: 12 },
  { key: "bancos", label: "Bancos e Instituições", icon: Briefcase, count: 8 },
  { key: "produtos", label: "Produtos / Linhas de Crédito", icon: Layers, count: 15 },
  { key: "regioes", label: "Regiões de Atendimento", icon: MapPin, count: 6 },
  { key: "categorias", label: "Categorias e Tags", icon: Tags, count: 32 },
];

const sampleData: Record<EntityKey, { col1: string; col2: string; col3: string; col4: string }[]> = {
  corretores: [
    { col1: "Ana Paula Silva", col2: "CRECI 123456-F", col3: "São Paulo / SP", col4: "Ativo" },
    { col1: "Carlos Mendes", col2: "CRECI 654321-F", col3: "Rio de Janeiro / RJ", col4: "Ativo" },
    { col1: "Mariana Costa", col2: "CRECI 789012-F", col3: "Curitiba / PR", col4: "Ativo" },
    { col1: "Roberto Lima", col2: "CRECI 345678-F", col3: "Belo Horizonte / MG", col4: "Inativo" },
  ],
  imobiliarias: [
    { col1: "Lopes Imóveis", col2: "00.111.222/0001-33", col3: "São Paulo / SP", col4: "Ativo" },
    { col1: "Casa & Cia", col2: "00.222.333/0001-44", col3: "Campinas / SP", col4: "Ativo" },
    { col1: "Premium Real Estate", col2: "00.333.444/0001-55", col3: "Rio de Janeiro / RJ", col4: "Ativo" },
  ],
  bancos: [
    { col1: "Caixa Econômica Federal", col2: "104", col3: "Habitacional / SBPE", col4: "Conectado" },
    { col1: "Banco do Brasil", col2: "001", col3: "Habitacional / SFH", col4: "Pendente" },
    { col1: "Itaú", col2: "341", col3: "Habitacional / SBPE", col4: "Conectado" },
    { col1: "Santander", col2: "033", col3: "Habitacional / SBPE", col4: "Conectado" },
    { col1: "Bradesco", col2: "237", col3: "Habitacional / SFH", col4: "Conectado" },
  ],
  produtos: [
    { col1: "SBPE - Tabela SAC", col2: "Caixa", col3: "Até 80% LTV", col4: "Ativo" },
    { col1: "FGTS Pró-Cotista", col2: "Caixa", col3: "Até 70% LTV", col4: "Ativo" },
    { col1: "Casa Verde e Amarela", col2: "Caixa", col3: "Até 90% LTV", col4: "Ativo" },
    { col1: "Crédito com Garantia", col2: "Santander", col3: "Refinanciamento", col4: "Ativo" },
  ],
  regioes: [
    { col1: "Grande São Paulo", col2: "SP", col3: "39 municípios", col4: "Ativo" },
    { col1: "Baixada Santista", col2: "SP", col3: "9 municípios", col4: "Ativo" },
    { col1: "Região Metropolitana RJ", col2: "RJ", col3: "22 municípios", col4: "Ativo" },
  ],
  categorias: [
    { col1: "Lead Quente", col2: "Cliente", col3: "Alta prioridade", col4: "—" },
    { col1: "Aguardando Documentação", col2: "Proposta", col3: "Operacional", col4: "—" },
    { col1: "Em Análise Banco", col2: "Proposta", col3: "Operacional", col4: "—" },
    { col1: "Comissão Pendente", col2: "Financeiro", col3: "—", col4: "—" },
  ],
};

const columnLabels: Record<EntityKey, [string, string, string, string]> = {
  corretores: ["Nome", "CRECI", "Atuação", "Status"],
  imobiliarias: ["Razão Social", "CNPJ", "Localização", "Status"],
  bancos: ["Instituição", "Código", "Modalidades", "Integração"],
  produtos: ["Produto", "Banco", "Condições", "Status"],
  regioes: ["Região", "UF", "Cobertura", "Status"],
  categorias: ["Categoria", "Escopo", "Descrição", "—"],
};

export function CadastrosGeraisView() {
  const [entity, setEntity] = useState<EntityKey>("corretores");
  const [search, setSearch] = useState("");
  const cols = columnLabels[entity];
  const rows = sampleData[entity].filter((r) =>
    !search ? true : r.col1.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PanelHeader
        eyebrow="Correspondente · Administrativa"
        title="Cadastros Gerais"
        subtitle="Gerencie corretores, parceiros, bancos, produtos e parâmetros do sistema."
      />

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <nav className="rounded-xl border border-border bg-white p-2 shadow-sm">
          {entities.map((e) => {
            const Icon = e.icon;
            const active = entity === e.key;
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => setEntity(e.key)}
                className={[
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors",
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-graphite/80 hover:bg-secondary",
                ].join(" ")}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                  <span className="truncate">{e.label}</span>
                </span>
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-secondary text-graphite/60",
                  ].join(" ")}
                >
                  {e.count}
                </span>
              </button>
            );
          })}
        </nav>

        <section className="rounded-xl border border-border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Buscar em ${entities.find((e) => e.key === entity)?.label}…`}
                className="w-full rounded-md border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand/90">
              <Plus className="h-4 w-4" />
              Novo cadastro
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-[11px] font-bold uppercase tracking-wide text-graphite/60">
                <tr>
                  {cols.map((c) => (
                    <th key={c} className="px-4 py-3 text-left">{c}</th>
                  ))}
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-secondary/40">
                    <td className="px-4 py-3 font-semibold text-graphite">{r.col1}</td>
                    <td className="px-4 py-3 text-graphite/80">{r.col2}</td>
                    <td className="px-4 py-3 text-graphite/80">{r.col3}</td>
                    <td className="px-4 py-3">
                      <StatusPill value={r.col4} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button className="rounded-md p-1.5 text-graphite/60 hover:bg-secondary hover:text-brand" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="rounded-md p-1.5 text-graphite/60 hover:bg-secondary hover:text-red-600" title="Remover">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const v = value.toLowerCase();
  const styles =
    v === "ativo" || v === "conectado"
      ? "bg-emerald-100 text-emerald-700"
      : v === "pendente"
      ? "bg-amber-100 text-amber-700"
      : v === "inativo"
      ? "bg-gray-100 text-gray-600"
      : "bg-secondary text-graphite/60";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles}`}>
      {value}
    </span>
  );
}
