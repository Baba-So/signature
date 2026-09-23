import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { LoadedFile } from '../types';

/**
 * Generates a realistic transparent handwritten signature PNG
 */
export function createSampleSignatureDataUrl(): { dataUrl: string; width: number; height: number } {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 240;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#1e3a8a'; // Deep blue fountain pen ink
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw expressive signature curve
  ctx.beginPath();
  // Capital J/M flourish
  ctx.moveTo(80, 150);
  ctx.bezierCurveTo(90, 60, 160, 50, 180, 130);
  ctx.bezierCurveTo(190, 170, 210, 190, 240, 120);
  ctx.bezierCurveTo(260, 80, 280, 100, 310, 145);
  ctx.bezierCurveTo(340, 180, 370, 110, 400, 135);
  ctx.bezierCurveTo(430, 155, 460, 120, 510, 90);
  ctx.stroke();

  // Swash underline
  ctx.beginPath();
  ctx.lineWidth = 3.5;
  ctx.moveTo(110, 185);
  ctx.bezierCurveTo(240, 175, 420, 180, 540, 155);
  ctx.stroke();

  // Quick energetic dots and cross
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.arc(490, 75, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(330, 120);
  ctx.lineTo(365, 110);
  ctx.stroke();

  const dataUrl = canvas.toDataURL('image/png');
  return { dataUrl, width: 600, height: 240 };
}

/**
 * Generates an authentic circular rubber stamp PNG
 */
export function createSampleStampDataUrl(): { dataUrl: string; width: number; height: number } {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = 200;
  const cy = 200;
  const color = '#b91c1c'; // Official deep red rubber stamp color

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  // Outer thick circle
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.stroke();

  // Inner thin dashed/solid circle
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 168, 0, Math.PI * 2);
  ctx.stroke();

  // Center inner ring
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 115, 0, Math.PI * 2);
  ctx.stroke();

  // Center text
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VU ET APPROUVÉ', cx, cy - 14);

  ctx.font = '600 15px system-ui, sans-serif';
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  ctx.fillText(`LE ${today}`, cx, cy + 16);

  // Curved text top: "DIRECTION GÉNÉRALE • PARIS"
  drawCurvedText(ctx, 'DIRECTION GÉNÉRALE • PARIS', cx, cy, 142, Math.PI * 1.5, true);

  // Curved text bottom: "R.C.S. PARIS 892 410 321"
  drawCurvedText(ctx, '★ R.C.S. PARIS B 892 410 321 ★', cx, cy, 142, Math.PI * 0.5, false);

  const dataUrl = canvas.toDataURL('image/png');
  return { dataUrl, width: 400, height: 400 };
}

