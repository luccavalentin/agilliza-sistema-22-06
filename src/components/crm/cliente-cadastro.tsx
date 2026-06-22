import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Heart,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Save,
  Search,
  Shield,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import {
  CLIENTES_MOCK,
  DOM_BANCOS,
  DOM_ESTADO_CIVIL,
  DOM_UFS,
  fmtCpfCnpj,
  maskCpfCnpj,
} from "@/data/homefin-clientes";

export type CadastroScope = "correspondente" | "corretor";

const ETAPAS = [
  { n: 1, label: "Identificação",          icon: User },
  { n: 2, label: "Estado civil / Cônjuge", icon: Heart },
  { n: 3, label: "Documento",              icon: IdCard },
  { n: 4, label: "Contato e endereço",     icon: MapPin },
  { n: 5, label: "Renda e banco",          icon: Banknote },
  { n: 6, label: "LGPD e vínculo",         icon: Shield },
] as const;

const CORRETORES_MOCK = [
  { id: 101, nome: "Mariana Pires" },
  { id: 102, nome: "Eduardo Lima" },
  { id: 103, nome: "Camila Souza" },
  { id: 104, nome: "Ricardo Alves" },
  { id: 105, nome: "Patrícia Reis" },
];

interface FormState {
  // 1
  tipoPessoa: "F" | "J";
  tipoSituacao: "A" | "I";
  tipoQualificacao: "CO" | "VD";
  compradorPrincipal: "S" | "N";
  cpfCnpj: string;
  nome: string;
  nomeFantasia: string;
  dataNascimento: string;
  nomeMae: string;
  tipoSexo: "M" | "F" | "O";
  nacionalidade: string;
  profissao: string;
  // 2
  tipoEstadoCivil: "S" | "CA" | "UE" | "DI" | "VI" | "SL";
  tipoRegimeCasamento: "" | "CP" | "CU" | "PA" | "SC" | "SO";
  conjugeCpf: string;
  conjugeNome: string;
  conjugeNascimento: string;
  conjugeEmail: string;
  conjugeCelular: string;
  conjugeRenda: string;
  // 3
  tipoDocumentoIdentidade: "RG" | "CNH";
  numeroDocumento: string;
  dataExpedicao: string;
  orgaoExpedidor: string;
  ufExpedicao: string;
  // 4
  email: string;
  celular: string;
  telefoneFixo: string;
  cep: string;
  logradouro: string;
  numeroLogradouro: string;
  complementoLogradouro: string;
  bairro: string;
  municipio: string;
  uf: string;
  // 5
  tipoRenda: "F" | "I" | "FI";
  rendaBruta: string;
  profissaoFormal: string;
  empresa: string;
  tempoEmprego: string;
  idBanco: string;
  codigoAgencia: string;
  codigoContaCorrente: string;
  digitoContaCorrente: string;
  // 6
  fgAutorizacaoDados: boolean;
  idUsuarioParceiro: string;
  observacoes: string;
}

const INITIAL: FormState = {
  tipoPessoa: "F", tipoSituacao: "A", tipoQualificacao: "CO", compradorPrincipal: "S",
  cpfCnpj: "", nome: "", nomeFantasia: "", dataNascimento: "", nomeMae: "",
  tipoSexo: "M", nacionalidade: "Brasileira", profissao: "",
  tipoEstadoCivil: "S", tipoRegimeCasamento: "",
  conjugeCpf: "", conjugeNome: "", conjugeNascimento: "", conjugeEmail: "", conjugeCelular: "", conjugeRenda: "",
  tipoDocumentoIdentidade: "RG", numeroDocumento: "", dataExpedicao: "", orgaoExpedidor: "", ufExpedicao: "SP",
  email: "", celular: "", telefoneFixo: "",
  cep: "", logradouro: "", numeroLogradouro: "", complementoLogradouro: "",
  bairro: "", municipio: "", uf: "SP",
  tipoRenda: "F", rendaBruta: "", profissaoFormal: "", empresa: "", tempoEmprego: "",
  idBanco: "", codigoAgencia: "", codigoContaCorrente: "", digitoContaCorrente: "",
  fgAutorizacaoDados: false, idUsuarioParceiro: "", observacoes: "",
};

