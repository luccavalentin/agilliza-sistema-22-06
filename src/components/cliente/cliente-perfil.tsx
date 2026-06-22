// Meus Dados — visão do Cliente.
// Dados cadastrais somente leitura + solicitar correção via mensagem ao corretor.

import { useEffect, useState } from "react";
import { Eye, EyeOff, MessageCircle, ShieldCheck, LogOut, Mail, Phone, MapPin, User, CreditCard } from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { clienteById, usuarioById } from "@/lib/operacional/mock-data";

const CLIENTE_ID = "c-1";
const PREF_KEY = "cliente-preferencias";

type Preferencias = { email: boolean; whatsapp: boolean; push: boolean };

const mascararCPF = (cpf: string) =>
  cpf.length === 11 ? `${cpf.slice(0, 3)}.***.***-${cpf.slice(9)}` : cpf;

const mascararTel = (t: string) =>
  t.length >= 10 ? `(${t.slice(0, 2)}) *****-${t.slice(-4)}` : t;

export function ClientePerfil() {
  const cli = clienteById(CLIENTE_ID);
  const corretor = usuarioById("u-cor-1");
  const [mostrar, setMostrar] = useState(false);
  const [prefs, setPrefs] = useState<Preferencias>({ email: true, whatsapp: true, push: false });
  const [solicitando, setSolicitando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) setPrefs(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* noop */ }
  }, [prefs]);

  const enviarCorrecao = () => {
    if (!mensagem.trim()) return;
    setEnviado(true);
    setTimeout(() => {
      setSolicitando(false);
      setEnviado(false);
      setMensagem("");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Acompanhamento · Cliente"
        title="Meus Dados"
        subtitle="Seus dados cadastrais são mantidos pelo seu corretor. Para alterar, solicite a correção."
        right={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Dados privados
          </span>
        }
      />

      {/* Cabeçalho do cliente */}
      <section className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-5">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-lg font-bold text-brand">
          {cli?.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-graphite">{cli?.nome}</h2>
          <p className="text-[12px] text-muted-foreground">Cliente desde maio de 2023 · Corretor responsável: {corretor?.nome}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setMostrar((v) => !v)}>
            {mostrar ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {mostrar ? "Ocultar" : "Mostrar"} dados sensíveis
          </Button>
          <Button size="sm" className="gap-1" onClick={() => setSolicitando(true)}>
            <MessageCircle className="h-3.5 w-3.5" /> Solicitar correção
          </Button>
        </div>
      </section>

      {/* Grade de campos */}
      <section className="grid gap-3 md:grid-cols-2">
        <Campo icone={User} label="Nome completo" valor={cli?.nome ?? "—"} />
        <Campo icone={CreditCard} label="CPF" valor={mostrar ? (cli?.cpf ?? "—") : mascararCPF(cli?.cpf ?? "")} sensivel />
        <Campo icone={Mail} label="E-mail" valor={cli?.email ?? "—"} />
        <Campo icone={Phone} label="Telefone" valor={mostrar ? (cli?.telefone ?? "—") : mascararTel(cli?.telefone ?? "")} sensivel />
        <Campo icone={MapPin} label="Endereço" valor="Rua das Acácias, 245 — Apto 91 · Vila Mariana — São Paulo/SP · 04101-000" full />
      </section>

      {/* Preferências de notificação */}
      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-graphite">Preferências de notificação</h3>
        <div className="space-y-2">
          {([
            ["email", "E-mail"],
            ["whatsapp", "WhatsApp"],
            ["push", "Notificações no navegador"],
          ] as const).map(([k, label]) => (
            <label key={k} className="flex items-center justify-between rounded-md border border-border bg-card p-3 text-[13px]">
              <span className="text-graphite">{label}</span>
              <input
                type="checkbox"
                checked={prefs[k]}
                onChange={(e) => setPrefs((p) => ({ ...p, [k]: e.target.checked }))}
                className="h-4 w-4 accent-[var(--brand)]"
              />
            </label>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">
          As preferências são salvas neste dispositivo.
        </p>
      </section>

      <section className="flex justify-end">
        <Button variant="outline" className="gap-1 text-rose-700 hover:bg-rose-50">
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </section>

      {/* Modal solicitar correção */}
      <Dialog open={solicitando} onOpenChange={setSolicitando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar correção dos meus dados</DialogTitle>
            <DialogDescription>
              Sua mensagem será enviada para {corretor?.nome}. Nenhum dado é alterado automaticamente.
            </DialogDescription>
          </DialogHeader>
          {enviado ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-700">
              Solicitação enviada — seu corretor analisará em até 4h úteis.
            </p>
          ) : (
            <textarea
              rows={5}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva o que precisa ser corrigido (ex.: telefone, endereço, e-mail)…"
              className="w-full resize-none rounded-md border border-border bg-card p-3 text-[13px] focus:border-brand focus:outline-none"
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSolicitando(false)}>Cancelar</Button>
            <Button onClick={enviarCorrecao} disabled={!mensagem.trim() || enviado}>Enviar solicitação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Campo({
  icone: Icone, label, valor, sensivel, full,
}: {
  icone: typeof User; label: string; valor: string; sensivel?: boolean; full?: boolean;
}) {
  return (
    <div className={`rounded-md border border-border bg-card p-3 ${full ? "md:col-span-2" : ""}`}>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icone className="h-3 w-3" /> {label}
        {sensivel && <span className="rounded-sm bg-secondary px-1 text-[9px] uppercase">privado</span>}
      </p>
      <p className="mt-1 text-sm font-medium text-graphite">{valor}</p>
    </div>
  );
}
