// Busca de cliente com debounce 300ms; Supabase com fallback para mock local.

import { useEffect, useRef, useState } from "react";
import { Search, User, UserX, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { clientes as clientesMock } from "@/lib/operacional/mock-data";
import { SectionCard } from "./form-fields";
import type { ClienteRow } from "./types";

const DEBOUNCE_MS = 300;

async function buscarClientes(q: string): Promise<ClienteRow[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("clientes")
      .select("id, nome, cpf_cnpj, data_nasc, renda, email, celular")
      .or(`nome.ilike.%${q}%,cpf_cnpj.ilike.%${q}%`)
      .limit(10);
    if (error) throw error;
    return (data ?? []) as ClienteRow[];
  } catch {
    const filtro = q.toLowerCase();
    return clientesMock
      .filter((c) => c.nome.toLowerCase().includes(filtro) || (c.cpf ?? c.cnpj ?? "").includes(filtro))
      .slice(0, 10)
      .map((c) => ({
        id: c.id, nome: c.nome, cpf_cnpj: c.cpf ?? c.cnpj ?? "",
        email: c.email, celular: c.telefone, data_nasc: null, renda: null,
      }));
  }
}

export function ClienteSeletor({
  semCliente, onToggleSemCliente, clienteSel, onSelect, onClear,
}: {
  semCliente: boolean;
  onToggleSemCliente: (v: boolean) => void;
  clienteSel: ClienteRow | null;
  onSelect: (c: ClienteRow) => void;
  onClear: () => void;
}) {
  const [busca, setBusca] = useState(clienteSel?.nome ?? "");
  const [resultados, setResultados] = useState<ClienteRow[]>([]);
  const [buscando, setBuscando] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (semCliente) { setResultados([]); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = busca.trim();
    if (!q || (clienteSel && clienteSel.nome === busca)) { setResultados([]); return; }
    timerRef.current = setTimeout(async () => {
      setBuscando(true);
      try { setResultados(await buscarClientes(q)); }
      finally { setBuscando(false); }
    }, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [busca, semCliente, clienteSel]);

  const handleSelect = (c: ClienteRow) => {
    setBusca(c.nome);
    setResultados([]);
    onSelect(c);
  };

  const handleClear = () => { setBusca(""); onClear(); };

  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <User className="h-4 w-4 text-brand" /> Cliente
        </h3>
        <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={semCliente}
            onChange={(e) => { onToggleSemCliente(e.target.checked); if (e.target.checked) handleClear(); }}
            className="accent-brand"
          />
          <UserX className="h-3.5 w-3.5" /> Simulação sem cliente
        </label>
      </div>

      {!semCliente && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente por nome ou CPF/CNPJ…"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); if (clienteSel) onClear(); }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            {buscando && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />}
          </div>

          {resultados.length > 0 && !clienteSel && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-auto">
              {resultados.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="w-full text-left px-3 py-2 hover:bg-brand/5 border-b border-slate-100 last:border-0"
                >
                  <div className="text-sm font-medium text-slate-800">{c.nome}</div>
                  <div className="text-[11px] text-slate-500">{c.cpf_cnpj} · {c.email}</div>
                </button>
              ))}
            </div>
          )}

          {clienteSel && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-900">{clienteSel.nome}</span>
                <span className="text-emerald-700">· {clienteSel.cpf_cnpj}</span>
              </div>
              <button onClick={handleClear} className="text-xs text-emerald-700 hover:underline">Trocar</button>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