export function ClienteCadastro({ scope }: { scope: CadastroScope }) {
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL,
    idUsuarioParceiro: scope === "corretor" ? "101" : "",
  }));
  const [salvo, setSalvo] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isPF = form.tipoPessoa === "F";
  const isCasado = form.tipoEstadoCivil === "CA" || form.tipoEstadoCivil === "UE";

  // Busca de cliente existente (anti-duplicidade)
  const sugestoes = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (q.length < 2) return [];
    return CLIENTES_MOCK.filter((c) =>
      `${c.nomeParticipante} ${c.cpfCnpj} ${c.email} ${c.celular}`.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [busca]);

  const cpfDigits = form.cpfCnpj.replace(/\D/g, "");
  const cpfFmt = cpfDigits.length >= 11 ? fmtCpfCnpj(cpfDigits) : cpfDigits;
  const cpfDuplicado = useMemo(
    () => cpfDigits.length === 11 && CLIENTES_MOCK.some((c) => c.cpfCnpj.replace(/\D/g, "") === cpfDigits),
    [cpfDigits],
  );

  function salvarRascunho() {
    setSalvo(new Date().toLocaleTimeString("pt-BR"));
  }

  function cadastrar() {
    if (!form.fgAutorizacaoDados) {
      alert("Autorização LGPD é obrigatória para cadastrar o cliente.");
      setEtapa(6);
      return;
    }
    alert(`Cliente cadastrado com sucesso.\nidCliente: ${crypto.randomUUID()}`);
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-5">
      {/* Header */}
      <header className="border-b border-border pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-direction" />
              {scope === "correspondente" ? "Correspondente · CRM" : "Corretor · CRM"}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-graphite">
              Cadastro de Cliente
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {salvo && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-[color-mix(in_oklab,var(--success)_12%,white)] px-2 py-1 font-semibold text-[var(--success)]">
                <Check className="h-3 w-3" /> Rascunho salvo às {salvo}
              </span>
            )}
          </div>
        </div>

        {/* Busca cliente existente */}
        <div className="mt-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente existente por CPF/CNPJ, nome, e-mail ou celular (evita duplicidade)…"
              className="w-full rounded-sm border border-border bg-card py-2 pl-8 pr-3 text-[12px] text-graphite outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          {sugestoes.length > 0 && (
            <ul className="mt-1 divide-y divide-border rounded-sm border border-border bg-card">
              {sugestoes.map((c) => (
                <li key={c.idParticipante} className="flex items-center gap-3 p-2 hover:bg-secondary/40">
                  <UserCheck className="h-4 w-4 text-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-graphite">{c.nomeParticipante}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {maskCpfCnpj(c.cpfCnpj)} · {c.email}
                    </p>
                  </div>
                  <button className="text-[11px] font-semibold text-brand hover:underline">
                    Abrir ficha →
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {/* Stepper */}
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {ETAPAS.map((e) => {
          const ativa = e.n === etapa;
          const concluida = e.n < etapa;
          return (
            <li key={e.n}>
              <button
                onClick={() => setEtapa(e.n)}
                className={`flex w-full items-center gap-2 rounded-sm border px-2.5 py-2 text-left text-[11px] font-semibold transition ${
                  ativa
                    ? "border-brand bg-brand text-brand-foreground"
                    : concluida
                    ? "border-[var(--success)]/40 bg-[color-mix(in_oklab,var(--success)_8%,white)] text-[var(--success)]"
                    : "border-border bg-card text-graphite hover:border-brand/40"
                }`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-sm text-[10px] ${
                  ativa ? "bg-white/15" : concluida ? "bg-white/40" : "bg-secondary"
                }`}>
                  {concluida ? <Check className="h-3 w-3" /> : e.n}
                </span>
                <span className="truncate">{e.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Form */}
      <div className="rounded-md border border-border bg-card p-4">
        {etapa === 1 && (
          <Etapa titulo="Identificação" icone={User}>
            <Row>
              <Radio label="Tipo de pessoa" value={form.tipoPessoa} onChange={(v) => set("tipoPessoa", v as "F" | "J")}
                options={[{ v: "F", l: "Física" }, { v: "J", l: "Jurídica" }]} />
              <Radio label="Situação" value={form.tipoSituacao} onChange={(v) => set("tipoSituacao", v as "A" | "I")}
                options={[{ v: "A", l: "Ativo" }, { v: "I", l: "Inativo" }]} />
              <Radio label="Qualificação" value={form.tipoQualificacao} onChange={(v) => set("tipoQualificacao", v as "CO" | "VD")}
                options={[{ v: "CO", l: "Comprador" }, { v: "VD", l: "Vendedor" }]} />
              <Radio label="Comprador principal" value={form.compradorPrincipal} onChange={(v) => set("compradorPrincipal", v as "S" | "N")}
                options={[{ v: "S", l: "Sim" }, { v: "N", l: "Não" }]} />
            </Row>
            <Row>
              <Field label={isPF ? "CPF" : "CNPJ"} required>
                <input
                  value={cpfFmt}
                  onChange={(e) => set("cpfCnpj", e.target.value.replace(/\D/g, "").slice(0, 14))}
                  placeholder={isPF ? "000.000.000-00" : "00.000.000/0000-00"}
                  className={inputCls}
                />
                {cpfDuplicado && (
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-direction">
                    <AlertTriangle className="h-3 w-3" /> CPF já cadastrado — abra a ficha existente.
                  </p>
                )}
              </Field>
              <Field label={isPF ? "Nome completo" : "Razão social"} required colSpan={2}>
                <input value={form.nome} onChange={(e) => set("nome", e.target.value)} className={inputCls} />
              </Field>
              {!isPF && (
                <Field label="Nome fantasia">
                  <input value={form.nomeFantasia} onChange={(e) => set("nomeFantasia", e.target.value)} className={inputCls} />
                </Field>
              )}
            </Row>
            <Row>
              <Field label={isPF ? "Data de nascimento" : "Data de fundação"} required>
                <input type="date" value={form.dataNascimento} onChange={(e) => set("dataNascimento", e.target.value)} className={inputCls} />
              </Field>
              {isPF && (
                <>
                  <Field label="Nome da mãe">
                    <input value={form.nomeMae} onChange={(e) => set("nomeMae", e.target.value)} className={inputCls} />
                  </Field>
                  <Select label="Sexo" value={form.tipoSexo} onChange={(v) => set("tipoSexo", v as "M" | "F" | "O")}
                    options={[{ v: "M", l: "Masculino" }, { v: "F", l: "Feminino" }, { v: "O", l: "Outro" }]} />
                </>
              )}
              <Field label="Nacionalidade">
                <input value={form.nacionalidade} onChange={(e) => set("nacionalidade", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Profissão">
                <input value={form.profissao} onChange={(e) => set("profissao", e.target.value)} className={inputCls} />
              </Field>
            </Row>
          </Etapa>
        )}

        {etapa === 2 && (
          <Etapa titulo="Estado civil / Cônjuge" icone={Heart}>
            {!isPF ? (
              <p className="rounded-sm border border-border bg-secondary/40 p-3 text-[12px] text-muted-foreground">
                Etapa aplicável apenas a pessoa física. Avance para a próxima.
              </p>
            ) : (
              <>
                <Row>
                  <Select label="Estado civil" value={form.tipoEstadoCivil} onChange={(v) => set("tipoEstadoCivil", v as FormState["tipoEstadoCivil"])}
                    options={Object.entries(DOM_ESTADO_CIVIL).map(([v, l]) => ({ v, l }))} />
                  {isCasado && (
                    <Select label="Regime de casamento" value={form.tipoRegimeCasamento}
                      onChange={(v) => set("tipoRegimeCasamento", v as FormState["tipoRegimeCasamento"])}
                      options={[
                        { v: "", l: "Selecione…" },
                        { v: "CP", l: "Comunhão Parcial" },
                        { v: "CU", l: "Comunhão Universal" },
                        { v: "PA", l: "Participação Final nos Aquestos" },
                        { v: "SC", l: "Separação Convencional" },
                        { v: "SO", l: "Separação Obrigatória" },
                      ]} />
                  )}
                </Row>
                {isCasado && (
                  <div className="rounded-sm border border-border bg-secondary/30 p-3">
                    <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-graphite">
                      <Users className="h-3 w-3" /> Dados do cônjuge
                    </p>
                    <Row>
                      <Field label="CPF do cônjuge">
                        <input value={form.conjugeCpf} onChange={(e) => set("conjugeCpf", e.target.value.replace(/\D/g, "").slice(0, 11))} className={inputCls} />
                      </Field>
                      <Field label="Nome do cônjuge" colSpan={2}>
                        <input value={form.conjugeNome} onChange={(e) => set("conjugeNome", e.target.value)} className={inputCls} />
                      </Field>
                      <Field label="Nascimento">
                        <input type="date" value={form.conjugeNascimento} onChange={(e) => set("conjugeNascimento", e.target.value)} className={inputCls} />
                      </Field>
                      <Field label="E-mail">
                        <input type="email" value={form.conjugeEmail} onChange={(e) => set("conjugeEmail", e.target.value)} className={inputCls} />
                      </Field>
                      <Field label="Celular">
                        <input value={form.conjugeCelular} onChange={(e) => set("conjugeCelular", e.target.value.replace(/\D/g, "").slice(0, 11))} className={inputCls} />
                      </Field>
                      <Field label="Renda (R$)">
                        <input value={form.conjugeRenda} onChange={(e) => set("conjugeRenda", e.target.value)} className={inputCls} />
                      </Field>
                    </Row>
                  </div>
                )}
              </>
            )}
          </Etapa>
        )}

        {etapa === 3 && (
          <Etapa titulo="Documento de identidade" icone={IdCard}>
            <Row>
              <Select label="Tipo" value={form.tipoDocumentoIdentidade}
                onChange={(v) => set("tipoDocumentoIdentidade", v as "RG" | "CNH")}
                options={[{ v: "RG", l: "RG" }, { v: "CNH", l: "CNH" }]} />
              <Field label="Número do documento" required>
                <input value={form.numeroDocumento} onChange={(e) => set("numeroDocumento", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Data de expedição">
                <input type="date" value={form.dataExpedicao} onChange={(e) => set("dataExpedicao", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Órgão expedidor">
                <input value={form.orgaoExpedidor} onChange={(e) => set("orgaoExpedidor", e.target.value)} className={inputCls} />
              </Field>
              <Select label="UF de expedição" value={form.ufExpedicao} onChange={(v) => set("ufExpedicao", v)}
                options={DOM_UFS.map((u) => ({ v: u, l: u }))} />
            </Row>
          </Etapa>
        )}

        {etapa === 4 && (
          <Etapa titulo="Contato e endereço" icone={MapPin}>
            <Row>
              <Field label="E-mail" required colSpan={2}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={`${inputCls} pl-8`} />
                </div>
              </Field>
              <Field label="Celular" required>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input value={form.celular} onChange={(e) => set("celular", e.target.value.replace(/\D/g, "").slice(0, 11))} className={`${inputCls} pl-8`} />
                </div>
              </Field>
              <Field label="Telefone fixo">
                <input value={form.telefoneFixo} onChange={(e) => set("telefoneFixo", e.target.value.replace(/\D/g, "").slice(0, 10))} className={inputCls} />
              </Field>
            </Row>
            <Row>
              <Field label="CEP" required>
                <input value={form.cep} onChange={(e) => set("cep", e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="00000-000" className={inputCls} />
                <p className="mt-1 text-[10px] text-muted-foreground">Busca automática via ViaCEP.</p>
              </Field>
              <Field label="Logradouro" colSpan={2}>
                <input value={form.logradouro} onChange={(e) => set("logradouro", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Número">
                <input value={form.numeroLogradouro} onChange={(e) => set("numeroLogradouro", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Complemento">
                <input value={form.complementoLogradouro} onChange={(e) => set("complementoLogradouro", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Bairro">
                <input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Município">
                <input value={form.municipio} onChange={(e) => set("municipio", e.target.value)} className={inputCls} />
              </Field>
              <Select label="UF" value={form.uf} onChange={(v) => set("uf", v)} options={DOM_UFS.map((u) => ({ v: u, l: u }))} />
            </Row>
          </Etapa>
        )}

        {etapa === 5 && (
          <Etapa titulo="Renda e dados bancários" icone={CreditCard}>
            <Row>
              <Select label="Tipo de renda" value={form.tipoRenda} onChange={(v) => set("tipoRenda", v as "F" | "I" | "FI")}
                options={[{ v: "F", l: "Formal (CLT)" }, { v: "I", l: "Informal" }, { v: "FI", l: "Formal + Informal" }]} />
              <Field label="Renda bruta (R$)" required>
                <input value={form.rendaBruta} onChange={(e) => set("rendaBruta", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Profissão formal">
                <input value={form.profissaoFormal} onChange={(e) => set("profissaoFormal", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Empresa">
                <input value={form.empresa} onChange={(e) => set("empresa", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Tempo de emprego (meses)">
                <input value={form.tempoEmprego} onChange={(e) => set("tempoEmprego", e.target.value.replace(/\D/g, ""))} className={inputCls} />
              </Field>
            </Row>
            <Row>
              <Select label="Banco" value={form.idBanco} onChange={(v) => set("idBanco", v)}
                options={[{ v: "", l: "Selecione…" }, ...DOM_BANCOS.map((b) => ({ v: String(b.idBanco), l: `${b.codigoBanco} · ${b.nome}` }))]} />
              <Field label="Agência">
                <input value={form.codigoAgencia} onChange={(e) => set("codigoAgencia", e.target.value.replace(/\D/g, ""))} className={inputCls} />
              </Field>
              <Field label="Conta corrente">
                <input value={form.codigoContaCorrente} onChange={(e) => set("codigoContaCorrente", e.target.value.replace(/\D/g, ""))} className={inputCls} />
              </Field>
              <Field label="Dígito">
                <input value={form.digitoContaCorrente} onChange={(e) => set("digitoContaCorrente", e.target.value.replace(/\D/g, "").slice(0, 2))} className={inputCls} />
              </Field>
            </Row>
          </Etapa>
        )}

        {etapa === 6 && (
          <Etapa titulo="LGPD e vínculo" icone={Shield}>
            <div className="rounded-sm border border-[var(--warning)]/40 bg-[color-mix(in_oklab,var(--warning)_8%,white)] p-3">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={form.fgAutorizacaoDados}
                  onChange={(e) => set("fgAutorizacaoDados", e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
                />
                <span className="text-[12px] leading-snug text-graphite">
                  <strong>Autorização LGPD (obrigatória).</strong> O cliente autoriza o tratamento dos dados pessoais
                  para fins de simulação, análise de crédito, formalização de propostas e comunicação institucional,
                  conforme a Lei nº 13.709/2018. Esta autorização fica registrada com data, hora e IP do operador.
                </span>
              </label>
            </div>

            <Row>
              <Select
                label="Corretor responsável (idUsuarioParceiro)"
                value={form.idUsuarioParceiro}
                onChange={(v) => set("idUsuarioParceiro", v)}
                disabled={scope === "corretor"}
                options={[{ v: "", l: "Selecione…" }, ...CORRETORES_MOCK.map((c) => ({ v: String(c.id), l: c.nome }))]}
              />
              {scope === "corretor" && (
                <p className="text-[11px] text-muted-foreground">
                  Você é o corretor responsável — vínculo preenchido automaticamente e bloqueado.
                </p>
              )}
            </Row>

            <Field label="Observações">
              <textarea
                value={form.observacoes}
                onChange={(e) => set("observacoes", e.target.value.slice(0, 1000))}
                rows={4}
                className={`${inputCls} resize-y`}
                placeholder="Histórico, contexto comercial, particularidades do cliente…"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">{form.observacoes.length}/1000</p>
            </Field>

            <div className="rounded-sm border border-border bg-secondary/40 p-3 text-[11px] text-graphite">
              <p className="mb-1 inline-flex items-center gap-1.5 font-semibold">
                <FileText className="h-3 w-3" /> Pós-cadastro
              </p>
              <ul className="list-inside list-disc text-muted-foreground">
                <li>Gera <code className="rounded bg-card px-1">idCliente</code> e registra entrada no histórico (autor, IP, timestamp).</li>
                <li>Correspondente passa a ver o cliente no funil; corretor na própria carteira.</li>
                <li>Cliente recebe convite de acesso ao Portal do Cliente por e-mail.</li>
              </ul>
            </div>
          </Etapa>
        )}

        {/* Footer ações */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <button
            onClick={() => setEtapa((n) => Math.max(1, n - 1))}
            disabled={etapa === 1}
            className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-graphite hover:border-brand/40 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={salvarRascunho}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-graphite hover:border-brand/40"
            >
              <Save className="h-3.5 w-3.5" /> Salvar rascunho
            </button>
            {etapa < 6 ? (
              <button
                onClick={() => setEtapa((n) => Math.min(6, n + 1))}
                className="inline-flex items-center gap-1 rounded-sm bg-brand px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-foreground hover:opacity-95"
              >
                Avançar <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={cadastrar}
                className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--success)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white hover:opacity-95"
              >
                <Check className="h-3.5 w-3.5" /> Cadastrar cliente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ helpers de UI ============================ */

const inputCls =
  "w-full rounded-sm border border-border bg-card px-2.5 py-1.5 text-[12px] text-graphite outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20";

function Etapa({
  titulo,
  icone: Icon,
  children,
}: {
  titulo: string;
  icone: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Icon className="h-4 w-4 text-brand" />
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-graphite">{titulo}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

function Field({
  label,
  required,
  colSpan = 1,
  children,
}: {
  label: string;
  required?: boolean;
  colSpan?: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  const span = colSpan === 2 ? "lg:col-span-2" : colSpan === 3 ? "lg:col-span-3" : "";
  return (
    <label className={`flex flex-col gap-1 ${span}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-direction">*</span>}
      </span>
      {children}
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} disabled:bg-secondary/60 disabled:text-muted-foreground`}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </label>
  );
}

function Radio({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={`rounded-sm border px-2.5 py-1.5 text-[11px] font-semibold transition ${
              value === o.v
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-card text-graphite hover:border-brand/40"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ícones reservados para tree-shake
export const _icons = { Building2, X };
