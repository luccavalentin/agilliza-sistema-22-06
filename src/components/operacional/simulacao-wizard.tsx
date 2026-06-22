// Simulação multicenário — Wizard refinado com:
// - Imobiliária + Corretor responsável
// - Modo Simulação Genérica (CPF/CNPJ) ou Completa (cliente cadastrado / novo)
// - Modalidade: Com entrada / Sem entrada / Sem entrada com custas
// - Cálculo automático de C&V, financiamento, entrada (% editável), renda mín.
// - Prazo limitado pela idade (regra CEF 80a6m) com diálogo amigável
// - Sistema de amortização SAC / PRICE / AMBOS (comparativo)

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Building2, Calculator,
  CheckCircle2, Copy, Download, Home, Loader2, Search, Send, Share2, Sparkles,
  Star, User, UserPlus, Users, Wallet, X,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { bancos, clientes as clientesMock, imobiliarias, usuarios } from "@/lib/operacional/mock-data";
import type { Cenario, Cliente, Tabela } from "@/lib/operacional/types";
import { gerarCenarios } from "@/lib/operacional/simulador";
import {
  formatBRL, formatPercent, formatCpf, formatCnpj, onlyDigits,
} from "@/lib/operacional/formatters";
import {
  prazoMaxPorIdade, formatIdadeAnos, PRAZO_MAX_ABSOLUTO,
} from "@/lib/operacional/prazo-idade";
import { BankLogo } from "@/components/operacional/bank-logo";
import { downloadBrandedPdf } from "@/lib/pdf-export";

type TipoSimulacao = "generica" | "completa";
type Modalidade = "com_entrada" | "sem_entrada" | "sem_entrada_custas";
type SistemaAmort = "SAC" | "PRICE" | "AMBOS";
type IdentTipo = "cpf" | "cnpj";
type Step = "inicio" | "dados" | "cenarios" | "resumo" | "processando" | "resultados";

const taxaPadraoPorBanco: Record<string, number> = {
  "b-itau": 10.5, "b-bb": 10.2, "b-cef": 9.8,
  "b-santander": 10.7, "b-bradesco": 10.6, "b-inter": 11.0,
};

const PRAZOS_SUGERIDOS = [120, 180, 240, 300, 360, 420];

