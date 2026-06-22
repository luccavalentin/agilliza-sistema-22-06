import { useState } from "react";
import {
  Settings, User, Bell, Shield, Palette, Globe, Database,
  Mail, Phone, Building2, Lock, Eye, EyeOff, Save, Check,
} from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";

type TabKey = "perfil" | "notificacoes" | "seguranca" | "aparencia" | "integracoes" | "organizacao";

const tabs: { key: TabKey; label: string; icon: typeof Settings }[] = [
  { key: "perfil", label: "Perfil", icon: User },
  { key: "organizacao", label: "Organização", icon: Building2 },
  { key: "notificacoes", label: "Notificações", icon: Bell },
  { key: "seguranca", label: "Segurança", icon: Shield },
  { key: "aparencia", label: "Aparência", icon: Palette },
  { key: "integracoes", label: "Integrações", icon: Globe },
];

export function ConfiguracoesView({ escopo }: { escopo: "correspondente" | "corretor" }) {
  const [tab, setTab] = useState<TabKey>("perfil");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PanelHeader
        eyebrow={escopo === "correspondente" ? "Correspondente · Configurações" : "Corretor · Configurações"}
        title="Configurações da Conta"
        subtitle="Gerencie perfil, notificações, segurança e preferências da plataforma."
      />

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav className="space-y-1 rounded-xl border border-border bg-white p-2 shadow-sm">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors",
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-graphite/80 hover:bg-secondary",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
          {tab === "perfil" && <PerfilForm />}
          {tab === "organizacao" && <OrganizacaoForm escopo={escopo} />}
          {tab === "notificacoes" && <NotificacoesForm />}
          {tab === "seguranca" && <SegurancaForm />}
          {tab === "aparencia" && <AparenciaForm />}
          {tab === "integracoes" && <IntegracoesView />}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-5">
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                Alterações salvas
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand/90"
            >
              <Save className="h-4 w-4" />
              Salvar alterações
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-graphite/70">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function input(extra = "") {
  return `w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-graphite shadow-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand focus:ring-2 focus:ring-brand/20 ${extra}`;
}

function PerfilForm() {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-graphite">Dados Pessoais</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo">
          <input className={input()} defaultValue="João Silva" />
        </Field>
        <Field label="CPF">
          <input className={input()} defaultValue="000.000.000-00" />
        </Field>
        <Field label="E-mail">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className={input("pl-9")} defaultValue="joao@agilliza.com" />
          </div>
        </Field>
        <Field label="Telefone">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className={input("pl-9")} defaultValue="(11) 99999-0000" />
          </div>
        </Field>
        <Field label="Cargo">
          <input className={input()} defaultValue="Gerente Comercial" />
        </Field>
        <Field label="Departamento">
          <input className={input()} defaultValue="Operações" />
        </Field>
      </div>
    </div>
  );
}

function OrganizacaoForm({ escopo }: { escopo: string }) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-graphite">
        Dados da {escopo === "correspondente" ? "Empresa" : "Imobiliária"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Razão Social">
          <input className={input()} defaultValue="Agilliza Crédito Imobiliário LTDA" />
        </Field>
        <Field label="CNPJ">
          <input className={input()} defaultValue="00.000.000/0001-00" />
        </Field>
        <Field label="CEP">
          <input className={input()} defaultValue="01310-100" />
        </Field>
        <Field label="Cidade / UF">
          <input className={input()} defaultValue="São Paulo / SP" />
        </Field>
        <Field label="Endereço" hint="Rua, número e complemento">
          <input className={input()} defaultValue="Av. Paulista, 1000 - Conj. 501" />
        </Field>
        <Field label="Inscrição Estadual">
          <input className={input()} defaultValue="Isento" />
        </Field>
      </div>
    </div>
  );
}

