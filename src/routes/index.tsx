import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Users, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import brandMark from "@/assets/brand-mark.png";

type Profile = "correspondente" | "corretor" | "cliente";

const profiles: Array<{
  id: Profile;
  title: string;
  icon: typeof Building2;
  route: "/correspondente" | "/corretor" | "/cliente";
  hint: string;
}> = [
  { id: "correspondente", title: "Correspondente", icon: Building2, route: "/correspondente", hint: "Gestão completa da operação" },
  { id: "corretor", title: "Corretor", icon: Users, route: "/corretor", hint: "Carteira e simulações" },
  { id: "cliente", title: "Cliente", icon: User, route: "/cliente", hint: "Acompanhamento da proposta" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acesso · Agilliza" },
      { name: "description", content: "Acesso institucional à plataforma Agilliza." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Profile>("correspondente");
  const [showPwd, setShowPwd] = useState(false);
  const current = profiles.find((p) => p.id === selected)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: current.route });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* ============================= BRAND PANEL ============================= */}
      <aside
        className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between text-white"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, #1626c4 0%, transparent 55%)," +
            "radial-gradient(100% 80% at 100% 100%, #f5333f22 0%, transparent 60%)," +
            "linear-gradient(135deg, #000a7a 0%, #000f9f 45%, #0a1ac7 100%)",
        }}
      >
        {/* Fine grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)",
          }}
        />

        {/* Concentric arcs — institutional motif */}
        <svg
          aria-hidden
          viewBox="0 0 600 600"
          className="pointer-events-none absolute -right-40 -bottom-40 h-[780px] w-[780px] opacity-[0.22]"
        >
          {[60, 120, 180, 240, 300, 360].map((r) => (
            <circle key={r} cx="300" cy="300" r={r} fill="none" stroke="white" strokeWidth="1" />
          ))}
          <circle cx="300" cy="300" r="380" fill="none" stroke="#F5333F" strokeWidth="1.2" />
        </svg>

        {/* Diagonal accent line */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, #F5333F 30%, #F5333F 70%, transparent 100%)" }}
        />

        {/* Top brand */}
        <div className="relative z-10 flex items-center gap-3 px-12 pt-10">
          <div className="grid h-11 w-11 place-items-center rounded-sm bg-white/95 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]">
            <img src={brandMark} alt="" className="h-7 w-7 object-contain" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold tracking-[0.02em]">AGILLIZA</p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/55">
              Plataforma Institucional
            </p>
          </div>
        </div>

        {/* Middle institutional message */}
        <div className="relative z-10 max-w-[520px] px-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55">
            Crédito Imobiliário · Home Equity
          </p>
          <h2 className="mt-5 text-[44px] font-bold leading-[1.05] tracking-[-0.02em]">
            Precisão operacional<br />
            <span className="text-white/70">para decisões de crédito.</span>
          </h2>
          <p className="mt-6 max-w-[440px] text-[14px] leading-relaxed text-white/65">
            O ecossistema que conecta correspondentes, corretores e clientes
            em uma única esteira — auditável, integrada e em tempo real.
          </p>

          {/* Metric strip */}
          <div className="mt-10 grid max-w-[460px] grid-cols-3 gap-px overflow-hidden rounded-sm bg-white/15">
            {[
              { v: "+R$ 4,2 bi", l: "Originado" },
              { v: "37", l: "Instituições" },
              { v: "99,98%", l: "Disponibilidade" },
            ].map((m) => (
              <div key={m.l} className="bg-[#000a7a]/60 px-4 py-4 backdrop-blur-sm">
                <p className="text-[18px] font-bold tracking-tight text-white">{m.v}</p>
                <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  {m.l}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footer */}
        <div className="relative z-10 flex items-center justify-between px-12 pb-8 text-[10.5px] uppercase tracking-[0.22em] text-white/45">
          <span>© {new Date().getFullYear()} Agilliza</span>
          <span className="flex items-center gap-4">
            <a href="#" className="hover:text-white/80">Termos</a>
            <a href="#" className="hover:text-white/80">Privacidade</a>
          </span>
        </div>
      </aside>

      {/* ============================= FORM PANEL ============================= */}
      <main className="relative flex items-center justify-center px-6 py-12 sm:px-10">
        {/* mobile brand strip */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <img src={brandMark} alt="" className="h-8 w-8 rounded-sm object-contain" />
            <div className="leading-tight">
              <p className="text-[13px] font-bold tracking-tight text-graphite">AGILLIZA</p>
              <p className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">Plataforma Institucional</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Eyebrow */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-brand">
            Acesso restrito
          </p>
          <h1 className="mt-3 text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-graphite">
            Bem-vindo de volta.
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Selecione seu perfil e autentique-se com suas credenciais corporativas.
          </p>

          {/* Profile selector — premium cards */}
          <div
            className="mt-8 grid grid-cols-3 gap-2"
            role="tablist"
            aria-label="Perfil de acesso"
          >
            {profiles.map((p) => {
              const Icon = p.icon;
              const active = p.id === selected;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelected(p.id)}
                  className={[
                    "group relative flex flex-col items-start gap-2 rounded-md border px-3 py-3 text-left transition-all",
                    active
                      ? "border-brand bg-brand/[0.04] shadow-[0_8px_24px_-12px_rgba(0,15,159,0.35)]"
                      : "border-border bg-card hover:border-brand/40 hover:bg-secondary/40",
                  ].join(" ")}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-full w-[2px] rounded-l-md bg-brand"
                    />
                  )}
                  <Icon
                    className={active ? "h-4 w-4 text-brand" : "h-4 w-4 text-muted-foreground"}
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                  <span
                    className={[
                      "text-[12px] font-semibold tracking-tight",
                      active ? "text-graphite" : "text-graphite/80",
                    ].join(" ")}
                  >
                    {p.title}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {current.hint}
          </p>

          {/* Form */}
          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-graphite"
              >
                E-mail corporativo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@instituicao.com.br"
                className="block w-full rounded-md border border-input bg-background px-3.5 py-3 text-[14px] text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-graphite"
                >
                  Senha
                </label>
                <button
                  type="button"
                  className="text-[11.5px] font-semibold text-brand transition-opacity hover:opacity-70"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="block w-full rounded-md border border-input bg-background px-3.5 py-3 pr-11 text-[14px] tracking-[0.12em] text-foreground outline-none transition-all placeholder:tracking-normal placeholder:text-muted-foreground/60 focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-graphite"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-input accent-[color:var(--brand)]"
              />
              Manter sessão neste dispositivo
            </label>

            <button
              type="submit"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-brand px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-foreground transition-all hover:bg-[#000a7a] focus:outline-none focus:ring-4 focus:ring-brand/20"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px] bg-direction"
              />
              <span>Entrar como {current.title}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-muted-foreground">
            Não possui acesso?{" "}
            <a href="#" className="font-semibold text-brand hover:opacity-80">
              Solicite seu cadastro institucional
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
