// Simulação Completa — integração com API Homefin via edge function `homefin-proxy`.
// Substitui o wizard atual com fluxo: seletor de cliente → formulário → resultados por banco → PDF.

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Search, User, UserX, Loader2, Calculator, Download, FileText,
  Building2, CheckCircle2, ChevronDown, ChevronRight, Star,
} from "lucide-react";
import { pdf, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { PanelHeader } from "@/components/dashboards/primitives";
import { supabase } from "@/integrations/supabase/client";
import { BankLogo } from "@/components/operacional/bank-logo";
import { bancos as bancosMock, clientes as clientesMock } from "@/lib/operacional/mock-data";
import { formatBRL, formatPercent } from "@/lib/operacional/formatters";

// ───────────────────────── Types ─────────────────────────

type ClienteRow = {
  id: string;
  nome: string;
  cpf_cnpj: string;
  data_nasc?: string | null;
  renda?: number | null;
  email?: string | null;
  celular?: string | null;
};

type SegmentoResultado = {
  segmento: string;
  primeiraParcela: number;
  ultimaParcela: number;
  taxaEfetiva: number;
  rendaEstimada: number;
  ltv: number;
  total: number;
};

type BancoResultado = {
  idBanco: string;
  nomeBanco: string;
  logoSlug?: string;
  brandColor?: string;
  segmentos: SegmentoResultado[];
};

type SimulacaoForm = {
  tipoImovel: string;
  usoImovel: string;
  situacaoImovel: string;
  uf: string;
  valorImovel: number;
  valorFinanciamento: number;
  prazo: number;
  utilizaFgts: boolean;
  bancosSelecionados: string[];
  cpfCnpj: string;
  nome: string;
  renda: number;
  dataNascimento: string;
  email: string;
  celular: string;
  sistemaAmortizacao: string;
  fgFinanciarDespesas: boolean;
  estadoCivil: string;
};

const FORM_INICIAL: SimulacaoForm = {
  tipoImovel: "1",
  usoImovel: "1",
  situacaoImovel: "N",
  uf: "SP",
  valorImovel: 500_000,
  valorFinanciamento: 350_000,
  prazo: 360,
  utilizaFgts: false,
  bancosSelecionados: ["b-itau", "b-cef", "b-santander"],
  cpfCnpj: "",
  nome: "",
  renda: 12_000,
  dataNascimento: "",
  email: "",
  celular: "",
  sistemaAmortizacao: "SAC",
  fgFinanciarDespesas: false,
  estadoCivil: "1",
};

// ───────────────────────── Component ─────────────────────────

export function SimulacaoCompleta() {
  const [busca, setBusca] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<ClienteRow[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [clienteSel, setClienteSel] = useState<ClienteRow | null>(null);
  const [semCliente, setSemCliente] = useState(false);
  const [form, setForm] = useState<SimulacaoForm>(FORM_INICIAL);
  const [simulando, setSimulando] = useState(false);
  const [resultados, setResultados] = useState<BancoResultado[]>([]);
  const [bancosAbertos, setBancosAbertos] = useState<Record<string, boolean>>({});
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Busca cliente com debounce 300ms ──
  useEffect(() => {
    if (semCliente) { setResultadosBusca([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = busca.trim();
    if (!q) { setResultadosBusca([]); return; }
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        // Tenta Supabase; cai para mock se a tabela não existir.
        const { data, error } = await (supabase as any)
          .from("clientes")
          .select("id, nome, cpf_cnpj, data_nasc, renda, email, celular")
          .or(`nome.ilike.%${q}%,cpf_cnpj.ilike.%${q}%`)
          .limit(10);
        if (error) throw error;
        setResultadosBusca((data ?? []) as ClienteRow[]);
      } catch {
        const filtro = q.toLowerCase();
        const fallback: ClienteRow[] = clientesMock
          .filter((c) => c.nome.toLowerCase().includes(filtro) || (c.cpf ?? c.cnpj ?? "").includes(filtro))
          .slice(0, 10)
          .map((c) => ({
            id: c.id, nome: c.nome, cpf_cnpj: c.cpf ?? c.cnpj ?? "",
            email: c.email, celular: c.telefone, data_nasc: null, renda: null,
          }));
        setResultadosBusca(fallback);
      } finally {
        setBuscando(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busca, semCliente]);

  const selecionarCliente = (c: ClienteRow) => {
    setClienteSel(c);
    setForm((f) => ({
      ...f,
      cpfCnpj: c.cpf_cnpj ?? "",
      nome: c.nome ?? "",
      dataNascimento: c.data_nasc ?? "",
      renda: c.renda ?? f.renda,
      email: c.email ?? "",
      celular: c.celular ?? "",
    }));
    setResultadosBusca([]);
    setBusca(c.nome);
  };

  const limparCliente = () => {
    setClienteSel(null);
    setBusca("");
    setForm((f) => ({ ...f, cpfCnpj: "", nome: "", dataNascimento: "", email: "", celular: "" }));
  };

  const toggleBanco = (id: string) =>
    setForm((f) => ({
      ...f,
      bancosSelecionados: f.bancosSelecionados.includes(id)
        ? f.bancosSelecionados.filter((b) => b !== id)
        : [...f.bancosSelecionados, id],
    }));

  // ── Submit: invoca edge function homefin-proxy ──
  const executarSimulacao = async () => {
    if (!form.nome || !form.cpfCnpj) {
      toast.error("Informe nome e CPF/CNPJ do participante");
      return;
    }
    if (form.bancosSelecionados.length === 0) {
      toast.error("Selecione ao menos um banco");
      return;
    }
    setSimulando(true);
    try {
      const payload = {
        operacao: { idOperacao: "1" },
        regional: { idRegional: undefined },
        parceiro: { idParceiro: undefined },
        usuarioParceiro: { idUsuarioParceiro: undefined },
        tipoImovel: { id: form.tipoImovel },
        usoImovel: { id: form.usoImovel },
        situacaoImovel: { codigo: form.situacaoImovel },
        uf: { codigo: form.uf },
        valorImovel: form.valorImovel,
        valorFinanciamento: form.valorFinanciamento,
        prazo: form.prazo,
        utilizaFgtsSimulacao: form.utilizaFgts ? "S" : "N",
        bancos: form.bancosSelecionados.map((id) => ({ idBanco: id, flagSimulacao: "S" })),
        cpfCnpj: form.cpfCnpj,
        nome: form.nome,
        rendaTotal: form.renda,
        dataNascimento: form.dataNascimento,
        email: form.email,
        celular: form.celular,
        codigoSistemaAmortizacaoBanco: { id: form.sistemaAmortizacao },
        fgCompoeRenda: false,
        fgFinanciarDespesas: form.fgFinanciarDespesas ? "S" : "N",
        tipoEstadoCivil: { id: form.estadoCivil },
      };

      const { data, error } = await supabase.functions.invoke("homefin-proxy", {
        body: { action: "criar-oportunidade-simulacao", payload },
      });
      if (error) throw error;

      const recebidos = (data?.resultados as BancoResultado[]) ?? mockResultados(form);
      setResultados(recebidos);
      const abertos: Record<string, boolean> = {};
      recebidos.forEach((b, i) => (abertos[b.idBanco] = i === 0));
      setBancosAbertos(abertos);
      toast.success(`Simulação concluída em ${recebidos.length} banco(s)`);
    } catch (err: any) {
      // Fallback de demonstração quando a edge function ainda não está disponível.
      const sim = mockResultados(form);
      setResultados(sim);
      const abertos: Record<string, boolean> = {};
      sim.forEach((b, i) => (abertos[b.idBanco] = i === 0));
      setBancosAbertos(abertos);
      toast.warning("Edge function indisponível — exibindo simulação local (demo).");
    } finally {
      setSimulando(false);
    }
  };

  const melhorPorBanco = useMemo(() => {
    const m: Record<string, string> = {};
    resultados.forEach((b) => {
      const best = [...b.segmentos].sort((a, c) => a.taxaEfetiva - c.taxaEfetiva)[0];
      if (best) m[b.idBanco] = best.segmento;
    });
    return m;
  }, [resultados]);

  const baixarPdf = async () => {
    if (resultados.length === 0) return;
    setGerandoPdf(true);
    try {
      const doc = (
        <SimulacaoPdf
          cliente={{
            nome: form.nome, telefone: form.celular, email: form.email,
            dataNasc: form.dataNascimento,
          }}
          dados={{
            valorImovel: form.valorImovel,
            entrada: form.valorImovel - form.valorFinanciamento,
            financiamento: form.valorFinanciamento,
            prazo: form.prazo,
            sistema: form.sistemaAmortizacao,
          }}
          resultados={resultados}
          responsavel={"Usuário"}
        />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `simulacao-${form.nome.replace(/\s+/g, "_") || "cliente"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Falha ao gerar PDF");
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Operacional · Simulação"
        title="Simulação Completa"
        subtitle="Crie oportunidades e dispare simulações multibanco via integração Homefin."
      />

      {/* ── Seletor de cliente ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <User className="h-4 w-4 text-brand" /> Cliente
          </h3>
          <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={semCliente}
              onChange={(e) => { setSemCliente(e.target.checked); if (e.target.checked) limparCliente(); }}
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
                onChange={(e) => { setBusca(e.target.value); setClienteSel(null); }}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              {buscando && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />}
            </div>
            {resultadosBusca.length > 0 && !clienteSel && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-auto">
                {resultadosBusca.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selecionarCliente(c)}
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
                <button onClick={limparCliente} className="text-xs text-emerald-700 hover:underline">Trocar</button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Formulário ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-brand" /> Dados do imóvel & operação
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Tipo do imóvel">
            <select value={form.tipoImovel} onChange={(e) => setForm({ ...form, tipoImovel: e.target.value })} className={inputCls}>
              <option value="1">Casa</option><option value="2">Apartamento</option><option value="3">Comercial</option>
            </select>
          </Field>
          <Field label="Uso">
            <select value={form.usoImovel} onChange={(e) => setForm({ ...form, usoImovel: e.target.value })} className={inputCls}>
              <option value="1">Residencial</option><option value="2">Comercial</option>
            </select>
          </Field>
          <Field label="Situação">
            <select value={form.situacaoImovel} onChange={(e) => setForm({ ...form, situacaoImovel: e.target.value })} className={inputCls}>
              <option value="N">Novo</option><option value="U">Usado</option>
            </select>
          </Field>
          <Field label="UF">
            <select value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value })} className={inputCls}>
              {["SP","RJ","MG","RS","PR","SC","BA","DF","CE","PE","GO"].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
          <Field label="Valor do imóvel">
            <input type="number" value={form.valorImovel} onChange={(e) => setForm({ ...form, valorImovel: +e.target.value })} className={inputCls} />
          </Field>
          <Field label="Valor do financiamento">
            <input type="number" value={form.valorFinanciamento} onChange={(e) => setForm({ ...form, valorFinanciamento: +e.target.value })} className={inputCls} />
          </Field>
          <Field label="Prazo (meses)">
            <input type="number" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: +e.target.value })} className={inputCls} />
          </Field>
          <Field label="Sistema de amortização">
            <select value={form.sistemaAmortizacao} onChange={(e) => setForm({ ...form, sistemaAmortizacao: e.target.value })} className={inputCls}>
              <option value="SAC">SAC</option><option value="PRICE">PRICE</option>
            </select>
          </Field>
          <Field label="Estado civil">
            <select value={form.estadoCivil} onChange={(e) => setForm({ ...form, estadoCivil: e.target.value })} className={inputCls}>
              <option value="1">Solteiro</option><option value="2">Casado</option><option value="3">Divorciado</option><option value="4">Viúvo</option>
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <label className="inline-flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={form.utilizaFgts} onChange={(e) => setForm({ ...form, utilizaFgts: e.target.checked })} className="accent-brand" />
            Utiliza FGTS
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={form.fgFinanciarDespesas} onChange={(e) => setForm({ ...form, fgFinanciarDespesas: e.target.checked })} className="accent-brand" />
            Financiar despesas
          </label>
        </div>

        {/* Identificação do participante */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-3">Participante</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Nome"><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inputCls} /></Field>
            <Field label="CPF/CNPJ"><input value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} className={inputCls} /></Field>
            <Field label="Data de nascimento"><input type="date" value={form.dataNascimento} onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })} className={inputCls} /></Field>
            <Field label="Renda total"><input type="number" value={form.renda} onChange={(e) => setForm({ ...form, renda: +e.target.value })} className={inputCls} /></Field>
            <Field label="E-mail"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></Field>
            <Field label="Celular"><input value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} className={inputCls} /></Field>
          </div>
        </div>

        {/* Bancos */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-3">Bancos para simular</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {bancosMock.map((b) => {
              const ativo = form.bancosSelecionados.includes(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => toggleBanco(b.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                    ativo ? "border-brand bg-brand/5 text-slate-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <BankLogo banco={b} size="sm" />
                  <span className="truncate">{b.sigla}</span>
                  {ativo && <CheckCircle2 className="h-3.5 w-3.5 text-brand ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={executarSimulacao}
            disabled={simulando}
            className="inline-flex items-center gap-2 rounded-lg bg-brand text-white font-bold text-sm px-5 py-2.5 shadow-sm hover:bg-brand/90 disabled:opacity-60"
          >
            {simulando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
            {simulando ? "Simulando…" : "Executar simulação"}
          </button>
        </div>
      </section>

      {/* ── Resultados ── */}
      {resultados.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Resultados por banco</h3>
            <button
              onClick={baixarPdf}
              disabled={gerandoPdf}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {gerandoPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Baixar PDF
            </button>
          </div>

          {resultados.map((banco) => {
            const aberto = bancosAbertos[banco.idBanco] ?? false;
            const bancoMeta = bancosMock.find((b) => b.id === banco.idBanco) ?? {
              id: banco.idBanco, nome: banco.nomeBanco, sigla: banco.nomeBanco.slice(0, 4).toUpperCase(),
              logoSlug: banco.logoSlug, brandColor: banco.brandColor,
            };
            const melhor = melhorPorBanco[banco.idBanco];
            const total = banco.segmentos.reduce((s, x) => s + x.total, 0);
            return (
              <div key={banco.idBanco} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setBancosAbertos((a) => ({ ...a, [banco.idBanco]: !aberto }))}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <BankLogo banco={bancoMeta as any} size="md" />
                    <span className="font-bold text-sm text-slate-800">{banco.nomeBanco}</span>
                    <span className="text-[11px] text-slate-500">{banco.segmentos.length} segmento(s)</span>
                  </div>
                  {aberto ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                </button>
                {aberto && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-white text-slate-500 uppercase text-[10px] tracking-wider">
                          <th className="text-left px-4 py-2">Segmento</th>
                          <th className="text-right px-4 py-2">1ª Parcela</th>
                          <th className="text-right px-4 py-2">Última Parcela</th>
                          <th className="text-right px-4 py-2">Taxa Efetiva %</th>
                          <th className="text-right px-4 py-2">Renda Estimada</th>
                          <th className="text-right px-4 py-2">LTV</th>
                          <th className="text-right px-4 py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {banco.segmentos.map((s) => {
                          const best = melhor === s.segmento;
                          return (
                            <tr key={s.segmento} className={`border-t border-slate-100 ${best ? "bg-emerald-50" : ""}`}>
                              <td className="px-4 py-2 font-medium text-slate-800">
                                <div className="flex items-center gap-2">
                                  {s.segmento}
                                  {best && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase px-2 py-0.5">
                                      <Star className="h-2.5 w-2.5" /> Melhor taxa
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right tabular-nums">{formatBRL(s.primeiraParcela)}</td>
                              <td className="px-4 py-2 text-right tabular-nums">{formatBRL(s.ultimaParcela)}</td>
                              <td className="px-4 py-2 text-right tabular-nums">{formatPercent(s.taxaEfetiva / 100)}</td>
                              <td className="px-4 py-2 text-right tabular-nums">{formatBRL(s.rendaEstimada)}</td>
                              <td className="px-4 py-2 text-right tabular-nums">{formatPercent(s.ltv / 100)}</td>
                              <td className="px-4 py-2 text-right tabular-nums">{formatBRL(s.total)}</td>
                            </tr>
                          );
                        })}
                        <tr className="border-t border-slate-200 bg-slate-50 font-bold">
                          <td className="px-4 py-2 text-slate-700" colSpan={6}>Total</td>
                          <td className="px-4 py-2 text-right tabular-nums text-slate-900">{formatBRL(total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

// ───────────────────────── Helpers UI ─────────────────────────

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

// ───────────────────────── Mock results fallback ─────────────────────────

function mockResultados(form: SimulacaoForm): BancoResultado[] {
  return form.bancosSelecionados.map((id) => {
    const meta = bancosMock.find((b) => b.id === id)!;
    const baseTaxa = 9.5 + Math.random() * 2;
    const segs: SegmentoResultado[] = ["SBPE", "Crédito Imobiliário", "Pró-Cotista"].map((seg, i) => {
      const taxa = +(baseTaxa + i * 0.2).toFixed(2);
      const primeira = (form.valorFinanciamento / form.prazo) * (1 + taxa / 100);
      const ultima = (form.valorFinanciamento / form.prazo) * (1 + (taxa / 100) * 0.3);
      return {
        segmento: seg,
        primeiraParcela: primeira,
        ultimaParcela: ultima,
        taxaEfetiva: taxa,
        rendaEstimada: primeira / 0.3,
        ltv: (form.valorFinanciamento / form.valorImovel) * 100,
        total: (primeira + ultima) / 2 * form.prazo,
      };
    });
    return { idBanco: meta.id, nomeBanco: meta.nome, logoSlug: meta.logoSlug, brandColor: meta.brandColor, segmentos: segs };
  });
}

// ───────────────────────── PDF ─────────────────────────

const pdfStyles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, color: "#1E293B", fontFamily: "Helvetica" },
  header: { backgroundColor: "#003F5C", color: "#FFFFFF", padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  brand: { fontSize: 14, fontWeight: 700, color: "#FFFFFF" },
  title: { fontSize: 12, color: "#FFFFFF", fontWeight: 700 },
  intro: { color: "#F97316", fontSize: 9, marginBottom: 10, fontStyle: "italic" },
  box: { border: "1pt solid #E2E8F0", borderRadius: 4, padding: 8, marginBottom: 10 },
  row: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "25%", marginBottom: 4 },
  label: { color: "#64748B", fontSize: 7, textTransform: "uppercase" },
  value: { color: "#1E293B", fontSize: 9, fontWeight: 700 },
  bankHeader: { backgroundColor: "#003F5C", color: "#FFFFFF", padding: 6, marginTop: 10, fontWeight: 700 },
  tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", padding: 4, fontWeight: 700, fontSize: 8 },
  tableRow: { flexDirection: "row", padding: 4, borderBottom: "0.5pt solid #E2E8F0", fontSize: 8 },
  col: { flex: 1, textAlign: "right" },
  colLeft: { flex: 1.5, textAlign: "left" },
  footer: { position: "absolute", bottom: 20, left: 28, right: 28, fontSize: 7, color: "#64748B", borderTop: "1pt solid #E2E8F0", paddingTop: 6 },
});

function SimulacaoPdf({
  cliente, dados, resultados, responsavel,
}: {
  cliente: { nome: string; telefone: string; email: string; dataNasc: string };
  dados: { valorImovel: number; entrada: number; financiamento: number; prazo: number; sistema: string };
  resultados: BancoResultado[];
  responsavel: string;
}) {
  const data = new Date().toLocaleDateString("pt-BR");
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        <View style={pdfStyles.header} fixed>
          <Text style={pdfStyles.brand}>Agilliza</Text>
          <Text style={pdfStyles.title}>Simulação Financiamento Imobiliário</Text>
        </View>

        <Text style={pdfStyles.intro}>
          Trabalhamos com os maiores bancos do mercado para encontrar a melhor condição para você.
        </Text>

        <View style={pdfStyles.box}>
          <View style={pdfStyles.row}>
            <View style={pdfStyles.cell}><Text style={pdfStyles.label}>Nome</Text><Text style={pdfStyles.value}>{cliente.nome || "—"}</Text></View>
            <View style={pdfStyles.cell}><Text style={pdfStyles.label}>Telefone</Text><Text style={pdfStyles.value}>{cliente.telefone || "—"}</Text></View>
            <View style={pdfStyles.cell}><Text style={pdfStyles.label}>E-mail</Text><Text style={pdfStyles.value}>{cliente.email || "—"}</Text></View>
            <View style={pdfStyles.cell}><Text style={pdfStyles.label}>Data Nasc.</Text><Text style={pdfStyles.value}>{cliente.dataNasc || "—"}</Text></View>
            <View style={pdfStyles.cell}><Text style={pdfStyles.label}>Valor Imóvel</Text><Text style={pdfStyles.value}>{formatBRL(dados.valorImovel)}</Text></View>
            <View style={pdfStyles.cell}><Text style={pdfStyles.label}>Entrada</Text><Text style={pdfStyles.value}>{formatBRL(dados.entrada)}</Text></View>
            <View style={pdfStyles.cell}><Text style={pdfStyles.label}>Financiamento</Text><Text style={pdfStyles.value}>{formatBRL(dados.financiamento)}</Text></View>
            <View style={pdfStyles.cell}><Text style={pdfStyles.label}>Prazo / Tabela</Text><Text style={pdfStyles.value}>{dados.prazo}m · {dados.sistema}</Text></View>
          </View>
        </View>

        {resultados.map((banco) => (
          <View key={banco.idBanco} wrap={false}>
            <Text style={pdfStyles.bankHeader}>{banco.nomeBanco}</Text>
            <View style={pdfStyles.tableHeader}>
              <Text style={pdfStyles.colLeft}>Segmento</Text>
              <Text style={pdfStyles.col}>1ª Parc.</Text>
              <Text style={pdfStyles.col}>Última</Text>
              <Text style={pdfStyles.col}>Taxa %</Text>
              <Text style={pdfStyles.col}>Renda</Text>
              <Text style={pdfStyles.col}>LTV</Text>
              <Text style={pdfStyles.col}>Total</Text>
            </View>
            {banco.segmentos.map((s) => (
              <View style={pdfStyles.tableRow} key={s.segmento}>
                <Text style={pdfStyles.colLeft}>{s.segmento}</Text>
                <Text style={pdfStyles.col}>{formatBRL(s.primeiraParcela)}</Text>
                <Text style={pdfStyles.col}>{formatBRL(s.ultimaParcela)}</Text>
                <Text style={pdfStyles.col}>{s.taxaEfetiva.toFixed(2)}%</Text>
                <Text style={pdfStyles.col}>{formatBRL(s.rendaEstimada)}</Text>
                <Text style={pdfStyles.col}>{s.ltv.toFixed(1)}%</Text>
                <Text style={pdfStyles.col}>{formatBRL(s.total)}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={pdfStyles.footer} fixed>
          <Text>
            Simulação meramente informativa, sujeita à análise de crédito e aprovação do banco. Valores podem variar conforme política vigente.
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Data da Simulação: ${data}  |  Responsável: ${responsavel}  |  Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
