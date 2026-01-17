import jsPDF from 'jspdf';
import { ABBK_COLORS } from './theme';

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export function generatePresencePDF(formData, fileName) {
  const doc = createPresencePDF(formData);
  doc.save(fileName);
}

export function getPresencePDFBlob(formData) {
  const doc = createPresencePDF(formData);
  return doc.output('blob');
}

function createPresencePDF(formData) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 20;

  const presenceData = formData.presenceData || {}; 
   // ABBK Colors
    const redRgb = hexToRgb(ABBK_COLORS.red);
    const darkRedRgb = hexToRgb(ABBK_COLORS.darkred);
    const blackRgb = hexToRgb(ABBK_COLORS.black);
    const grayRgb = hexToRgb(ABBK_COLORS.gray);
  // Title - BLACK
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('FICHE', pageWidth / 2, y, { align: 'center' });
  y += 18;
  doc.text('DE PRÉSENCE', pageWidth / 2, y, { align: 'center' });
  y += 30;

  // Draw border around the page - NOW BLACK
  doc.setLineWidth(1.5);
  doc.setDrawColor(0, 0, 0); // Black border
  doc.rect(10, 10, pageWidth - 20, pageHeight - 80);

  // ===== HEADER SECTION WITH LOGO =====
  y = 50;
  const logoX = margin;
  const logoY = y;
  const logoWidth = 120;
  const logoHeight = 60;

  // Add ABBK logo
  try {
    const logoPath = '/logo-abbk.png';
    doc.addImage(logoPath, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Logo not found, using text fallback');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(redRgb.r, redRgb.g, redRgb.b); // Logo text stays red
    doc.text('ABBK', logoX, logoY + 30);
    doc.setFontSize(12);
    doc.text('PhysicsWorks', logoX, logoY + 50);
    doc.setTextColor(0, 0, 0);
  }

  // Company details below logo - BLACK
  y = logoY + logoHeight + 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('ABBK PhysicsWorks', logoX, y);
  y += 12;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayRgb.r, grayRgb.g, grayRgb.b); // Gray for address
  doc.text('Adresse: Cyberparc Régional, 3200, Tataouine, Tunisie.', logoX, y);
  y += 12;
  doc.text('Branche: 4ème Étage Pépinière de Technopôle El', logoX, y);
  y += 12;
  doc.text('Ghazela, 2083 Rue Ibn Hamdoun, Tunisie.', logoX, y);
  y += 10;
  doc.setTextColor(0, 0, 0);

  // Right side - Client information box - BLACK BORDER
  const rightBoxX = pageWidth - margin - 250;
  const rightBoxY = logoY;
  const boxWidth = 250;
  const boxHeight = 110;

  doc.setLineWidth(2);
  doc.setDrawColor(0, 0, 0); // Black border
  doc.rect(rightBoxX, rightBoxY, boxWidth, boxHeight);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black text
  let boxY = rightBoxY + 20;
  
  doc.text(`Client: ${formData.clientName || ''}`, rightBoxX + 10, boxY);
  boxY += 20;
  
  const addressText = formData.address || '';
  const addressLines = doc.splitTextToSize(`Adresse: ${addressText}`, boxWidth - 20);
  addressLines.forEach((line, index) => {
    doc.text(line, rightBoxX + 10, boxY + (index * 12));
  });
  boxY += (addressLines.length * 12) + 8;
    doc.text(`ID: ${formData.id || ''}`, rightBoxX + 10, boxY); 
     boxY += 20;
  doc.text(`Téléphone: ${formData.phone || ''}`, rightBoxX + 10, boxY);



  // Horizontal line after header - BLACK
  y += 10;
  doc.setLineWidth(2);
  doc.setDrawColor(0, 0, 0); // Black line
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Entreprise field
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Entreprise : ${presenceData.entreprise || '.....'}`, margin, y);
  y += 25;

  // Formation details grid (3x3) - BLACK borders
  doc.setLineWidth(1);
  const gridHeight = 90;
  doc.rect(margin, y, pageWidth - 2 * margin, gridHeight);
  
  const gridStartY = y;
  const colWidth = (pageWidth - 2 * margin) / 3;
  const rowHeight = gridHeight / 3;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Row 1
  let rowY = gridStartY + 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Thème de formation :', margin + 5, rowY);
  doc.setFont('helvetica', 'normal');
  doc.text(presenceData.themeFormation || '', margin + 5, rowY + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Période de formation :', margin + colWidth + 5, rowY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${presenceData.periodeDebut || ''} à ${presenceData.periodeFin || ''}`, margin + colWidth + 5, rowY + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Heure de formation :', margin + 2 * colWidth + 5, rowY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${presenceData.heureDebut || ''} à ${presenceData.heureFin || ''}`, margin + 2 * colWidth + 5, rowY + 12);
  
  // Row 2
  rowY = gridStartY + rowHeight + 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Cadre de formation :', margin + 5, rowY);
  doc.setFont('helvetica', 'normal');
  doc.text(presenceData.cadreFormation || '', margin + 5, rowY + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Nombre de jours de formation :', margin + colWidth + 5, rowY);
  doc.setFont('helvetica', 'normal');
  doc.text(presenceData.nombreJours || '', margin + colWidth + 5, rowY + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Lieu de formation :', margin + 2 * colWidth + 5, rowY);
  doc.setFont('helvetica', 'normal');
  doc.text(presenceData.lieuFormation || '', margin + 2 * colWidth + 5, rowY + 12);
  
  // Row 3
  rowY = gridStartY + 2 * rowHeight + 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Formateur :', margin + 5, rowY);
  doc.setFont('helvetica', 'normal');
  doc.text(presenceData.formateur || '', margin + 5, rowY + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Durée de la formation :', margin + colWidth + 5, rowY);
  doc.setFont('helvetica', 'normal');
  doc.text(presenceData.dureeFormation || '', margin + colWidth + 5, rowY + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Mode de formation :', margin + 2 * colWidth + 5, rowY);
  doc.setFont('helvetica', 'normal');
  doc.text(presenceData.modeFormation || '', margin + 2 * colWidth + 5, rowY + 12);
  
  // Draw grid lines
  doc.line(margin + colWidth, gridStartY, margin + colWidth, gridStartY + gridHeight);
  doc.line(margin + 2 * colWidth, gridStartY, margin + 2 * colWidth, gridStartY + gridHeight);
  doc.line(margin, gridStartY + rowHeight, pageWidth - margin, gridStartY + rowHeight);
  doc.line(margin, gridStartY + 2 * rowHeight, pageWidth - margin, gridStartY + 2 * rowHeight);
  
  y = gridStartY + gridHeight + 20;

  // Participants table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Liste des participants', margin, y);
  y += 20;

  const tableStartY = y;
  const col1Width = 120;
  const col2Width = 120;
  const nombreJours = parseInt(presenceData.nombreJours) || 2;
  const jourWidth = Math.min(40, (pageWidth - 2 * margin - col1Width - col2Width - 80) / nombreJours);
  const detailsWidth = pageWidth - 2 * margin - col1Width - col2Width - (jourWidth * nombreJours);
  
  // Table header - GRAY background
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 25, 'F');
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 25, 'S');
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Nom et Prénom', margin + 5, tableStartY + 16);
  doc.text('Établissement / Entreprise', margin + col1Width + 5, tableStartY + 16);
  
  let colX = margin + col1Width + col2Width;
  doc.text('Jours', colX + (jourWidth * nombreJours / 2) - 10, tableStartY + 16);
  
  colX = margin + col1Width + col2Width + (jourWidth * nombreJours);
  doc.text('Détails', colX + 5, tableStartY + 16);
  
  y = tableStartY + 25;
  
  // Date sub-header
  const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'FD');
  
const dates = [];
if (presenceData.periodeDebut) {
  const startDate = new Date(presenceData.periodeDebut);
  for (let i = 0; i < nombreJours; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(formatDate(date.toISOString().split('T')[0]));
  }
}

  colX = margin + col1Width + col2Width;
  dates.forEach((date, idx) => {
    const x = colX + (idx * jourWidth) + (jourWidth / 2);
    doc.setFontSize(6);
    doc.text(date, x, y + 13, { align: 'center' });
    if (idx > 0) {
      doc.line(colX + (idx * jourWidth), y, colX + (idx * jourWidth), y + 20);
    }
  });
  
  // Draw vertical lines for date columns
  doc.line(margin + col1Width, tableStartY, margin + col1Width, y + 20);
  doc.line(margin + col1Width + col2Width, tableStartY, margin + col1Width + col2Width, y + 20);
  doc.line(margin + col1Width + col2Width + (jourWidth * nombreJours), tableStartY, margin + col1Width + col2Width + (jourWidth * nombreJours), y + 20);
  
  y += 20;
  
 // Participants rows
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
const participants = presenceData.participants || [];
participants.forEach((participant) => {
  const rowStartY = y;
  doc.rect(margin, y, pageWidth - 2 * margin, 25, 'S');
  
  const nomLines = doc.splitTextToSize(participant.nom || '', col1Width - 10);
  doc.text(nomLines, margin + 5, y + 15);
  
  const etabLines = doc.splitTextToSize(participant.etablissement || '', col2Width - 10);
  doc.text(etabLines, margin + col1Width + 5, y + 15);
  
  colX = margin + col1Width + col2Width;
  // Draw vertical line before first day
  doc.line(colX, y, colX, y + 25);
  
 
// Participants rows - Updated checkbox display with X mark
(participant.jours || Array(nombreJours).fill('')).forEach((jour, idx) => {
  const x = colX + (idx * jourWidth) + (jourWidth / 2);
  
  // Display X mark if present
  if (jour === '✓') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('X', x, y + 15, { align: 'center' });
  }
  
  // Draw vertical line after each day column (except the last one)
  if (idx < nombreJours - 1) {
    doc.line(colX + ((idx + 1) * jourWidth), y, colX + ((idx + 1) * jourWidth), y + 25);
  }
});
    colX = margin + col1Width + col2Width + (jourWidth * nombreJours);
    const detailLines = doc.splitTextToSize(participant.details || '', detailsWidth - 10);
    doc.text(detailLines, colX + 5, y + 15);
    
    // Vertical lines
    doc.line(margin + col1Width, rowStartY, margin + col1Width, y + 25);
    doc.line(margin + col1Width + col2Width, rowStartY, margin + col1Width + col2Width, y + 25);
    doc.line(margin + col1Width + col2Width + (jourWidth * nombreJours), rowStartY, margin + col1Width + col2Width + (jourWidth * nombreJours), y + 25);
    
    y += 25;
  });
  