function NotificacoesForm() {
  const items = [
    { k: "email_propostas", l: "Novas propostas", d: "Receba e-mail quando uma proposta for criada", on: true },
    { k: "email_demandas", l: "Demandas vencendo", d: "Aviso 24h antes do SLA expirar", on: true },
    { k: "email_comissoes", l: "Comissões pagas", d: "Confirmação cada vez que uma comissão é liquidada", on: false },
    { k: "push_msg", l: "Mensagens do cliente", d: "Notificação push para novas mensagens", on: true },
    { k: "push_simulacao", l: "Simulações concluídas", d: "Avise quando uma simulação ficar pronta", on: false },
  ];
  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-graphite">Preferências de Notificação</h2>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {items.map((it) => (
          <li key={it.k} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-graphite">{it.l}</p>
              <p className="text-xs text-muted-foreground">{it.d}</p>
            </div>
            <Toggle defaultOn={it.on} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-brand" : "bg-border",
      ].join(" ")}
      aria-pressed={on}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          on ? "translate-x-5" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

function SegurancaForm() {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-graphite">Senha e Acesso</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Senha atual">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type={show ? "text" : "password"} className={input("pl-9 pr-9")} defaultValue="" placeholder="••••••••" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <div />
        <Field label="Nova senha" hint="Mínimo 8 caracteres, com número e símbolo">
          <input type="password" className={input()} placeholder="••••••••" />
        </Field>
        <Field label="Confirmar nova senha">
          <input type="password" className={input()} placeholder="••••••••" />
        </Field>
      </div>

      <div className="rounded-lg border border-border bg-secondary/50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 text-brand" />
          <div className="flex-1">
            <p className="text-sm font-bold text-graphite">Autenticação de 2 fatores</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Proteja sua conta com um código adicional via app autenticador.
            </p>
          </div>
          <Toggle defaultOn={false} />
        </div>
      </div>
    </div>
  );
}

function AparenciaForm() {
  const [theme, setTheme] = useState("auto");
  const [density, setDensity] = useState("confortavel");
  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-graphite">Aparência</h2>
      <Field label="Tema">
        <div className="grid grid-cols-3 gap-3">
          {[
            { k: "claro", l: "Claro" },
            { k: "escuro", l: "Escuro" },
            { k: "auto", l: "Automático" },
          ].map((opt) => (
            <button
              key={opt.k}
              type="button"
              onClick={() => setTheme(opt.k)}
              className={[
                "rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-colors",
                theme === opt.k ? "border-brand bg-brand/5 text-brand" : "border-border bg-white text-graphite/70 hover:border-brand/40",
              ].join(" ")}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Densidade da interface">
        <div className="grid grid-cols-2 gap-3">
          {[
            { k: "compacta", l: "Compacta" },
            { k: "confortavel", l: "Confortável" },
          ].map((opt) => (
            <button
              key={opt.k}
              type="button"
              onClick={() => setDensity(opt.k)}
              className={[
                "rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-colors",
                density === opt.k ? "border-brand bg-brand/5 text-brand" : "border-border bg-white text-graphite/70 hover:border-brand/40",
              ].join(" ")}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function IntegracoesView() {
  const items = [
    { name: "Receita Federal", desc: "Consulta CPF/CNPJ e Score", status: "conectado" as const, icon: Shield },
    { name: "Caixa Econômica Federal", desc: "Envio de propostas habitacionais", status: "conectado" as const, icon: Building2 },
    { name: "Banco do Brasil", desc: "Integração de propostas e simulações", status: "pendente" as const, icon: Building2 },
    { name: "WhatsApp Business", desc: "Mensagens com clientes", status: "conectado" as const, icon: Phone },
    { name: "Gmail / Outlook", desc: "Envio de e-mails transacionais", status: "desconectado" as const, icon: Mail },
    { name: "Google Drive", desc: "Backup de documentos", status: "desconectado" as const, icon: Database },
  ];
  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-graphite">Integrações</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.name} className="flex items-start gap-3 rounded-lg border border-border bg-white p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-graphite">{it.name}</p>
                <p className="text-xs text-muted-foreground">{it.desc}</p>
                <span
                  className={[
                    "mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    it.status === "conectado" && "bg-emerald-100 text-emerald-700",
                    it.status === "pendente" && "bg-amber-100 text-amber-700",
                    it.status === "desconectado" && "bg-gray-100 text-gray-600",
                  ].filter(Boolean).join(" ")}
                >
                  {it.status}
                </span>
              </div>
              <button className="text-xs font-semibold text-brand hover:underline">
                {it.status === "conectado" ? "Gerenciar" : "Conectar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