export function SimulacaoWizard({ escopo: _escopo }: { escopo: "correspondente" | "corretor" }) {
  const [step, setStep] = useState<Step>("inicio");

  // ── Início: imobiliária / corretor / tipo de simulação / cliente ──
  const [imobiliariaId, setImobiliariaId] = useState("");
  const [corretorRespId, setCorretorRespId] = useState("");
  const [tipoSimulacao, setTipoSimulacao] = useState<TipoSimulacao>("generica");

  // simulação completa - cliente
  const [clienteId, setClienteId] = useState("");
  const [novoClienteAberto, setNovoClienteAberto] = useState(false);
  const [novoCliente, setNovoCliente] = useState<{ nome: string; cpfCnpj: string; tipo: IdentTipo; email: string; telefone: string; dataNasc: string }>({
    nome: "", cpfCnpj: "", tipo: "cpf", email: "", telefone: "", dataNasc: "",
  });
  const [clientesLocais, setClientesLocais] = useState<Cliente[]>(clientesMock);
  const [buscaCliente, setBuscaCliente] = useState("");

  // simulação genérica - identificador rápido
  const [identTipo, setIdentTipo] = useState<IdentTipo>("cpf");
  const [identNumero, setIdentNumero] = useState("");
  const [dataNascGenerica, setDataNascGenerica] = useState("");

  // ── Imóvel & Financiamento ──
  const [modalidade, setModalidade] = useState<Modalidade>("com_entrada");
  const [valorImovel, setValorImovel] = useState(300_000);
  const [entradaPercent, setEntradaPercent] = useState(20);
  const [entradaManual, setEntradaManual] = useState(false);
  const [valorEntrada, setValorEntrada] = useState(60_000);
  const [custasPercent, setCustasPercent] = useState(5);
  const [prazoMeses, setPrazoMeses] = useState(360);
  const [rendaBruta, setRendaBruta] = useState(15_000);
  const [comprometimento, setComprometimento] = useState(30);
  const [sistema, setSistema] = useState<SistemaAmort>("AMBOS");

  // ── Cenários ──
  const [bancosSelecionados, setBancosSelecionados] = useState<string[]>(["b-itau", "b-cef", "b-santander"]);
  const [prazosSelecionados, setPrazosSelecionados] = useState<number[]>([240, 360]);
  const [prazoCustom, setPrazoCustom] = useState("");

  // ── Resultados ──
  const [cenarios, setCenarios] = useState<Cenario[]>([]);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [cenSelecionados, setCenSelecionados] = useState<Set<string>>(new Set());

  // ── Dialog prazo excedido ──
  const [prazoDialog, setPrazoDialog] = useState<{ tentado: number; permitido: number } | null>(null);

  // Cliente atualmente selecionado
  const clienteSelecionado = useMemo(
    () => clientesLocais.find((c) => c.id === clienteId),
    [clientesLocais, clienteId],
  );

  // Data de nascimento efetiva (cliente completo > genérica)
  const dataNascimentoEfetiva = useMemo(() => {
    if (tipoSimulacao === "completa") {
      // clientes mock não têm dataNasc, mas novos clientes têm
      const novo = clientesLocais.find((c) => c.id === clienteId) as (Cliente & { dataNasc?: string }) | undefined;
      return novo?.dataNasc ?? "";
    }
    return dataNascGenerica;
  }, [tipoSimulacao, clienteId, clientesLocais, dataNascGenerica]);

  const prazoMaximoIdade = useMemo(
    () => prazoMaxPorIdade(dataNascimentoEfetiva) ?? PRAZO_MAX_ABSOLUTO,
    [dataNascimentoEfetiva],
  );

  // Cálculos derivados de modalidade
  const calc = useMemo(() => {
    let compraVenda = valorImovel;
    let entrada = 0;
    let financiado = 0;
    if (modalidade === "com_entrada") {
      compraVenda = valorImovel;
      entrada = entradaManual ? valorEntrada : Math.round((entradaPercent / 100) * valorImovel);
      financiado = Math.max(0, valorImovel - entrada);
    } else if (modalidade === "sem_entrada") {
      // C&V inflado para liberar 100% do imóvel desejado: imóvel ÷ 0,8
      compraVenda = Math.round(valorImovel / 0.8);
      entrada = 0;
      financiado = valorImovel; // libera exatamente o valor desejado
    } else {
      // sem_entrada_custas: imóvel ÷ 0,75 (libera imóvel + custas embutidas)
      compraVenda = Math.round(valorImovel / 0.75);
      entrada = 0;
      financiado = valorImovel;
    }
    const custas = Math.round((custasPercent / 100) * valorImovel);
    return { compraVenda, entrada, financiado, custas };
  }, [modalidade, valorImovel, entradaPercent, entradaManual, valorEntrada, custasPercent]);

  // Sincroniza entrada absoluta quando percent muda
  useEffect(() => {
    if (!entradaManual && modalidade === "com_entrada") {
      setValorEntrada(Math.round((entradaPercent / 100) * valorImovel));
    }
  }, [entradaPercent, valorImovel, entradaManual, modalidade]);

  // Tabelas selecionadas derivadas do sistema
  const tabelasFromSistema: Tabela[] = sistema === "AMBOS" ? ["SAC", "PRICE"] : [sistema];

  const totalCenarios = bancosSelecionados.length * prazosSelecionados.length * tabelasFromSistema.length;
  const podeProcessar = totalCenarios > 0 && calc.financiado > 0;

  // Validações
  const podeAvancarInicio = !!corretorRespId && (
    tipoSimulacao === "completa"
      ? !!clienteId
      : (identNumero.length >= (identTipo === "cpf" ? 11 : 14))
  );

  const podeAvancarDados = valorImovel > 0 && calc.financiado > 0 && prazoMeses > 0;

  function tentarSetPrazo(n: number) {
    if (n > prazoMaximoIdade) {
      setPrazoDialog({ tentado: n, permitido: prazoMaximoIdade });
      setPrazoMeses(prazoMaximoIdade);
      return;
    }
    setPrazoMeses(n);
  }

  function corretoresDaImobiliaria() {
    const imob = imobiliarias.find((i) => i.id === imobiliariaId);
    const ids = imob?.corretoresIds ?? usuarios.filter((u) => u.papel === "corretor").map((u) => u.id);
    return usuarios.filter((u) => ids.includes(u.id));
  }

  function adicionarNovoCliente() {
    if (!novoCliente.nome.trim() || !novoCliente.cpfCnpj) {
      toast.error("Preencha nome e CPF/CNPJ do novo cliente.");
      return;
    }
    const id = `c-novo-${Date.now()}`;
    const cliente: Cliente & { dataNasc?: string } = {
      id, nome: novoCliente.nome.trim(),
      cpf: novoCliente.tipo === "cpf" ? onlyDigits(novoCliente.cpfCnpj) : undefined,
      cnpj: novoCliente.tipo === "cnpj" ? onlyDigits(novoCliente.cpfCnpj) : undefined,
      email: novoCliente.email || undefined,
      telefone: novoCliente.telefone ? onlyDigits(novoCliente.telefone) : undefined,
      corretorId: corretorRespId || undefined,
      dataNasc: novoCliente.dataNasc || undefined,
    };
    setClientesLocais((prev) => [cliente, ...prev]);
    setClienteId(id);
    setNovoClienteAberto(false);
    toast.success(`${cliente.nome} adicionado.`);
  }

  function processar() {
    setStep("processando");
    setTimeout(() => {
      const gerados = gerarCenarios({
        principal: calc.financiado,
        bancos: bancosSelecionados.map((id) => ({ id, taxaAaPercent: taxaPadraoPorBanco[id] ?? 10.5 })),
        prazos: prazosSelecionados,
        tabelas: tabelasFromSistema,
        comprometimentoRendaMaxPercent: comprometimento,
      });
      setCenarios(gerados);
      setStep("resultados");
    }, 1500);
  }

  function reiniciar() {
    setStep("inicio");
    setCenarios([]);
    setFavoritos(new Set());
    setCenSelecionados(new Set());
  }

  return (
    <div className="space-y-5">
      <PanelHeader
        eyebrow="OPERACIONAL"
        title="Nova Simulação"
        subtitle="Cenários multicenário (banco × prazo × tabela) com regras brasileiras de financiamento habitacional."
        right={
          step !== "inicio" && step !== "processando" && (
            <button
              onClick={reiniciar}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-graphite hover:border-brand/40 hover:text-brand"
            >
              <X className="h-3.5 w-3.5" /> Reiniciar
            </button>
          )
        }
      />

      <Stepper step={step} />

      {step === "inicio" && (
        <InicioStep
          imobiliariaId={imobiliariaId} setImobiliariaId={(v) => { setImobiliariaId(v); setCorretorRespId(""); }}
          corretorRespId={corretorRespId} setCorretorRespId={setCorretorRespId}
          corretores={corretoresDaImobiliaria()}
          tipoSimulacao={tipoSimulacao} setTipoSimulacao={setTipoSimulacao}
          clienteId={clienteId} setClienteId={setClienteId}
          clientes={clientesLocais}
          buscaCliente={buscaCliente} setBuscaCliente={setBuscaCliente}
          novoClienteAberto={novoClienteAberto} setNovoClienteAberto={setNovoClienteAberto}
          novoCliente={novoCliente} setNovoCliente={setNovoCliente}
          adicionarNovoCliente={adicionarNovoCliente}
          identTipo={identTipo} setIdentTipo={setIdentTipo}
          identNumero={identNumero} setIdentNumero={setIdentNumero}
          dataNascGenerica={dataNascGenerica} setDataNascGenerica={setDataNascGenerica}
          onNext={() => setStep("dados")}
          podeAvancar={podeAvancarInicio}
        />
      )}

      {step === "dados" && (
        <DadosStep
          modalidade={modalidade} setModalidade={setModalidade}
          valorImovel={valorImovel} setValorImovel={setValorImovel}
          entradaPercent={entradaPercent} setEntradaPercent={(n) => { setEntradaPercent(n); setEntradaManual(false); }}
          entradaManual={entradaManual} setEntradaManual={setEntradaManual}
          valorEntrada={valorEntrada} setValorEntrada={(n) => { setValorEntrada(n); setEntradaManual(true); }}
          custasPercent={custasPercent} setCustasPercent={setCustasPercent}
          prazoMeses={prazoMeses} tentarSetPrazo={tentarSetPrazo}
          prazoMaximoIdade={prazoMaximoIdade}
          dataNascimentoEfetiva={dataNascimentoEfetiva}
          rendaBruta={rendaBruta} setRendaBruta={setRendaBruta}
          comprometimento={comprometimento} setComprometimento={setComprometimento}
          sistema={sistema} setSistema={setSistema}
          calc={calc}
          onBack={() => setStep("inicio")}
          onNext={() => setStep("cenarios")}
          podeAvancar={podeAvancarDados}
        />
      )}

      {step === "cenarios" && (
        <CenariosStep
          bancosSel={bancosSelecionados} setBancosSel={setBancosSelecionados}
          prazosSel={prazosSelecionados} setPrazosSel={setPrazosSelecionados}
          prazoCustom={prazoCustom} setPrazoCustom={setPrazoCustom}
          sistema={sistema}
          prazoMaximoIdade={prazoMaximoIdade}
          onPrazoExcedido={(n) => setPrazoDialog({ tentado: n, permitido: prazoMaximoIdade })}
          onBack={() => setStep("dados")}
          onNext={() => setStep("resumo")}
        />
      )}

      {step === "resumo" && (
        <ResumoStep
          clienteNome={clienteSelecionado?.nome ?? (tipoSimulacao === "generica" ? `${identTipo.toUpperCase()} ${identTipo === "cpf" ? formatCpf(identNumero) : formatCnpj(identNumero)}` : "—")}
          corretorNome={usuarios.find((u) => u.id === corretorRespId)?.nome ?? "—"}
          imobiliariaNome={imobiliarias.find((i) => i.id === imobiliariaId)?.nome}
          calc={calc}
          prazoMeses={prazoMeses}
          sistema={sistema}
          bancosSel={bancosSelecionados}
          prazosSel={prazosSelecionados}
          totalCenarios={totalCenarios}
          onBack={() => setStep("cenarios")}
          onProcessar={processar}
          podeProcessar={podeProcessar}
        />
      )}

      {step === "processando" && <ProcessandoStep />}

      {step === "resultados" && (
        <ResultadosStep
          cenarios={cenarios}
          favoritos={favoritos} setFavoritos={setFavoritos}
          selecionados={cenSelecionados} setSelecionados={setCenSelecionados}
        />
      )}

      {prazoDialog && (
        <PrazoExcedidoDialog
          tentado={prazoDialog.tentado}
          permitido={prazoDialog.permitido}
          idadeMostrar={formatIdadeAnos(dataNascimentoEfetiva)}
          onClose={() => setPrazoDialog(null)}
        />
      )}
    </div>
  );
}

