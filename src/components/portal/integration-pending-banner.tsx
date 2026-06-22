import { AlertTriangle } from "lucide-react";

/**
 * Faixa de alerta exibida no topo das telas que ainda dependem da
 * integração com APIs externas de IA (Scan IA / Flash IA).
 *
 * Para desativar globalmente quando a integração for concluída,
 * basta alterar a flag abaixo para `false` (ou remover o componente
 * dos pontos de uso).
 */
export const INTEGRATION_PENDING = true;

export function IntegrationPendingBanner() {
  if (!INTEGRATION_PENDING) return null;

  return (
    <>
      <style>{`
        @keyframes integration-pulse {
          0%, 100% { background-color: #facc15; }
          50%      { background-color: #fde047; }
        }
        .integration-pending-banner {
          animation: integration-pulse 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .integration-pending-banner { animation: none; background-color: #facc15; }
        }
      `}</style>

      <div
        role="alert"
        aria-live="polite"
        className="integration-pending-banner mb-5 flex w-full items-center gap-3 rounded-md border-2 border-yellow-500 px-4 py-3 text-[#1a1a1a] shadow-sm sm:gap-4 sm:px-5"
      >
        <span
          aria-label="Atenção"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-[#1a1a1a] text-yellow-300"
        >
          <AlertTriangle className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] sm:text-[13px]">
            Aguarde — Integração com APIs em andamento
          </p>
          <p className="mt-0.5 hidden text-[11.5px] font-medium leading-snug text-[#2a2a2a] sm:block">
            Esta funcionalidade está em fase final de integração com os serviços
            de Inteligência Artificial. Os resultados exibidos podem ser de
            demonstração.
          </p>
        </div>
      </div>
    </>
  );
}
