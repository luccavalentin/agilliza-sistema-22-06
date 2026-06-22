import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Users, User, ArrowRight, Eye, EyeOff } from "lucide-react";


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
  const [showPwd, setShowPwd] = useState(false);
  const current = profiles.find((p) => p.id === selected)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: current.route });
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10"
      style={{
        backgroundImage:
          "radial-gradient(60% 60% at 50% 0%, rgba(0,15,159,0.06) 0%, transparent 70%)," +
          "radial-gradient(40% 50% at 50% 100%, rgba(245,51,63,0.04) 0%, transparent 70%)",
      }}
    >
      {/* Fine top accent rule */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #000f9f 35%, #F5333F 50%, #000f9f 65%, transparent 100%)",
        }}
      />

      <section className="w-full max-w-[400px]">
        {/* Brand wordmark — tipográfico */}
        <div className="flex flex-col items-center">
          <p className="text-[26px] font-semibold tracking-[-0.02em] text-graphite">
            agilliza<span className="text-direction">.</span>
          </p>
          <div className="mt-5 h-px w-12 bg-border" aria-hidden />
        </div>


        {/* Form card */}
        <div className="mt-8">
          <h1 className="text-center text-[22px] font-semibold tracking-tight text-graphite">
            Acessar a plataforma
          </h1>

          {/* Profile selector */}
          <div
            className="mt-6 grid grid-cols-3 gap-1.5"
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
                    "flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-[11.5px] font-semibold tracking-tight transition-all",
                    active
                      ? "border-brand bg-brand/[0.04] text-brand shadow-[0_4px_14px_-8px_rgba(0,15,159,0.45)]"
                      : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-graphite",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 1.8} />
                  <span>{p.title}</span>
                </button>
              );
            })}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-graphite"
              >
                E-mail
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
              className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-foreground transition-all hover:bg-[#000a7a] focus:outline-none focus:ring-4 focus:ring-brand/20"
            >
              <span>Entrar como {current.title}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
          © {new Date().getFullYear()} Agilliza
        </p>
      </section>
    </div>
  );
}
