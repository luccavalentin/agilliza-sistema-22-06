/**
 * error-handler.ts — Tratamento centralizado de erros com mensagens amigáveis.
 *
 * Uso:
 *   try { ... } catch (e) { handleError(e, "Não foi possível salvar o cadastro."); }
 *
 *   await withErrorToast(
 *     () => downloadBrandedPdf({...}),
 *     { loading: "Gerando PDF...", success: "PDF baixado", error: "Falha ao gerar PDF" }
 *   );
 */
import { toast } from "sonner";

export type FriendlyOptions = {
  /** Mensagem amigável exibida ao usuário (toast). */
  message?: string;
  /** Contexto técnico para o console (módulo, ação). */
  context?: string;
  /** Se false, não exibe toast (apenas loga). */
  silent?: boolean;
};

/** Extrai uma mensagem legível de qualquer valor de erro. */
export function toErrorMessage(err: unknown): string {
  if (!err) return "Erro desconhecido.";
  if (err instanceof Error) return err.message || err.name;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/** Loga no console e exibe toast com mensagem amigável (sem expor stack ao usuário). */
export function handleError(err: unknown, opts: FriendlyOptions | string = {}): void {
  const o = typeof opts === "string" ? { message: opts } : opts;
  const friendly =
    o.message ?? "Algo deu errado. Tente novamente em instantes.";
  const tech = toErrorMessage(err);
  // eslint-disable-next-line no-console
  console.error(`[${o.context ?? "app"}] ${friendly} → ${tech}`, err);
  if (!o.silent) {
    try {
      toast.error(friendly, { description: tech.length > 140 ? undefined : tech });
    } catch {
      /* sonner não montado: degradação silenciosa */
    }
  }
}

/** Envolve uma operação async com feedback visual (loading/success/error). */
export async function withErrorToast<T>(
  fn: () => Promise<T>,
  msgs: { loading?: string; success?: string; error: string; context?: string }
): Promise<T | undefined> {
  let toastId: string | number | undefined;
  try {
    if (msgs.loading) {
      try { toastId = toast.loading(msgs.loading); } catch { /* ignore */ }
    }
    const result = await fn();
    if (toastId !== undefined) {
      try { toast.success(msgs.success ?? "Concluído", { id: toastId }); } catch { /* */ }
    } else if (msgs.success) {
      try { toast.success(msgs.success); } catch { /* */ }
    }
    return result;
  } catch (err) {
    if (toastId !== undefined) {
      try { toast.error(msgs.error, { id: toastId, description: toErrorMessage(err) }); } catch { /* */ }
    } else {
      handleError(err, { message: msgs.error, context: msgs.context });
    }
    return undefined;
  }
}

/** Validações comuns para formulários. */
export const validators = {
  required: (v: unknown, label = "Campo") =>
    v === undefined || v === null || (typeof v === "string" && v.trim() === "")
      ? `${label} é obrigatório.`
      : null,
  email: (v: string) =>
    !v ? null : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "E-mail inválido.",
  minLength: (v: string, n: number, label = "Campo") =>
    !v || v.length >= n ? null : `${label} deve ter pelo menos ${n} caracteres.`,
  maxLength: (v: string, n: number, label = "Campo") =>
    !v || v.length <= n ? null : `${label} deve ter no máximo ${n} caracteres.`,
  cpf: (v: string) => {
    if (!v) return null;
    const d = v.replace(/\D/g, "");
    return d.length === 11 ? null : "CPF deve conter 11 dígitos.";
  },
  cnpj: (v: string) => {
    if (!v) return null;
    const d = v.replace(/\D/g, "");
    return d.length === 14 ? null : "CNPJ deve conter 14 dígitos.";
  },
  phone: (v: string) => {
    if (!v) return null;
    const d = v.replace(/\D/g, "");
    return d.length >= 10 && d.length <= 11 ? null : "Telefone inválido.";
  },
  positiveNumber: (v: number, label = "Valor") =>
    Number.isFinite(v) && v > 0 ? null : `${label} deve ser maior que zero.`,
};
