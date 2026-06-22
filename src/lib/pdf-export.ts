// Branded PDF export — institutional layout for Agilliza reports.
// Carrega o brand-mark e gera um cabeçalho/rodapé consistente em todos os relatórios.

import jsPDF from "jspdf";
import autoTable, { type RowInput, type Styles } from "jspdf-autotable";
import brandMark from "@/assets/brand-mark.png";

const BRAND = {
  primary: [0, 15, 159] as const,    // #000F9F
  dark: [10, 16, 70] as const,
  accent: [245, 51, 63] as const,    // direction
  text: [20, 24, 38] as const,
  muted: [110, 118, 138] as const,
  soft: [243, 246, 252] as const,
  rule: [220, 226, 240] as const,
  white: [255, 255, 255] as const,
};

export type BrandedPdfKpi = { label: string; value: string };
export type BrandedPdfSection = {
  title?: string;
  subtitle?: string;
  head?: string[];
  body: RowInput[];
  columnStyles?: Record<number, Partial<Styles>>;
};

export type BrandedPdfOptions = {
  title: string;
  subtitle?: string;
  module?: string;          // "CRM", "Operacional", "Financeiro", "Cliente"
  period?: string;
  filters?: { label: string; value: string }[];
  scope?: string;           // ex.: "Correspondente · Visão consolidada"
  confidential?: boolean;
  kpis?: BrandedPdfKpi[];
  sections?: BrandedPdfSection[];
  fileName?: string;
  orientation?: "portrait" | "landscape";
};

let cachedLogo: string | null = null;
async function logoAsDataUrl(): Promise<string | null> {
  if (cachedLogo) return cachedLogo;
  try {
    const res = await fetch(brandMark);
    const blob = await res.blob();
    cachedLogo = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
    return cachedLogo;
  } catch {
    return null;
  }
}

const fmtNow = () =>
  new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