// ───────────────────────── Stepper ─────────────────────────

function Stepper({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "inicio", label: "Início" },
    { id: "dados", label: "Imóvel & Financiamento" },
    { id: "cenarios", label: "Cenários" },
    { id: "resumo", label: "Resumo" },
    { id: "resultados", label: "Resultados" },
  ];
  const idxAtual = step === "processando" ? 3 : steps.findIndex((s) => s.id === step);
  return (
    <ol className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3 text-xs">
      {steps.map((s, i) => {
        const ativo = i === idxAtual;
        const feito = i < idxAtual;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
              feito ? "bg-success text-white" : ativo ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground"
            }`}>{i + 1}</span>
            <span className={`font-semibold ${ativo ? "text-graphite" : "text-muted-foreground"}`}>{s.label}</span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

// ───────────────────────── UI Primitives ─────────────────────────

function Box({ children }: { children: React.ReactNode }) {
  return <section className="rounded-lg border border-border bg-card p-5">{children}</section>;
}

function NavBtns({ onBack, onNext, podeAvancar = true, nextLabel = "Avançar" }: {
  onBack?: () => void; onNext?: () => void; podeAvancar?: boolean; nextLabel?: string;
}) {
  return (
    <div className="mt-5 flex justify-between gap-2">
      {onBack ? (
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-graphite hover:border-brand/40">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </button>
      ) : <span />}
      {onNext && (
        <button
          onClick={onNext}
          disabled={!podeAvancar}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-foreground shadow-sm hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {nextLabel} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-direction">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function MoedaInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">R$</span>
      <input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
    </div>
  );
}

function PercentInput({ value, onChange, step = 0.5 }: { value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <div className="relative">
      <input type="number" min={0} max={100} step={step} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-10 w-full rounded-md border border-input bg-background pl-3 pr-9 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">%</span>
    </div>
  );
}

function ChipBtn({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
        ativo ? "border-brand bg-brand text-brand-foreground" : "border-border bg-background text-graphite hover:border-brand/40"
      }`}>{children}</button>
  );
}

