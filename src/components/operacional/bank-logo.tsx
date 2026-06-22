// Bank logo badge — usa logos oficiais via simple-icons CDN com fallback de sigla.

import { useState } from "react";
import type { Banco } from "@/lib/operacional/types";

type Size = "xs" | "sm" | "md" | "lg";

const sizeMap: Record<Size, { box: string; img: string; text: string }> = {
  xs: { box: "h-5 w-5",   img: "h-3 w-3",     text: "text-[8px]"  },
  sm: { box: "h-6 w-6",   img: "h-3.5 w-3.5", text: "text-[9px]"  },
  md: { box: "h-8 w-8",   img: "h-4 w-4",     text: "text-[10px]" },
  lg: { box: "h-10 w-10", img: "h-5 w-5",     text: "text-[11px]" },
};

export function BankLogo({
  banco,
  size = "sm",
  showName = false,
  className = "",
}: {
  banco?: Banco | null;
  size?: Size;
  showName?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!banco) return null;
  const s = sizeMap[size];
  const bg = banco.brandColor ? `#${banco.brandColor}` : "var(--secondary)";
  const url = banco.logoSlug
    ? `https://cdn.simpleicons.org/${banco.logoSlug}/ffffff`
    : null;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        title={banco.nome}
        aria-label={banco.nome}
        className={`grid ${s.box} shrink-0 place-items-center rounded-md ring-1 ring-black/5 shadow-sm`}
        style={{ backgroundColor: bg }}
      >
        {url && !failed ? (
          <img
            src={url}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className={`${s.img} object-contain`}
            style={{ filter: "drop-shadow(0 0 0.5px rgba(0,0,0,0.2))" }}
          />
        ) : (
          <span className={`font-bold text-white ${s.text}`}>{banco.sigla.slice(0, 4)}</span>
        )}
      </span>
      {showName && (
        <span className="truncate text-xs font-semibold text-graphite">{banco.nome}</span>
      )}
    </span>
  );
}
