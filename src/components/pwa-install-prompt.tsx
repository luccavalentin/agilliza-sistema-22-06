import { useEffect, useState } from "react";
import { Download, Share, Plus, X, Smartphone } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "agilliza_pwa_dismissed_at";
const DISMISS_DAYS = 7;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

function wasRecentlyDismissed() {
  try {
    const v = localStorage.getItem(DISMISS_KEY);
    if (!v) return false;
    const t = parseInt(v, 10);
    if (Number.isNaN(t)) return false;
    return Date.now() - t < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (wasRecentlyDismissed()) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setShowIOS(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari has no beforeinstallprompt — show guided instructions after a delay.
    if (isIOS()) {
      const t = setTimeout(() => {
        if (!isStandalone() && !wasRecentlyDismissed()) setVisible(true);
      }, 2500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBIP);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
    setShowIOS(false);
  };

  const install = async () => {
    if (deferred) {
      setBusy(true);
      try {
        await deferred.prompt();
        await deferred.userChoice;
      } finally {
        setBusy(false);
        setDeferred(null);
        setVisible(false);
      }
      return;
    }
    if (isIOS()) {
      setShowIOS(true);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div
        role="dialog"
        aria-label="Instalar o aplicativo Agilliza"
        className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-lg border border-border bg-card p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4 sm:left-auto sm:w-[22rem]"
      >
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
            <Smartphone className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight text-graphite">
              Instalar o Agilliza no seu dispositivo
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Acesso rápido com ícone na tela inicial, sem barras do navegador.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={install}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-60"
              >
                <Download className="h-3.5 w-3.5" />
                Instalar app
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-graphite"
              >
                Agora não
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={dismiss}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-graphite"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showIOS && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-graphite/40 px-3 pb-3 sm:items-center sm:pb-0"
          onClick={dismiss}
        >
          <div
            role="dialog"
            aria-label="Como instalar no iPhone"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
                <Smartphone className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold tracking-tight text-graphite">
                  Instalar no iPhone / iPad
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  No Safari, siga os passos abaixo para adicionar o Agilliza à tela
                  inicial.
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={dismiss}
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-graphite"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ol className="mt-4 space-y-3 text-sm text-graphite">
              <li className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-bold text-brand">
                  1
                </span>
                <span className="flex items-center gap-1.5">
                  Toque no ícone
                  <Share className="h-4 w-4 text-brand" />
                  <span>de compartilhar.</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-bold text-brand">
                  2
                </span>
                <span className="flex items-center gap-1.5">
                  Selecione
                  <strong>“Adicionar à Tela de Início”</strong>
                  <Plus className="h-4 w-4 text-brand" />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-bold text-brand">
                  3
                </span>
                <span>
                  Confirme em <strong>“Adicionar”</strong>. O ícone aparecerá na sua
                  tela inicial.
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={dismiss}
              className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
