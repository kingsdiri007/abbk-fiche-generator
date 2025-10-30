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
  const blackRgb = hexToRgb(ABBK_COLORS.black);

  // Title - BLACK
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('FICHE', pageWidth / 2, y, { align: 'center' });
  y += 18;
  doc.text('DE PRÉSENCE', pageWidth / 2, y, { align: 'center' });
  y += 30;

  // Header with logo - BLACK border
  doc.setLineWidth(2);
  doc.setDrawColor(0, 0, 0); // Black border
  doc.rect(margin, y, pageWidth - 2 * margin, 60);
  
  // Add logo
  try {
    const logoPath = '/logo-abbk.png';
    doc.addImage(logoPath, 'PNG', margin + 10, y + 10, 80, 40);
  } catch (error) {
    console.warn('Logo not found');
  }
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0); // Black
  doc.text('ABBK PHYSICSWORKS', margin + 100, y + 35);
  
  y += 70;

  // Entreprise field
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text(`Entreprise : ${presenceData.entreprise || '.....'}`, margin, y);
  y += 25;

  // Formation details grid (3x3) - BLACK borders
  doc.setLineWidth(1);
  const gridHeight = 90;
  doc.rect(margin, y, pageWidth - 2 * margin, gridHeight);
  
  const gridStartY = y;
  const colWidth = (pageWidth - 2 * margin) / 3;
  const rowHeight = gridHeight / 3;
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Row 1
  let rowY = gridStartY + 12;
  doc.setFont(undefined, 'bold');
  doc.text('Thème de formation :', margin + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.text(presenceData.themeFormation || '', margin + 5, rowY + 12);
  
  doc.setFont(undefined, 'bold');
  doc.text('Période de formation :', margin + colWidth + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.text(`${presenceData.periodeDebut || ''} à ${presenceData.periodeFin || ''}`, margin + colWidth + 5, rowY + 12);
  
  doc.setFont(undefined, 'bold');
  doc.text('Heure de formation :', margin + 2 * colWidth + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.text(`${presenceData.heureDebut || ''} à ${presenceData.heureFin || ''}`, margin + 2 * colWidth + 5, rowY + 12);
  
  // Row 2
  rowY = gridStartY + rowHeight + 12;
  doc.setFont(undefined, 'bold');
  doc.text('Cadre de formation :', margin + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.text(presenceData.cadreFormation || '', margin + 5, rowY + 12);
  
  doc.setFont(undefined, 'bold');
  doc.text('Nombre de jours de formation :', margin + colWidth + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.text(presenceData.nombreJours || '', margin + colWidth + 5, rowY + 12);
  
  doc.setFont(undefined, 'bold');
  doc.text('Lieu de formation :', margin + 2 * colWidth + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.text(presenceData.lieuFormation || '', margin + 2 * colWidth + 5, rowY + 12);
  
  // Row 3
  rowY = gridStartY + 2 * rowHeight + 12;
  doc.setFont(undefined, 'bold');
  doc.text('Formateur :', margin + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.text(presenceData.formateur || '', margin + 5, rowY + 12);
  
  doc.setFont(undefined, 'bold');
  doc.text('Durée de la formation :', margin + colWidth + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.text(presenceData.dureeFormation || '', margin + colWidth + 5, rowY + 12);
  
  doc.setFont(undefined, 'bold');
  doc.text('Mode de formation :', margin + 2 * colWidth + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.text(presenceData.modeFormation || '', margin + 2 * colWidth + 5, rowY + 12);
  
  // Draw grid lines
  doc.line(margin + colWidth, gridStartY, margin + colWidth, gridStartY + gridHeight);
  doc.line(margin + 2 * colWidth, gridStartY, margin + 2 * colWidth, gridStartY + gridHeight);
  doc.line(margin, gridStartY + rowHeight, pageWidth - margin, gridStartY + rowHeight);
  doc.line(margin, gridStartY + 2 * rowHeight, pageWidth - margin, gridStartY + 2 * rowHeight);
  
  y = gridStartY + gridHeight + 20;

  // Participants table
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Black
  doc.text('Liste des participants', margin, y);
  y += 20;

  const tableStartY = y;
  const col1Width = 120;
  const col2Width = 120;
  const nombreJours = parseInt(presenceData.nombreJours) || 2;
  const jourWidth = Math.min(60, (pageWidth - 2 * margin - col1Width - col2Width - 80) / nombreJours);
  const detailsWidth = pageWidth - 2 * margin - col1Width - col2Width - (jourWidth * nombreJours);
  
  // Table header - GRAY background
  doc.setFillColor(220, 220, 220); // Gray
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 25, 'F');
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 25, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0); // Black text
  doc.text('Nom et Prénom', margin + 5, tableStartY + 16);
  doc.text('Établissement / Entreprise', margin + col1Width + 5, tableStartY + 16);
  
  let colX = margin + col1Width + col2Width;
  doc.text('Jours', colX + (jourWidth * nombreJours / 2) - 10, tableStartY + 16);
  
  colX = margin + col1Width + col2Width + (jourWidth * nombreJours);
  doc.text('Détails', colX + 5, tableStartY + 16);
  
  y = tableStartY + 25;
  
  // Date sub-header
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'S');
  
  const dates = [];
  if (presenceData.periodeDebut) {
    const startDate = new Date(presenceData.periodeDebut);
    for (let i = 0; i < nombreJours; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  colX = margin + col1Width + col2Width;
  dates.forEach((date, idx) => {
    const x = colX + (idx * jourWidth) + (jourWidth / 2);
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
  doc.setFont(undefined, 'normal');
  const participants = presenceData.participants || [];
  participants.forEach((participant) => {
    const rowStartY = y;
    doc.rect(margin, y, pageWidth - 2 * margin, 25, 'S');
    
    const nomLines = doc.splitTextToSize(participant.nom || '', col1Width - 10);
    doc.text(nomLines, margin + 5, y + 15);
    
    const etabLines = doc.splitTextToSize(participant.etablissement || '', col2Width - 10);
    doc.text(etabLines, margin + col1Width + 5, y + 15);
    
    colX = margin + col1Width + col2Width;
    (participant.jours || []).forEach((jour, idx) => {
      const x = colX + (idx * jourWidth) + (jourWidth / 2);
      doc.text(jour || '', x, y + 15, { align: 'center' });
      if (idx > 0) {
        doc.line(colX + (idx * jourWidth), y, colX + (idx * jourWidth), y + 25);
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
  
  // Formateur row - GRAY background
  doc.setFillColor(220, 220, 220); // Gray
  doc.rect(margin, y, pageWidth - 2 * margin, 25, 'FD');
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('Formateur', margin + (col1Width + col2Width) / 2, y + 15, { align: 'center' });
  
  // Vertical lines for formateur row
  doc.line(margin + col1Width, y, margin + col1Width, y + 25);
  doc.line(margin + col1Width + col2Width, y, margin + col1Width + col2Width, y + 25);
  colX = margin + col1Width + col2Width;
  for (let i = 1; i < nombreJours; i++) {
    doc.line(colX + (i * jourWidth), y, colX + (i * jourWidth), y + 25);
  }
  doc.line(margin + col1Width + col2Width + (jourWidth * nombreJours), y, margin + col1Width + col2Width + (jourWidth * nombreJours), y + 25);
  
  y += 35;

  // Notes
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Black
  doc.text('Note :', margin, y);
  y += 15;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  const notes = presenceData.notes || '';
  const noteLines = doc.splitTextToSize(notes, pageWidth - 2 * margin);
  noteLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 10;
  });
  
  y += 15;

  // Signatures
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Black
  doc.text(`Date Le : ${presenceData.dateLe || ''}`, margin, y);
  
  y += 20;
  
  doc.text('Signature', margin, y);
  doc.text('Signature de Formateur', pageWidth - margin - 150, y);
  
  y += 40;
  doc.text('Signature ABBK PHYSICSWORKS', pageWidth / 2, y, { align: 'center' });

  // Footer - BLACK
  doc.setFillColor(blackRgb.r, blackRgb.g, blackRgb.b);
  doc.rect(10, pageHeight - 30, pageWidth - 20, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('© 2024 Sté ABBK PhysicsWorks. Tous les droits réservés.', pageWidth / 2, pageHeight - 17, { align: 'center' });

  return doc;
}