/**
 * safe-storage.ts — Acesso defensivo ao localStorage.
 *
 * Trata SSR, quota cheia, modo privado e JSON corrompido sem quebrar a UI.
 * Sempre devolve um fallback seguro e registra o erro real no console.
 */

function hasWindow(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function safeGet<T = string>(key: string, fallback: T | null = null): T | string | null {
  if (!hasWindow()) return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ?? fallback;
  } catch (err) {
    console.error(`[safe-storage] getItem("${key}") falhou`, err);
    return fallback;
  }
}

export function safeGetJSON<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === "") return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[safe-storage] parse JSON("${key}") falhou`, err);
    return fallback;
  }
}

export function safeSet(key: string, value: string): boolean {
  if (!hasWindow()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.error(`[safe-storage] setItem("${key}") falhou`, err);
    return false;
  }
}

export function safeSetJSON(key: string, value: unknown): boolean {
  try {
    return safeSet(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[safe-storage] stringify("${key}") falhou`, err);
    return false;
  }
}

export function safeRemove(key: string): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.error(`[safe-storage] removeItem("${key}") falhou`, err);
  }
}
