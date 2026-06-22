import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Users, User, ShieldCheck, Lock, ArrowRight } from "lucide-react";
import brandMark from "@/assets/brand-mark.png";

type Profile = "correspondente" | "corretor" | "cliente";

const profiles: Array<{
  id: Profile;
  title: string;
  icon: typeof Building2;
  route: "/correspondente" | "/corretor" | "/cliente";
}> = [
  { id: "correspondente", title: "Correspondente", icon: Building2, route: "/correspondente" },
  { id: "corretor", title: "Corretor", icon: Users, route: "/corretor" },
  { id: "cliente", title: "Cliente", icon: User, route: "/cliente" },
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
  const current = profiles.find((p) => p.id === selected)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: current.route });
  };

  return (
    <div
      className="relative flex min-h-screen flex-col bg-background"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.045) 1px, transparent 0)",
        backgroundSize: "22px 22px",
      }}
    >
      {/* Slim institutional top rule */}
      <div className="h-1 w-full bg-brand" aria-hidden />

      {/* Brand bar */}
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={brandMark}
              alt="Agilliza"
              width={36}
              height={36}
              className="h-9 w-9 rounded-[6px] object-cover"
            />
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-tight text-graphite">Agilliza</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Plataforma Institucional
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            Ambiente seguro
          </div>
        </div>
      </header>

      {/* Login surface */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-[440px]">
          <div className="overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_0_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(0,15,159,0.18)]">
            {/* Header strip */}
            <div className="border-b border-border bg-card px-8 pt-8 pb-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">
                  Acesso restrito
                </p>
                <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Lock className="h-2.5 w-2.5" />
                  TLS 1.3
                </span>
              </div>
              <h1 className="mt-3 text-[22px] font-bold leading-tight tracking-tight text-graphite">
                Acessar a plataforma
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Autentique-se com suas credenciais corporativas.
              </p>
            </div>

            <div className="px-8 py-7">
              {/* Profile segmented control */}
              <div
                className="flex rounded-md border border-border bg-secondary p-1"
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
                        "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-2 text-[12px] font-semibold transition-colors",
                        active
                          ? "bg-card text-brand shadow-sm"
                          : "text-muted-foreground hover:text-graphite",
                      ].join(" ")}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={active ? 2.5 : 2} />
                      <span>{p.title}</span>
                    </button>
                  );
                })}
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-graphite"
                  >
                    Identificação
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@instituicao.com.br"
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-[11px] font-semibold uppercase tracking-[0.12em] text-graphite"
                    >
                      Credencial
                    </label>
                    <button
                      type="button"
                      className="text-[11px] font-medium text-brand transition-opacity hover:opacity-70"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-[13.5px] tracking-[0.15em] text-foreground outline-none transition-colors placeholder:tracking-normal placeholder:text-muted-foreground/70 focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 text-[11.5px] text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-input accent-[color:var(--brand)]"
                  />
                  Manter sessão neste dispositivo
                </label>

                <button
                  type="submit"
                  className="group mt-2 inline-flex w-full items-center justify-between rounded-md bg-brand px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-foreground transition-colors hover:bg-[#000a7a]"
                >
                  <span>Entrar como {current.title}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            </div>

            {/* Compliance strip */}
            <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-secondary/60">
              {[
                { l: "Autenticação", v: "Forte" },
                { l: "Conformidade", v: "LGPD" },
                { l: "Auditoria", v: "Ativa" },
              ].map((c) => (
                <div key={c.l} className="px-3 py-3 text-center">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {c.l}
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold text-brand">{c.v}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground">
            Acesso monitorado. Todas as ações são registradas em trilha de auditoria.
          </p>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-6 py-4 text-[11px] text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Agilliza · Todos os direitos reservados</span>
          <span className="flex items-center gap-3">
            <a className="hover:text-graphite" href="#">Termos</a>
            <span aria-hidden>·</span>
            <a className="hover:text-graphite" href="#">Privacidade</a>
            <span aria-hidden>·</span>
            <a className="hover:text-graphite" href="#">Suporte</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
