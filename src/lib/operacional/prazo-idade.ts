// Regra brasileira padrão de prazo de financiamento habitacional por idade.
// Referência: CEF / SFH — idade do proponente + prazo não pode ultrapassar
// 80 anos e 6 meses (80,5 anos = 966 meses). Teto absoluto de 420 meses (35 anos).

export const PRAZO_MAX_ABSOLUTO = 420; // 35 anos (CEF SBPE)
export const IDADE_MAX_MESES = 80 * 12 + 6; // 80a 6m = 966 meses

export function calcularIdadeMeses(dataNascISO: string, ref: Date = new Date()): number | null {
  if (!dataNascISO) return null;
  const dn = new Date(dataNascISO);
  if (Number.isNaN(dn.getTime())) return null;
  let anos = ref.getFullYear() - dn.getFullYear();
  let meses = ref.getMonth() - dn.getMonth();
  if (ref.getDate() < dn.getDate()) meses -= 1;
  return anos * 12 + meses;
}

/** Prazo máximo (meses) permitido para esta idade. Retorna null se data ausente. */
export function prazoMaxPorIdade(dataNascISO: string): number | null {
  const idadeM = calcularIdadeMeses(dataNascISO);
  if (idadeM === null) return null;
  const disponivel = IDADE_MAX_MESES - idadeM;
  if (disponivel <= 0) return 0;
  return Math.min(PRAZO_MAX_ABSOLUTO, disponivel);
}

export function formatIdadeAnos(dataNascISO: string): string {
  const m = calcularIdadeMeses(dataNascISO);
  if (m === null) return "—";
  const anos = Math.floor(m / 12);
  const meses = m % 12;
  return meses === 0 ? `${anos} anos` : `${anos}a ${meses}m`;
}
