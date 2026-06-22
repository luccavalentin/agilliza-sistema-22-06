import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { applyMask, isValidCPF, isValidCNPJ, isValidEmail, type MaskKind } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type BaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue">;

export interface MaskedInputProps extends BaseProps {
  mask?: MaskKind;
  value?: string;
  defaultValue?: string;
  onValueChange?: (formatted: string) => void;
  validate?: "cpf" | "cnpj" | "cpfcnpj" | "email";
  invalidMessage?: string;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(function MaskedInput(
  { mask, value, defaultValue, onValueChange, validate, invalidMessage, className, onBlur, type, ...rest },
  ref,
) {
  const [internal, setInternal] = useState<string>(
    defaultValue !== undefined && mask ? applyMask(mask, defaultValue) : (defaultValue ?? ""),
  );
  const [error, setError] = useState<string | null>(null);

  const controlled = value !== undefined;
  const current = controlled ? (mask ? applyMask(mask, value!) : value!) : internal;

  const handleChange = (raw: string) => {
    const next = mask ? applyMask(mask, raw) : raw;
    if (!controlled) setInternal(next);
    onValueChange?.(next);
    if (error) setError(null);
  };

  const runValidate = (v: string) => {
    if (!validate) return null;
    if (!v) return null;
    if (validate === "email" && !isValidEmail(v)) return invalidMessage ?? "E-mail inválido";
    if (validate === "cpf" && !isValidCPF(v)) return invalidMessage ?? "CPF inválido";
    if (validate === "cnpj" && !isValidCNPJ(v)) return invalidMessage ?? "CNPJ inválido";
    if (validate === "cpfcnpj") {
      const d = v.replace(/\D/g, "");
      if (d.length === 11 && !isValidCPF(v)) return invalidMessage ?? "CPF inválido";
      if (d.length === 14 && !isValidCNPJ(v)) return invalidMessage ?? "CNPJ inválido";
      if (d.length !== 11 && d.length !== 14) return invalidMessage ?? "Informe CPF ou CNPJ";
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        type={type ?? "text"}
        inputMode={mask === "currency" || mask === "percent" || mask === "phone" || mask === "cep" || mask === "date" || mask === "cpf" || mask === "cnpj" || mask === "cpfcnpj" ? "numeric" : undefined}
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => {
          setError(runValidate(e.target.value));
          onBlur?.(e);
        }}
        aria-invalid={!!error}
        className={cn(
          "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors",
          "focus:border-brand focus:ring-2 focus:ring-brand/15",
          error ? "border-direction" : "border-border",
          className,
        )}
        {...rest}
      />
      {error && <p className="text-[11px] font-medium text-direction">{error}</p>}
    </div>
  );
});
