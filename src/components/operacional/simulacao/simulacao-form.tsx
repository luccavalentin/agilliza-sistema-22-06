// Formulário da simulação Homefin — controlado pelo pai.

import { Building2, Calculator, CheckCircle2, Loader2 } from "lucide-react";
import { BankLogo } from "@/components/operacional/bank-logo";
import { bancos as bancosMock } from "@/lib/operacional/mock-data";
import { Field, SectionCard, inputCls } from "./form-fields";
import type { SimulacaoForm } from "./types";

const UFS = ["SP","RJ","MG","RS","PR","SC","BA","DF","CE","PE","GO"];

export function SimulacaoFormPanel({
  form, onChange, onSubmit, loading,
}: {
  form: SimulacaoForm;
  onChange: (patch: Partial<SimulacaoForm>) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const toggleBanco = (id: string) =>
    onChange({
      bancosSelecionados: form.bancosSelecionados.includes(id)
        ? form.bancosSelecionados.filter((b) => b !== id)
        : [...form.bancosSelecionados, id],
    });

  return (
    <SectionCard
      title="Dados do imóvel & operação"
      icon={<Building2 className="h-4 w-4 text-brand" />}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Tipo do imóvel">
          <select value={form.tipoImovel} onChange={(e) => onChange({ tipoImovel: e.target.value })} className={inputCls}>
            <option value="1">Casa</option><option value="2">Apartamento</option><option value="3">Comercial</option>
          </select>
        </Field>
        <Field label="Uso">
          <select value={form.usoImovel} onChange={(e) => onChange({ usoImovel: e.target.value })} className={inputCls}>
            <option value="1">Residencial</option><option value="2">Comercial</option>
          </select>
        </Field>
        <Field label="Situação">
          <select value={form.situacaoImovel} onChange={(e) => onChange({ situacaoImovel: e.target.value })} className={inputCls}>
            <option value="N">Novo</option><option value="U">Usado</option>
          </select>
        </Field>
        <Field label="UF">
          <select value={form.uf} onChange={(e) => onChange({ uf: e.target.value })} className={inputCls}>
            {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </Field>
        <Field label="Valor do imóvel">
          <input type="number" value={form.valorImovel} onChange={(e) => onChange({ valorImovel: +e.target.value })} className={inputCls} />
        </Field>
        <Field label="Valor do financiamento">
          <input type="number" value={form.valorFinanciamento} onChange={(e) => onChange({ valorFinanciamento: +e.target.value })} className={inputCls} />
        </Field>
        <Field label="Prazo (meses)">
          <input type="number" value={form.prazo} onChange={(e) => onChange({ prazo: +e.target.value })} className={inputCls} />
        </Field>
        <Field label="Sistema de amortização">
          <select value={form.sistemaAmortizacao} onChange={(e) => onChange({ sistemaAmortizacao: e.target.value })} className={inputCls}>
            <option value="SAC">SAC</option><option value="PRICE">PRICE</option>
          </select>
        </Field>
        <Field label="Estado civil">
          <select value={form.estadoCivil} onChange={(e) => onChange({ estadoCivil: e.target.value })} className={inputCls}>
            <option value="1">Solteiro</option><option value="2">Casado</option><option value="3">Divorciado</option><option value="4">Viúvo</option>
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <label className="inline-flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" checked={form.utilizaFgts} onChange={(e) => onChange({ utilizaFgts: e.target.checked })} className="accent-brand" />
          Utiliza FGTS
        </label>
        <label className="inline-flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" checked={form.fgFinanciarDespesas} onChange={(e) => onChange({ fgFinanciarDespesas: e.target.checked })} className="accent-brand" />
          Financiar despesas
        </label>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-3">Participante</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Nome"><input value={form.nome} onChange={(e) => onChange({ nome: e.target.value })} className={inputCls} /></Field>
          <Field label="CPF/CNPJ"><input value={form.cpfCnpj} onChange={(e) => onChange({ cpfCnpj: e.target.value })} className={inputCls} /></Field>
          <Field label="Data de nascimento"><input type="date" value={form.dataNascimento} onChange={(e) => onChange({ dataNascimento: e.target.value })} className={inputCls} /></Field>
          <Field label="Renda total"><input type="number" value={form.renda} onChange={(e) => onChange({ renda: +e.target.value })} className={inputCls} /></Field>
          <Field label="E-mail"><input value={form.email} onChange={(e) => onChange({ email: e.target.value })} className={inputCls} /></Field>
          <Field label="Celular"><input value={form.celular} onChange={(e) => onChange({ celular: e.target.value })} className={inputCls} /></Field>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-3">Bancos para simular</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {bancosMock.map((b) => {
            const ativo = form.bancosSelecionados.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
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
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand text-white font-bold text-sm px-5 py-2.5 shadow-sm hover:bg-brand/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
          {loading ? "Simulando…" : "Executar simulação"}
        </button>
      </div>
    </SectionCard>
  );
}