function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  centerAngle: number,
  top: boolean
) {
  ctx.save();
  ctx.font = 'bold 15px monospace, sans-serif';
  const totalAngle = (text.length * 9 * Math.PI) / 180;
  const startAngle = centerAngle - totalAngle / 2;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charAngle = startAngle + (i / (text.length - 1 || 1)) * totalAngle;
    ctx.save();
    if (top) {
      ctx.translate(cx + Math.cos(charAngle) * radius, cy + Math.sin(charAngle) * radius);
      ctx.rotate(charAngle + Math.PI / 2);
    } else {
      ctx.translate(cx + Math.cos(charAngle) * radius, cy + Math.sin(charAngle) * radius);
      ctx.rotate(charAngle - Math.PI / 2);
    }
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Creates a 3-page sample professional contract PDF
 */
export async function createSampleDocument(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // --- PAGE 1 ---
  const p1 = doc.addPage([595.28, 841.89]); // A4
  p1.drawRectangle({
    x: 40,
    y: 770,
    width: 515,
    height: 38,
    color: rgb(0.95, 0.96, 0.98),
  });
  p1.drawText('CONTRAT DE PRESTATION DE SERVICES', {
    x: 60,
    y: 782,
    size: 16,
    font: bold,
    color: rgb(0.1, 0.2, 0.4),
  });
  p1.drawText('RÉFÉRENCE : CTR-2026-09-V3', {
    x: 390,
    y: 784,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  p1.drawText('ENTRE LES SOUSSIGNÉS :', {
    x: 45,
    y: 730,
    size: 12,
    font: bold,
    color: rgb(0.15, 0.15, 0.15),
  });
  p1.drawText('1. La société ALPHA CONSULTING SAS, au capital de 100 000 €, sise à Paris.', {
    x: 45,
    y: 705,
    size: 10,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  p1.drawText('Ci-après désignée « Le Prestataire », d\'une part,', {
    x: 45,
    y: 690,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  p1.drawText('ET :', {
    x: 45,
    y: 665,
    size: 12,
    font: bold,
    color: rgb(0.15, 0.15, 0.15),
  });
  p1.drawText('2. La société BETA LOGISTICS SAS, représentée par sa Direction Commerciale.', {
    x: 45,
    y: 640,
    size: 10,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });
  p1.drawText('Ci-après désignée « Le Client », d\'autre part.', {
    x: 45,
    y: 625,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  p1.drawText('IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :', {
    x: 45,
    y: 590,
    size: 11,
    font: bold,
    color: rgb(0.1, 0.2, 0.4),
  });

  p1.drawText('ARTICLE 1 - OBJET DE LA MISSION', {
    x: 45,
    y: 560,
    size: 11,
    font: bold,
    color: rgb(0.15, 0.15, 0.15),
  });
  const bodyText1 = [
    'Le Prestataire s\'engage à accompagner le Client dans le déploiement de son infrastructure technique,',
    'la validation des flux documentaires et l\'intégration des processus de validation numérique certifiée.',
    'Les prestations seront réalisées conformément au calendrier convenu en Annexe technique 1.',
  ];
  let y = 540;
  for (const line of bodyText1) {
    p1.drawText(line, { x: 45, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 18;
  }

  p1.drawText('ARTICLE 2 - TARIFS ET MODALITÉS DE FACTURATION', {
    x: 45,
    y: 460,
    size: 11,
    font: bold,
    color: rgb(0.15, 0.15, 0.15),
  });
  const bodyText2 = [
    'Le montant global forfaitaire des prestations est fixé à 48 500,00 € H.T. (quarante-huit mille cinq cents euros).',
    'Un acompte de 30% sera versé à la signature des présentes. Le solde interviendra à la recette finale.',
    'Tout retard de paiement entraînera l\'application de pénalités d\'un montant égal à trois fois le taux légal.',
  ];
  y = 440;
  for (const line of bodyText2) {
    p1.drawText(line, { x: 45, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 18;
  }

  p1.drawText('Page 1 / 3 — Paraphes obligatoires', {
    x: 230,
    y: 40,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // --- PAGE 2 ---
  const p2 = doc.addPage([595.28, 841.89]);
  p2.drawText('CONDITIONS GÉNÉRALES & CLAUSES JURIDIQUES (SUITE)', {
    x: 45,
    y: 780,
    size: 13,
    font: bold,
    color: rgb(0.1, 0.2, 0.4),
  });

  p2.drawText('ARTICLE 3 - OBLIGATIONS ET CONFIDENTIALITÉ', {
    x: 45,
    y: 740,
    size: 11,
    font: bold,
    color: rgb(0.15, 0.15, 0.15),
  });
  const bodyText3 = [
    'Chacune des Parties s\'engage à garder strictement confidentielles l\'ensemble des informations, données,',
    'secrets de fabrication et documents techniques échangés dans le cadre de la négociation et de l\'exécution.',
    'Cet engagement perdurera pendant une durée de cinq (5) années à compter de la clôture de la mission.',
  ];
  y = 720;
  for (const line of bodyText3) {
    p2.drawText(line, { x: 45, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 18;
  }

  p2.drawText('ARTICLE 4 - RESPONSABILITÉ ET FORCE MAJEURE', {
    x: 45,
    y: 630,
    size: 11,
    font: bold,
    color: rgb(0.15, 0.15, 0.15),
  });
  const bodyText4 = [
    'Le Prestataire souscrit à une obligation de moyens pour l\'ensemble des prestations objet du contrat.',
    'Aucune des parties ne sera tenue pour responsable de l\'inexécution causée par un cas de force majeure,',
    'au sens de l\'article 1218 du Code Civil et de la jurisprudence constante des cours et tribunaux français.',
  ];
  y = 610;
  for (const line of bodyText4) {
    p2.drawText(line, { x: 45, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 18;
  }

  p2.drawText('ARTICLE 5 - LOI APPLICABLE ET ATTRIBUTION DE JURIDICTION', {
    x: 45,
    y: 520,
    size: 11,
    font: bold,
    color: rgb(0.15, 0.15, 0.15),
  });
  const bodyText5 = [
    'Le présent contrat est régi et interprété selon le droit français.',
    'À défaut de résolution amiable, tout litige relèvera de la compétence exclusive du Tribunal de Commerce de Paris.',
  ];
  y = 500;
  for (const line of bodyText5) {
    p2.drawText(line, { x: 45, y, size: 9.5, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 18;
  }

  p2.drawText('Page 2 / 3 — Paraphes obligatoires', {
    x: 230,
    y: 40,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // --- PAGE 3 ---
  const p3 = doc.addPage([595.28, 841.89]);
  p3.drawText('VALIDATION, SIGNATURES ET CACHETS OFFICIELS', {
    x: 45,
    y: 780,
    size: 13,
    font: bold,
    color: rgb(0.1, 0.2, 0.4),
  });

  p3.drawText('Fait à Paris, en deux exemplaires originaux faisant foi.', {
    x: 45,
    y: 740,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  p3.drawText('Les parties confirment avoir pris pleine connaissance de l\'intégralité des clauses ci-dessus.', {
    x: 45,
    y: 720,
    size: 9.5,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Box for Client
  p3.drawRectangle({
    x: 45,
    y: 360,
    width: 240,
    height: 320,
    borderWidth: 1,
    borderColor: rgb(0.8, 0.82, 0.86),
    color: rgb(0.98, 0.98, 1),
  });
  p3.drawText('POUR LE CLIENT :', {
    x: 60,
    y: 655,
    size: 10,
    font: bold,
    color: rgb(0.2, 0.2, 0.2),
  });
  p3.drawText('Nom : M. Henri DUPONT', { x: 60, y: 635, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  p3.drawText('Qualité : Directeur Général', { x: 60, y: 618, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  p3.drawText('Mention manuscrite « Bon pour accord »', {
    x: 60,
    y: 595,
    size: 8.5,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Box for Prestataire
  p3.drawRectangle({
    x: 310,
    y: 360,
    width: 240,
    height: 320,
    borderWidth: 1,
    borderColor: rgb(0.8, 0.82, 0.86),
    color: rgb(0.98, 0.98, 1),
  });
  p3.drawText('POUR LE PRESTATAIRE :', {
    x: 325,
    y: 655,
    size: 10,
    font: bold,
    color: rgb(0.2, 0.2, 0.2),
  });
  p3.drawText('Nom : Mme Sophie LEMAITRE', { x: 325, y: 635, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  p3.drawText('Qualité : Présidente Directrice', { x: 325, y: 618, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  p3.drawText('Cachet et signature autorisée :', {
    x: 325,
    y: 595,
    size: 8.5,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  p3.drawText('Page 3 / 3 — Signatures finales', {
    x: 230,
    y: 40,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await doc.save();
}

/**
 * Creates a sample professional corporate letterhead PDF
 */
export async function createSampleLetterhead(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595.28, 841.89]);

  // Top header graphic bar
  page.drawRectangle({
    x: 0,
    y: 834,
    width: 595.28,
    height: 8,
    color: rgb(0.12, 0.25, 0.56), // Navy blue
  });
  page.drawRectangle({
    x: 400,
    y: 834,
    width: 195.28,
    height: 8,
    color: rgb(0.92, 0.38, 0.1), // Orange accent
  });

  // Modern corporate header logo mark
  page.drawRectangle({
    x: 45,
    y: 795,
    width: 24,
    height: 24,
    color: rgb(0.12, 0.25, 0.56),
  });
  page.drawText('ACME CORP GROUP', {
    x: 78,
    y: 805,
    size: 13,
    font: bold,
    color: rgb(0.12, 0.25, 0.56),
  });
  page.drawText('SOLUTIONS TECHNOLOGIQUES & SERVICES AUX ENTREPRISES', {
    x: 78,
    y: 795,
    size: 7,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText('www.acme-corp.example.com • contact@acme.com', {
    x: 360,
    y: 800,
    size: 7.5,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Footer letterhead band
  page.drawLine({
    start: { x: 45, y: 55 },
    end: { x: 550, y: 55 },
    thickness: 0.8,
    color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText('ACME Corp Group — SA au capital de 1 200 000 € — 142 Rue de Rivoli, 75001 Paris — SIRET 892 410 321 00018 — TVA FR892410321', {
    x: 55,
    y: 42,
    size: 6.5,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await doc.save();
}

/**
 * Creates LoadedFile object from a data url (image)
 */
export async function createLoadedImageFromDataUrl(
  dataUrl: string,
  name: string,
  width: number,
  height: number
): Promise<LoadedFile> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  return {
    name,
    size: blob.size,
    type: 'image/png',
    dataUrl,
    arrayBuffer,
    uint8Array,
    width,
    height,
    aspectRatio: width / height,
  };
}
