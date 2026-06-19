// Formatadores e máscaras BR — uso em inputs, exibição em tabelas e relatórios.

const onlyDigits = (v: string) => (v ?? "").replace(/\D+/g, "");

// ---------------- CPF ----------------
export function maskCPF(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

export function isValidCPF(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (base: string, factor: number) => {
    let s = 0;
    for (let i = 0; i < base.length; i++) s += parseInt(base[i]) * (factor - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = calc(d.slice(0, 9), 10);
  const d2 = calc(d.slice(0, 10), 11);
  return d1 === parseInt(d[9]) && d2 === parseInt(d[10]);
}

// ---------------- CNPJ ----------------
export function maskCNPJ(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function isValidCNPJ(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (base: string, weights: number[]) => {
    let s = 0;
    for (let i = 0; i < base.length; i++) s += parseInt(base[i]) * weights[i];
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(d.slice(0, 12), w1);
  const d2 = calc(d.slice(0, 13), w2);
  return d1 === parseInt(d[12]) && d2 === parseInt(d[13]);
}

// ---------------- CPF ou CNPJ automático ----------------
export function maskCpfCnpj(value: string): string {
  const d = onlyDigits(value);
  return d.length <= 11 ? maskCPF(d) : maskCNPJ(d);
}

// ---------------- Telefone ----------------
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

// ---------------- CEP ----------------
export function maskCEP(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  return d.replace(/^(\d{5})(\d)/, "$1-$2");
}

// ---------------- Data dd/mm/aaaa ----------------
export function maskDateBR(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  return d
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

// ---------------- Moeda BRL ----------------
export function maskCurrency(value: string | number): string {
  if (typeof value === "number") return formatBRL(value);
  const d = onlyDigits(String(value));
  if (!d) return "";
  const cents = parseInt(d, 10) / 100;
  return formatBRL(cents);
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function parseBRL(value: string): number {
  if (!value) return 0;
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

// ---------------- Percentual ----------------
export function maskPercent(value: string): string {
  const d = onlyDigits(value).slice(0, 5);
  if (!d) return "";
  const n = parseInt(d, 10) / 100;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + "%";
}

export function formatPercent(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value) + "%";
}

// ---------------- Número BR ----------------
export function formatNumberBR(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value || 0);
}

// ---------------- E-mail ----------------
export function normalizeEmail(value: string): string {
  return (value ?? "").trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const v = normalizeEmail(value);
  // RFC 5322 simplificado, suficiente para UI
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v);
}

// ---------------- Placa Mercosul / Tradicional ----------------
export function maskPlaca(value: string): string {
  const v = (value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  return v.replace(/^([A-Z]{3})(\w)/, "$1-$2");
}

// ---------------- Inscrição genérica de dígitos ----------------
export function digitsOnly(value: string, max?: number): string {
  const d = onlyDigits(value);
  return max ? d.slice(0, max) : d;
}

// ---------------- Tipo de máscara para inputs ----------------
export type MaskKind =
  | "cpf"
  | "cnpj"
  | "cpfcnpj"
  | "phone"
  | "cep"
  | "date"
  | "currency"
  | "percent"
  | "placa";

export function applyMask(kind: MaskKind, value: string): string {
  switch (kind) {
    case "cpf": return maskCPF(value);
    case "cnpj": return maskCNPJ(value);
    case "cpfcnpj": return maskCpfCnpj(value);
    case "phone": return maskPhone(value);
    case "cep": return maskCEP(value);
    case "date": return maskDateBR(value);
    case "currency": return maskCurrency(value);
    case "percent": return maskPercent(value);
    case "placa": return maskPlaca(value);
  }
}