function ModoCard({ ativo, onClick, icon: Icon, titulo, desc }: {
  ativo: boolean; onClick: () => void; icon: typeof Sparkles; titulo: string; desc: string;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
        ativo ? "border-brand bg-brand/5 shadow-sm" : "border-border bg-background hover:border-brand/40"
      }`}>
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${ativo ? "bg-brand text-brand-foreground" : "bg-secondary text-graphite"}`}>
        <Icon className="h-4 w-4" strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-graphite">{titulo}</p>
        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      </div>
      {ativo && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-brand" />}
    </button>
  );
}

// ───────────────────────── Início ─────────────────────────

function InicioStep(p: {
  imobiliariaId: string; setImobiliariaId: (v: string) => void;
  corretorRespId: string; setCorretorRespId: (v: string) => void;
  corretores: { id: string; nome: string }[];
  tipoSimulacao: TipoSimulacao; setTipoSimulacao: (v: TipoSimulacao) => void;
  clienteId: string; setClienteId: (v: string) => void;
  clientes: Cliente[];
  buscaCliente: string; setBuscaCliente: (v: string) => void;
  novoClienteAberto: boolean; setNovoClienteAberto: (v: boolean) => void;
  novoCliente: { nome: string; cpfCnpj: string; tipo: IdentTipo; email: string; telefone: string; dataNasc: string };
  setNovoCliente: (v: { nome: string; cpfCnpj: string; tipo: IdentTipo; email: string; telefone: string; dataNasc: string }) => void;
  adicionarNovoCliente: () => void;
  identTipo: IdentTipo; setIdentTipo: (v: IdentTipo) => void;
  identNumero: string; setIdentNumero: (v: string) => void;
  dataNascGenerica: string; setDataNascGenerica: (v: string) => void;
  onNext: () => void; podeAvancar: boolean;
}) {
  const clientesFiltrados = p.clientes.filter((c) => {
    if (!p.buscaCliente) return true;
    const q = p.buscaCliente.toLowerCase();
    return c.nome.toLowerCase().includes(q) || (c.cpf ?? "").includes(p.buscaCliente) || (c.cnpj ?? "").includes(p.buscaCliente);
  }).slice(0, 6);

  return (
    <Box>
      {/* Imobiliária + Corretor */}
      <h2 className="mb-3 text-sm font-bold text-graphite">Responsáveis</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Imobiliária" hint="Filtra os corretores disponíveis.">
          <select value={p.imobiliariaId} onChange={(e) => p.setImobiliariaId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15">
            <option value="">Todas as imobiliárias</option>
            {imobiliarias.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
        </Field>
        <Field label="Corretor responsável" required>
          <select value={p.corretorRespId} onChange={(e) => p.setCorretorRespId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15">
            <option value="">Selecione um corretor</option>
            {p.corretores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
      </div>

      {/* Tipo de simulação */}
      <h2 className="mt-6 mb-3 text-sm font-bold text-graphite">Tipo de simulação</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <ModoCard ativo={p.tipoSimulacao === "generica"} onClick={() => p.setTipoSimulacao("generica")}
          icon={Sparkles} titulo="Simulação Genérica"
          desc="Apenas CPF ou CNPJ — siga direto para a simulação sem cadastrar o cliente." />
        <ModoCard ativo={p.tipoSimulacao === "completa"} onClick={() => p.setTipoSimulacao("completa")}
          icon={Users} titulo="Simulação Completa"
          desc="Selecione um cliente cadastrado ou cadastre um novo agora." />
      </div>

      {/* Identificação por CPF/CNPJ */}
      {p.tipoSimulacao === "generica" && (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="Tipo de identificação" required>
            <div className="flex gap-2">
              <ChipBtn ativo={p.identTipo === "cpf"} onClick={() => p.setIdentTipo("cpf")}>CPF</ChipBtn>
              <ChipBtn ativo={p.identTipo === "cnpj"} onClick={() => p.setIdentTipo("cnpj")}>CNPJ</ChipBtn>
            </div>
          </Field>
          <Field label={p.identTipo === "cpf" ? "CPF" : "CNPJ"} required>
            <input value={p.identTipo === "cpf" ? formatCpf(p.identNumero) : formatCnpj(p.identNumero)}
              onChange={(e) => p.setIdentNumero(onlyDigits(e.target.value))}
              placeholder={p.identTipo === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
          </Field>
          {p.identTipo === "cpf" && (
            <Field label="Data de nascimento" hint="Valida prazo máximo permitido por idade.">
              <input type="date" value={p.dataNascGenerica} onChange={(e) => p.setDataNascGenerica(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
            </Field>
          )}
        </div>
      )}

      {/* Busca / cadastro de cliente */}
      {p.tipoSimulacao === "completa" && (
        <div className="mt-5 space-y-3">
          <Field label="Buscar cliente cadastrado" required>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={p.buscaCliente} onChange={(e) => p.setBuscaCliente(e.target.value)}
                placeholder="Buscar por nome, CPF ou CNPJ…"
                className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
            </div>
          </Field>
          <div className="grid gap-2 md:grid-cols-2">
            {clientesFiltrados.map((c) => {
              const ativo = p.clienteId === c.id;
              return (
                <button key={c.id} onClick={() => p.setClienteId(c.id)}
                  className={`flex items-center gap-3 rounded-md border p-3 text-left transition-all ${
                    ativo ? "border-brand bg-brand/5" : "border-border bg-background hover:border-brand/40"
                  }`}>
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ${ativo ? "bg-brand text-brand-foreground" : "bg-secondary text-graphite"}`}>
                    {c.nome.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-graphite">{c.nome}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {c.cpf ? formatCpf(c.cpf) : c.cnpj ? formatCnpj(c.cnpj) : ""}
                    </p>
                  </div>
                  {ativo && <CheckCircle2 className="ml-auto h-4 w-4 text-brand" />}
                </button>
              );
            })}
          </div>

          <button onClick={() => p.setNovoClienteAberto(!p.novoClienteAberto)}
            className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-brand/40 bg-brand/5 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/10">
            <UserPlus className="h-3.5 w-3.5" /> {p.novoClienteAberto ? "Cancelar cadastro" : "Cadastrar novo cliente"}
          </button>

          {p.novoClienteAberto && (
            <div className="rounded-lg border border-brand/20 bg-brand/5 p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand">Novo cliente</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Nome completo" required>
                  <input value={p.novoCliente.nome} onChange={(e) => p.setNovoCliente({ ...p.novoCliente, nome: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand" />
                </Field>
                <Field label="Tipo">
                  <div className="flex gap-2">
                    <ChipBtn ativo={p.novoCliente.tipo === "cpf"} onClick={() => p.setNovoCliente({ ...p.novoCliente, tipo: "cpf" })}>CPF</ChipBtn>
                    <ChipBtn ativo={p.novoCliente.tipo === "cnpj"} onClick={() => p.setNovoCliente({ ...p.novoCliente, tipo: "cnpj" })}>CNPJ</ChipBtn>
                  </div>
                </Field>
                <Field label={p.novoCliente.tipo === "cpf" ? "CPF" : "CNPJ"} required>
                  <input value={p.novoCliente.tipo === "cpf" ? formatCpf(p.novoCliente.cpfCnpj) : formatCnpj(p.novoCliente.cpfCnpj)}
                    onChange={(e) => p.setNovoCliente({ ...p.novoCliente, cpfCnpj: onlyDigits(e.target.value) })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand" />
                </Field>
                {p.novoCliente.tipo === "cpf" && (
                  <Field label="Data de nascimento">
                    <input type="date" value={p.novoCliente.dataNasc} onChange={(e) => p.setNovoCliente({ ...p.novoCliente, dataNasc: e.target.value })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand" />
                  </Field>
                )}
                <Field label="E-mail">
                  <input type="email" value={p.novoCliente.email} onChange={(e) => p.setNovoCliente({ ...p.novoCliente, email: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand" />
                </Field>
                <Field label="Telefone">
                  <input value={p.novoCliente.telefone} onChange={(e) => p.setNovoCliente({ ...p.novoCliente, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand" />
                </Field>
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={p.adicionarNovoCliente}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand/90">
                  <UserPlus className="h-3.5 w-3.5" /> Cadastrar e selecionar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <NavBtns onNext={p.onNext} podeAvancar={p.podeAvancar} />
    </Box>
  );
}

// ───────────────────────── Imóvel & Financiamento ─────────────────────────

function DadosStep(p: {
  modalidade: Modalidade; setModalidade: (m: Modalidade) => void;
  valorImovel: number; setValorImovel: (n: number) => void;
  entradaPercent: number; setEntradaPercent: (n: number) => void;
  entradaManual: boolean; setEntradaManual: (v: boolean) => void;
  valorEntrada: number; setValorEntrada: (n: number) => void;
  custasPercent: number; setCustasPercent: (n: number) => void;
  prazoMeses: number; tentarSetPrazo: (n: number) => void;
  prazoMaximoIdade: number;
  dataNascimentoEfetiva: string;
  rendaBruta: number; setRendaBruta: (n: number) => void;
  comprometimento: number; setComprometimento: (n: number) => void;
  sistema: SistemaAmort; setSistema: (s: SistemaAmort) => void;
  calc: { compraVenda: number; entrada: number; financiado: number; custas: number };
  onBack: () => void; onNext: () => void; podeAvancar: boolean;
}) {
  // Renda mínima estimada (sugestão): parcela média estimada / comprometimento.
  // Estimativa rápida: parcela ≈ financiado × 0.011 (≈ SAC inicial @10%/30a).
  const parcelaEst = p.calc.financiado * 0.011;
  const rendaMinima = parcelaEst / (Math.max(p.comprometimento, 1) / 100);

  return (
    <Box>
      <h2 className="mb-3 text-sm font-bold text-graphite">Modalidade</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <ModoCard ativo={p.modalidade === "com_entrada"} onClick={() => p.setModalidade("com_entrada")}
          icon={Wallet} titulo="Com entrada"
          desc="Entrada padrão 20% (editável). Financia o saldo restante." />
        <ModoCard ativo={p.modalidade === "sem_entrada"} onClick={() => p.setModalidade("sem_entrada")}
          icon={Building2} titulo="Sem entrada"
          desc="C&V inflado (÷0,8) para liberar 100% do imóvel desejado." />
        <ModoCard ativo={p.modalidade === "sem_entrada_custas"} onClick={() => p.setModalidade("sem_entrada_custas")}
          icon={Calculator} titulo="Sem entrada + custas"
          desc="C&V inflado (÷0,75) para liberar imóvel + custas (~5%)." />
      </div>

      <h2 className="mt-6 mb-3 text-sm font-bold text-graphite">Imóvel & Financiamento</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Valor do imóvel" required>
          <MoedaInput value={p.valorImovel} onChange={p.setValorImovel} />
        </Field>

        {p.modalidade === "com_entrada" ? (
          <>
            <Field label="Entrada (%)" hint="Padrão 20%. Edite o % ou o valor diretamente.">
              <PercentInput value={p.entradaPercent} onChange={p.setEntradaPercent} step={1} />
            </Field>
            <Field label="Entrada (R$)">
              <MoedaInput value={p.calc.entrada} onChange={p.setValorEntrada} />
            </Field>
            <Field label="Compra e Venda" hint="Igual ao valor do imóvel nesta modalidade.">
              <div className="flex h-10 items-center rounded-md border border-input bg-secondary px-3 text-sm font-bold text-graphite">{formatBRL(p.calc.compraVenda)}</div>
            </Field>
          </>
        ) : (
          <>
            <Field label="Compra e Venda" hint={p.modalidade === "sem_entrada" ? "Inflado automaticamente (÷ 0,8)" : "Inflado automaticamente (÷ 0,75) incluindo custas"}>
              <div className="flex h-10 items-center rounded-md border border-brand/30 bg-brand/5 px-3 text-sm font-bold text-brand">{formatBRL(p.calc.compraVenda)}</div>
            </Field>
            <Field label="Entrada">
              <div className="flex h-10 items-center rounded-md border border-input bg-secondary px-3 text-sm font-semibold text-muted-foreground">Sem entrada</div>
            </Field>
          </>
        )}

        <Field label="Despesas cartorárias (%)" hint="% sobre o valor do imóvel. Padrão 5%.">
          <PercentInput value={p.custasPercent} onChange={p.setCustasPercent} step={0.5} />
        </Field>
        <Field label="Custas (R$)" hint="Calculadas automaticamente.">
          <div className="flex h-10 items-center rounded-md border border-input bg-secondary px-3 text-sm font-bold text-graphite">{formatBRL(p.calc.custas)}</div>
        </Field>
        <Field label="Valor financiado" hint="Calculado automaticamente conforme modalidade.">
          <div className="flex h-10 items-center rounded-md border border-brand/30 bg-brand/5 px-3 text-sm font-bold text-brand">{formatBRL(p.calc.financiado)}</div>
        </Field>
      </div>

      <h2 className="mt-6 mb-3 text-sm font-bold text-graphite">Prazo & Amortização</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Prazo (meses)"
          required
          hint={
            p.dataNascimentoEfetiva
              ? `Idade: ${formatIdadeAnos(p.dataNascimentoEfetiva)} • Máx. permitido: ${p.prazoMaximoIdade}m`
              : `Sem data de nascimento informada — usando teto SFH (${PRAZO_MAX_ABSOLUTO}m).`
          }
        >
          <input type="number" min={12} max={PRAZO_MAX_ABSOLUTO} step={12}
            value={p.prazoMeses}
            onChange={(e) => p.tentarSetPrazo(Number(e.target.value) || 0)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
        </Field>
        <Field label="Renda bruta mensal">
          <MoedaInput value={p.rendaBruta} onChange={p.setRendaBruta} />
        </Field>
        <Field label="Comprometimento máx. (%)" hint="Padrão 30%.">
          <PercentInput value={p.comprometimento} onChange={p.setComprometimento} step={1} />
        </Field>
        <Field label="Renda mínima estimada" hint="Sugestão calculada com base no comprometimento.">
          <div className="flex h-10 items-center rounded-md border border-input bg-secondary px-3 text-sm font-bold text-graphite">{formatBRL(rendaMinima)}</div>
        </Field>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sistema de amortização</p>
        <div className="flex flex-wrap gap-2">
          {(["SAC", "PRICE", "AMBOS"] as SistemaAmort[]).map((s) => (
            <ChipBtn key={s} ativo={p.sistema === s} onClick={() => p.setSistema(s)}>
              {s === "AMBOS" ? "Ambos (comparativo)" : s}
            </ChipBtn>
          ))}
        </div>
        {p.sistema === "AMBOS" && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Cada banco × prazo será calculado em SAC e PRICE para comparação lado a lado.
          </p>
        )}
      </div>

      <NavBtns onBack={p.onBack} onNext={p.onNext} podeAvancar={p.podeAvancar} />
    </Box>
  );
}

// ───────────────────────── Cenários (bancos × prazos) ─────────────────────────

function CenariosStep(p: {
  bancosSel: string[]; setBancosSel: (a: string[]) => void;
  prazosSel: number[]; setPrazosSel: (a: number[]) => void;
  prazoCustom: string; setPrazoCustom: (s: string) => void;
  sistema: SistemaAmort;
  prazoMaximoIdade: number;
  onPrazoExcedido: (n: number) => void;
  onBack: () => void; onNext: () => void;
}) {
  const toggleBanco = (id: string) => p.setBancosSel(
    p.bancosSel.includes(id) ? p.bancosSel.filter((x) => x !== id) : [...p.bancosSel, id],
  );
  const togglePrazo = (n: number) => {
    if (n > p.prazoMaximoIdade) { p.onPrazoExcedido(n); return; }
    p.setPrazosSel(
      p.prazosSel.includes(n) ? p.prazosSel.filter((x) => x !== n) : [...p.prazosSel, n].sort((a, b) => a - b),
    );
  };
  const addPrazoCustom = () => {
    const n = Number(p.prazoCustom);
    if (n <= 0) return;
    if (n > p.prazoMaximoIdade) { p.onPrazoExcedido(n); return; }
    if (!p.prazosSel.includes(n)) {
      p.setPrazosSel([...p.prazosSel, n].sort((a, b) => a - b));
      p.setPrazoCustom("");
    }
  };

  return (
    <Box>
      <div className="space-y-5">
        <div>
          <h3 className="mb-2 text-sm font-bold text-graphite">Bancos</h3>
          <div className="mb-2 flex gap-2 text-[11px]">
            <button onClick={() => p.setBancosSel(bancos.map((b) => b.id))}
              className="rounded border border-border bg-background px-2 py-1 font-semibold text-graphite hover:border-brand/40">Todos</button>
            <button onClick={() => p.setBancosSel([])}
              className="rounded border border-border bg-background px-2 py-1 font-semibold text-muted-foreground hover:border-brand/40">Limpar</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {bancos.map((b) => (
              <ChipBtn key={b.id} ativo={p.bancosSel.includes(b.id)} onClick={() => toggleBanco(b.id)}>
                {b.sigla} — {b.nome}
              </ChipBtn>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-graphite">
            Prazos (meses) <span className="ml-2 text-[11px] font-normal text-muted-foreground">máx. permitido: {p.prazoMaximoIdade}m</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {PRAZOS_SUGERIDOS.filter((n) => n <= p.prazoMaximoIdade).map((n) => (
              <ChipBtn key={n} ativo={p.prazosSel.includes(n)} onClick={() => togglePrazo(n)}>{n}m</ChipBtn>
            ))}
            {p.prazosSel.filter((n) => !PRAZOS_SUGERIDOS.includes(n)).map((n) => (
              <ChipBtn key={n} ativo onClick={() => togglePrazo(n)}>{n}m ×</ChipBtn>
            ))}
            <div className="flex items-center gap-1">
              <input value={p.prazoCustom} onChange={(e) => p.setPrazoCustom(e.target.value)}
                placeholder="Prazo custom" type="number"
                className="h-8 w-28 rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-brand" />
              <button onClick={addPrazoCustom}
                className="h-8 rounded-md bg-graphite px-3 text-xs font-semibold text-white hover:bg-graphite/90">+</button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold text-graphite">Sistema de amortização escolhido</h3>
          <p className="text-xs text-muted-foreground">
            {p.sistema === "AMBOS" ? "Cada cenário será gerado em SAC e PRICE." : p.sistema}
          </p>
        </div>
      </div>
      <NavBtns onBack={p.onBack} onNext={p.onNext}
        podeAvancar={p.bancosSel.length > 0 && p.prazosSel.length > 0} />
    </Box>
  );
}

// ───────────────────────── Resumo / Processando / Resultados ─────────────────────────

function ResumoStep(p: {
  clienteNome: string; corretorNome: string; imobiliariaNome?: string;
  calc: { compraVenda: number; entrada: number; financiado: number; custas: number };
  prazoMeses: number; sistema: SistemaAmort;
  bancosSel: string[]; prazosSel: number[]; totalCenarios: number;
  onBack: () => void; onProcessar: () => void; podeProcessar: boolean;
}) {
  return (
    <Box>
      <h2 className="mb-3 text-sm font-bold text-graphite">Resumo antes de processar</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <ResumoItem icon={User} k="Cliente" v={p.clienteNome} />
        <ResumoItem icon={Users} k="Corretor" v={p.corretorNome} sub={p.imobiliariaNome} />
        <ResumoItem icon={Calculator} k="Financiado" v={formatBRL(p.calc.financiado)} sub={`C&V: ${formatBRL(p.calc.compraVenda)}`} />
        <ResumoItem icon={Wallet} k="Entrada" v={p.calc.entrada > 0 ? formatBRL(p.calc.entrada) : "Sem entrada"} />
        <ResumoItem icon={Home} k="Custas" v={formatBRL(p.calc.custas)} />
        <ResumoItem icon={Calculator} k="Prazo" v={`${p.prazoMeses}m`} sub={p.sistema} />
        <ResumoItem icon={Building2} k="Bancos" v={`${p.bancosSel.length}`} sub={p.bancosSel.map((id) => bancos.find((b) => b.id === id)?.sigla).join(", ")} />
        <ResumoItem icon={Calculator} k="Prazos" v={`${p.prazosSel.length}`} sub={p.prazosSel.map((n) => `${n}m`).join(", ")} />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-md border border-brand/30 bg-brand/5 p-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Total de cenários a gerar</p>
          <p className="mt-1 text-2xl font-bold text-graphite">{p.totalCenarios}</p>
        </div>
        <BarChart3 className="h-8 w-8 text-brand" />
      </div>
      <NavBtns onBack={p.onBack} onNext={p.onProcessar} podeAvancar={p.podeProcessar} nextLabel="Processar simulação" />
    </Box>
  );
}

function ResumoItem({ icon: Icon, k, v, sub }: { icon: typeof Sparkles; k: string; v: string; sub?: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {k}
      </div>
      <p className="mt-1 text-sm font-bold text-graphite">{v}</p>
      {sub && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ProcessandoStep() {
  return (
    <Box>
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="relative h-16 w-48 overflow-hidden rounded-md border border-border bg-secondary">
          <div className="absolute inset-y-0 left-0 animate-[loading_1.5s_ease-in-out_infinite] bg-gradient-to-r from-brand via-info to-brand" style={{ width: "60%" }} />
          <div className="absolute inset-0 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>
        </div>
        <p className="text-sm font-semibold text-graphite">Aguarde enquanto processamos sua solicitação</p>
        <p className="text-xs text-muted-foreground">Calculando cenários nos bancos selecionados…</p>
      </div>
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(180%); } }`}</style>
    </Box>
  );
}

function ResultadosStep({
  cenarios, favoritos, setFavoritos, selecionados, setSelecionados,
}: {
  cenarios: Cenario[];
  favoritos: Set<string>; setFavoritos: (s: Set<string>) => void;
  selecionados: Set<string>; setSelecionados: (s: Set<string>) => void;
}) {
  const toggleFav = (id: string) => {
    const next = new Set(favoritos);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFavoritos(next);
  };
  const toggleSel = (id: string) => {
    const next = new Set(selecionados);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelecionados(next);
  };

  const melhorParcela = useMemo(
    () => cenarios.reduce((m, c) => (m === null || c.parcelaInicial < m ? c.parcelaInicial : m), null as number | null),
    [cenarios],
  );

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <h2 className="text-sm font-bold text-graphite">{cenarios.length} cenários gerados</h2>
        <div className="ml-auto flex flex-wrap gap-1.5 text-[11px]">
          {selecionados.size > 0 && (
            <span className="rounded bg-brand/10 px-2 py-1 font-bold text-brand">{selecionados.size} selecionado(s)</span>
          )}
          <Acao icon={Download}>Baixar</Acao>
          <Acao icon={Share2}>Compartilhar</Acao>
          <Acao icon={BarChart3}>Comparar</Acao>
          <Acao icon={Send}>Enviar para proposta</Acao>
          <Acao icon={Copy}>Duplicar</Acao>
          <button onClick={() => setSelecionados(new Set())}
            className="rounded border border-border bg-background px-2 py-1 font-semibold uppercase tracking-wider text-muted-foreground hover:text-graphite">Limpar</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-xs">
          <thead>
            <tr className="bg-secondary">
              <th className="px-2 py-2"></th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Banco</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prazo</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tabela</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Taxa a.a.</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Parcela inicial</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Parcela final</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total pago</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Juros</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CET est.</th>
              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Renda mín.</th>
              <th className="px-2 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {cenarios.map((c) => {
              const banco = bancos.find((b) => b.id === c.bancoId);
              const isMelhor = c.parcelaInicial === melhorParcela;
              return (
                <tr key={c.id} className={`border-t border-border ${selecionados.has(c.id) ? "bg-brand/5" : ""}`}>
                  <td className="px-2 py-2">
                    <input type="checkbox" checked={selecionados.has(c.id)} onChange={() => toggleSel(c.id)}
                      className="h-3.5 w-3.5 accent-[color:var(--brand)]" />
                  </td>
                  <td className="px-3 py-2 font-semibold text-graphite">{banco?.sigla}</td>
                  <td className="px-3 py-2 text-graphite">{c.prazoMeses}m</td>
                  <td className="px-3 py-2"><span className="rounded bg-secondary px-1.5 py-0.5 font-bold text-graphite">{c.tabela}</span></td>
                  <td className="px-3 py-2 text-graphite">{formatPercent(c.taxaAaPercent)}</td>
                  <td className="px-3 py-2 text-right font-bold text-graphite">
                    {formatBRL(c.parcelaInicial)} {isMelhor && <span className="ml-1 rounded bg-success/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-success">Menor</span>}
                  </td>
                  <td className="px-3 py-2 text-right text-graphite">{formatBRL(c.parcelaFinal)}</td>
                  <td className="px-3 py-2 text-right text-graphite">{formatBRL(c.totalPago)}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{formatBRL(c.totalJuros)}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{formatPercent(c.cetPercent)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-graphite">{formatBRL(c.rendaMinima)}</td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={() => toggleFav(c.id)} title="Favoritar">
                      <Star className={`h-4 w-4 ${favoritos.has(c.id) ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground hover:text-graphite"}`} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Acao({ icon: Icon, children }: { icon: typeof Sparkles; children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 font-semibold text-graphite hover:border-brand/40">
      <Icon className="h-3 w-3" /> {children}
    </button>
  );
}

// ───────────────────────── Diálogo: prazo excedido por idade ─────────────────────────

function PrazoExcedidoDialog({ tentado, permitido, idadeMostrar, onClose }: {
  tentado: number; permitido: number; idadeMostrar: string; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-graphite">Prazo acima do permitido pela idade</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          O prazo de <strong className="text-graphite">{tentado} meses</strong> excede o limite para esta idade.
          Conforme a regra brasileira de financiamento habitacional (idade do proponente + prazo ≤ 80 anos e 6 meses),
          o prazo máximo permitido para um cliente de <strong className="text-graphite">{idadeMostrar}</strong> é
          de <strong className="text-brand">{permitido} meses</strong>.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Ajustamos automaticamente para o máximo permitido. Você pode reduzir o prazo se desejar.
        </p>
        <div className="mt-5 flex justify-end">
          <button onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand/90">
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
