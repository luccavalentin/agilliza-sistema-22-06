// Conversa com o corretor — visão do Cliente (chat 1:1).

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, ShieldCheck, CheckCheck, Check, Clock } from "lucide-react";
import { PanelHeader } from "@/components/dashboards/primitives";
import { Button } from "@/components/ui/button";
import { clienteById, usuarioById } from "@/lib/operacional/mock-data";

const CLIENTE_ID = "c-1";

type Msg = {
  id: string;
  autor: "cliente" | "corretor";
  texto: string;
  quando: string;
  anexo?: { nome: string; tamanho: string };
  lida?: boolean;
};

const HISTORICO: Msg[] = [
  { id: "m1", autor: "corretor", texto: "Olá, Fernanda! Sou seu corretor responsável. Qualquer dúvida pode me chamar por aqui.", quando: "12/05 09:15", lida: true },
  { id: "m2", autor: "cliente", texto: "Oi, Eduardo! Obrigada. Vou enviar os documentos hoje.", quando: "12/05 10:42", lida: true },
  { id: "m3", autor: "corretor", texto: "Perfeito! Assim que entrarem eu já passo para análise do banco.", quando: "12/05 10:50", lida: true },
  { id: "m4", autor: "cliente", texto: "Segue o comprovante de residência atualizado.", quando: "18/06 14:20", anexo: { nome: "luz-junho.pdf", tamanho: "0,9 MB" }, lida: true },
  { id: "m5", autor: "corretor", texto: "Recebido! Já encaminhei. A previsão de retorno do banco é até 24/06.", quando: "18/06 15:02", lida: true },
  { id: "m6", autor: "corretor", texto: "Atenção: a Declaração de IR foi reprovada — faltou o recibo de entrega. Pode reenviar?", quando: "20/06 11:30", lida: false },
];

export function ClienteMensagens() {
  const cli = clienteById(CLIENTE_ID);
  const corretor = usuarioById("u-cor-1");
  const [msgs, setMsgs] = useState<Msg[]>(HISTORICO);
  const [texto, setTexto] = useState("");
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => { fim.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const enviar = () => {
    if (!texto.trim()) return;
    const now = new Date();
    const quando = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMsgs((p) => [...p, { id: `m-${p.length + 1}`, autor: "cliente", texto: texto.trim(), quando, lida: false }]);
    setTexto("");
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        eyebrow="Acompanhamento · Cliente"
        title="Conversa com o Corretor"
        subtitle={`Você está conversando com ${corretor?.nome ?? "seu corretor"} — responde em até 4h úteis.`}
        right={
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Conversa privada · criptografada
          </span>
        }
      />

      <section className="flex h-[60vh] flex-col rounded-lg border border-border bg-card">
        {/* Cabeçalho */}
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-[12px] font-bold text-brand">
            {corretor?.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-graphite">{corretor?.nome}</p>
            <p className="text-[11px] text-muted-foreground">Corretor responsável · online</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" /> SLA 4h úteis
          </span>
        </header>

        {/* Mensagens */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {msgs.map((m) => {
            const meu = m.autor === "cliente";
            return (
              <div key={m.id} className={`flex ${meu ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-lg px-3 py-2 text-[13px] ${meu ? "bg-brand text-brand-foreground" : "bg-secondary text-graphite"}`}>
                  {!meu && <p className="mb-0.5 text-[10px] font-semibold opacity-80">{corretor?.nome}</p>}
                  <p className="whitespace-pre-wrap leading-relaxed">{m.texto}</p>
                  {m.anexo && (
                    <div className={`mt-2 flex items-center gap-2 rounded-md border px-2 py-1.5 text-[11px] ${meu ? "border-white/30" : "border-border bg-card"}`}>
                      <Paperclip className="h-3 w-3" /> {m.anexo.nome} · {m.anexo.tamanho}
                    </div>
                  )}
                  <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${meu ? "text-white/80" : "text-muted-foreground"}`}>
                    {m.quando}
                    {meu && (m.lida ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={fim} />
        </div>

        {/* Composer */}
        <footer className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <label className="cursor-pointer rounded-md border border-border bg-card p-2 hover:bg-secondary">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
              rows={2}
              placeholder={`Mensagem para ${corretor?.nome ?? "o corretor"}…`}
              className="flex-1 resize-none rounded-md border border-border bg-card px-3 py-2 text-[13px] focus:border-brand focus:outline-none"
            />
            <Button onClick={enviar} disabled={!texto.trim()} className="gap-1">
              <Send className="h-4 w-4" /> Enviar
            </Button>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Enviado como {cli?.nome} · anexos até 10 MB (PDF/JPG/PNG)
          </p>
        </footer>
      </section>
    </div>
  );
}
