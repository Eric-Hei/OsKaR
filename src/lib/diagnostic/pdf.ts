import { jsPDF } from 'jspdf';
import type { AnalysisResult } from './types';
import { fmt, stateLabel, stateColor } from './scoring';

// Charte OSKAR
const NAVY = '#1e2d7d';
const TEAL = '#00d4b4';
const INK = '#1f2937';
const MUTED = '#6b7280';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/**
 * Génère le PDF de synthèse du bilan de maturité OSKAR.
 * Utilisable côté serveur (Node) — renvoie le document sous forme d'ArrayBuffer.
 */
export function generateDiagnosticPdf(result: AnalysisResult): ArrayBuffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 16;
  const maxW = W - margin * 2;
  let y = 0;

  const fill = (hex: string) => doc.setFillColor(...hexToRgb(hex));
  const ink = (hex: string) => doc.setTextColor(...hexToRgb(hex));

  // Saut de page si nécessaire
  const guard = (needed: number) => {
    if (y + needed > H - margin) { doc.addPage(); y = margin; }
  };

  // Titre de section avec filet teal
  const section = (title: string) => {
    guard(16);
    y += 4;
    fill(TEAL);
    doc.rect(margin, y - 3.5, 3, 5, 'F');
    ink(NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, margin + 6, y);
    y += 7;
  };

  // Paragraphe (gère le retour à la ligne et la pagination)
  const paragraph = (text: string, size = 10, color = INK, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    ink(color);
    const lines = doc.splitTextToSize(text, maxW) as string[];
    lines.forEach((line) => {
      guard(size * 0.5);
      doc.text(line, margin, y);
      y += size * 0.5 + 0.6;
    });
  };

  // En-tête (bandeau navy)
  fill(NAVY);
  doc.rect(0, 0, W, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('OSKAR — Bilan de maturité', margin, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`${result.evaluatedCount}/5 piliers évalués · ${date}`, margin, 24);
  y = 46;

  // Score global
  ink(NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  doc.text(fmt(result.average), margin, y + 6);
  const labelW = doc.getTextWidth(fmt(result.average));
  ink(MUTED);
  doc.setFontSize(14);
  doc.text('/ 10', margin + labelW + 2, y + 6);
  const sc = stateColor(result.averageState);
  ink(sc.c);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(stateLabel(result.averageState).toUpperCase(), margin, y + 13);
  y += 20;
  paragraph(result.globalMessage, 10, INK);
  y += 2;

  // Récap par pilier
  section('Scores par pilier');
  result.recap.forEach((r) => {
    guard(7);
    ink(INK);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(r.label, margin, y);
    const rc = stateColor(r.state);
    ink(rc.c);
    doc.setFont('helvetica', 'bold');
    doc.text(`${fmt(r.score)} · ${stateLabel(r.state)}`, W - margin, y, { align: 'right' });
    y += 6.5;
  });

  // Axes prioritaires
  if (result.priorities.length) {
    section('Axes prioritaires');
    result.priorities.forEach((p) => {
      paragraph(`${p.label} (${fmt(p.score)}) — ${p.prio}`, 10, NAVY, true);
      paragraph(p.detail, 9.5, MUTED);
      y += 1.5;
    });
  }

  // Points d'appui
  if (result.supports.length) {
    section("Points d'appui");
    result.supports.forEach((s) => {
      paragraph(`${s.label} (${fmt(s.score)})`, 10, NAVY, true);
      paragraph(s.detail, 9.5, MUTED);
      y += 1.5;
    });
  }

  // Analyses croisées
  if (result.insights.length) {
    section('Analyses croisées');
    result.insights.forEach((i) => {
      paragraph(i.t1, 10, NAVY, true);
      paragraph(i.t2, 9.5, MUTED);
      y += 1.5;
    });
  }

  // Recommandation
  if (result.reco) {
    section('Recommandation');
    paragraph(result.reco.title, 10, NAVY, true);
    paragraph(result.reco.text, 9.5, INK);
  }

  return doc.output('arraybuffer');
}