function sanitizeFile(name: string) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export async function generateBrandedPdf(opts: BrandedPdfOptions): Promise<jsPDF> {
  const orientation = opts.orientation ?? "landscape";
  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 36;
  const logo = await logoAsDataUrl();

  // ====== HEADER ======
  const headerH = 78;
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageW, headerH, "F");
  // faixa de acento
  doc.setFillColor(...BRAND.accent);
  doc.rect(0, headerH, pageW, 3, "F");

  // Logo
  if (logo) {
    try { doc.addImage(logo, "PNG", margin, 18, 42, 42); } catch { /* ignore */ }
  }

  // Wordmark
  doc.setTextColor(...BRAND.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AGILLIZA", margin + (logo ? 54 : 0), 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Plataforma de Crédito Imobiliário", margin + (logo ? 54 : 0), 52);

  // Meta no canto direito
  const metaX = pageW - margin;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(opts.module ?? "Relatório", metaX, 32, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Emitido em ${fmtNow()}`, metaX, 46, { align: "right" });
  if (opts.confidential) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("CONFIDENCIAL · USO INTERNO", metaX, 60, { align: "right" });
    doc.setFont("helvetica", "normal");
  }

  // ====== TÍTULO ======
  let y = headerH + 28;
  doc.setTextColor(...BRAND.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(opts.title, margin, y);
  y += 18;

  if (opts.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(opts.subtitle, margin, y);
    y += 14;
  }

  // Linha de contexto: período / escopo
  const contextItems: string[] = [];
  if (opts.scope) contextItems.push(opts.scope);
  if (opts.period) contextItems.push(`Período: ${opts.period}`);
  if (contextItems.length) {
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(contextItems.join("   •   "), margin, y);
    y += 12;
  }

  // Filtros aplicados
  if (opts.filters?.length) {
    const txt = "Filtros: " + opts.filters.map((f) => `${f.label}: ${f.value}`).join("  ·  ");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.muted);
    const lines = doc.splitTextToSize(txt, pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 11;
  }

  // Régua
  y += 6;
  doc.setDrawColor(...BRAND.rule);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 18;

  // ====== KPIs ======
  if (opts.kpis?.length) {
    const cols = Math.min(opts.kpis.length, 4);
    const gap = 10;
    const cardW = (pageW - margin * 2 - gap * (cols - 1)) / cols;
    const cardH = 54;
    opts.kpis.slice(0, 8).forEach((k, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margin + col * (cardW + gap);
      const yy = y + row * (cardH + gap);
      doc.setFillColor(...BRAND.soft);
      doc.setDrawColor(...BRAND.rule);
      doc.roundedRect(x, yy, cardW, cardH, 4, 4, "FD");
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.muted);
      doc.setFont("helvetica", "bold");
      doc.text(k.label.toUpperCase(), x + 10, yy + 16);
      doc.setFontSize(14);
      doc.setTextColor(...BRAND.dark);
      doc.text(k.value, x + 10, yy + 38);
      doc.setFont("helvetica", "normal");
    });
    const rows = Math.ceil(opts.kpis.length / cols);
    y += rows * (cardH + gap) + 4;
  }

  // ====== SEÇÕES ======
  for (const sec of opts.sections ?? []) {
    if (y > pageH - 120) { doc.addPage(); y = 60; }
    if (sec.title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...BRAND.dark);
      doc.text(sec.title, margin, y);
      y += 4;
    }
    if (sec.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.muted);
      doc.text(sec.subtitle, margin, y + 10);
      y += 14;
    } else if (sec.title) {
      y += 10;
    }

    autoTable(doc, {
      startY: y + 4,
      head: sec.head ? [sec.head] : undefined,
      body: sec.body,
      theme: "grid",
      headStyles: {
        fillColor: [...BRAND.primary], textColor: [255, 255, 255],
        fontStyle: "bold", fontSize: 9, halign: "left",
      },
      bodyStyles: { fontSize: 9, textColor: [...BRAND.text], cellPadding: 5 },
      alternateRowStyles: { fillColor: [248, 250, 253] },
      styles: { lineColor: [...BRAND.rule], lineWidth: 0.3 },
      margin: { left: margin, right: margin },
      columnStyles: sec.columnStyles,
    });
    // @ts-expect-error lastAutoTable injected by autoTable
    y = (doc.lastAutoTable?.finalY ?? y) + 18;
  }

  // ====== FOOTER em todas as páginas ======
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BRAND.rule);
    doc.setLineWidth(0.4);
    doc.line(margin, pageH - 32, pageW - margin, pageH - 32);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text("Agilliza · Plataforma de Crédito Imobiliário", margin, pageH - 18);
    if (opts.confidential) {
      doc.text("Documento confidencial — distribuição interna", pageW / 2, pageH - 18, { align: "center" });
    }
    doc.text(`Página ${i} de ${total}`, pageW - margin, pageH - 18, { align: "right" });
  }

  return doc;
}

export async function downloadBrandedPdf(opts: BrandedPdfOptions) {
  try {
    const doc = await generateBrandedPdf(opts);
    const name = sanitizeFile(opts.fileName ?? opts.title) || "relatorio";
    doc.save(`${name}.pdf`);
    return doc;
  } catch (err) {
    console.error("[pdf-export] downloadBrandedPdf falhou", err);
    const { toast } = await import("sonner");
    try {
      toast.error("Não foi possível gerar o PDF.", {
        description: "Tente novamente. Se o problema persistir, atualize a página.",
      });
    } catch { /* sonner não montado */ }
    throw err;
  }
}

export async function openBrandedPdf(opts: BrandedPdfOptions) {
  try {
    const doc = await generateBrandedPdf(opts);
    const url = doc.output("bloburl");
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) {
      const { toast } = await import("sonner");
      toast.warning("Bloqueio de pop-up detectado.", {
        description: "Permita pop-ups deste site para visualizar o PDF.",
      });
    }
  } catch (err) {
    console.error("[pdf-export] openBrandedPdf falhou", err);
    const { toast } = await import("sonner");
    try {
      toast.error("Não foi possível abrir o PDF.", {
        description: "Tente novamente em instantes.",
      });
    } catch { /* */ }
    throw err;
  }
}