// Formateur row - GRAY background, full width, no columns
doc.setFillColor(220, 220, 220);
doc.rect(margin, y, pageWidth - 2 * margin, 25, 'FD');
doc.setFont('helvetica', 'bold');
doc.setTextColor(0, 0, 0);
doc.text(`Formateur: ${presenceData.formateur || ''}`, margin + 5, y + 15);
// No vertical lines - just one long row
  y += 35;

  // Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Note :', margin, y);
  y += 15;

  doc.setFont('helvetica'); 
  doc.setFontSize(10);
 const notes = presenceData.notes || '';
const noteLines = doc.splitTextToSize(notes, pageWidth - 2 * margin);
noteLines.forEach((line) => {
  doc.text(line, margin, y);
  y += 10;
});
  y += 15;

  // Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
doc.text(`Date Le : ${formatDate(presenceData.dateLe) || ''}`, margin, y);
  
  y += 20;
  
  doc.text('Signature', margin, y);
  doc.text('Signature de Formateur', pageWidth - margin - 150, y);
  
  y += 40;
  doc.text('Signature ABBK PHYSICSWORKS', pageWidth / 2, y, { align: 'center' });

  // Footer - BLACK
  doc.setFillColor(blackRgb.r, blackRgb.g, blackRgb.b);
  doc.rect(10, pageHeight - 30, pageWidth - 20, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('© 2026 Sté ABBK PHYSICSWORKS.', pageWidth / 2, pageHeight - 17, { align: 'center' });

  return doc;
}