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

export function generatePlanPDF(formData, fileName) {
  const doc = createPlanPDF(formData);
  doc.save(fileName);
}

export function getPlanPDFBlob(formData) {
  const doc = createPlanPDF(formData);
  return doc.output('blob');
}

function createPlanPDF(formData) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 20;

// ABBK Colors
  const redRgb = hexToRgb(ABBK_COLORS.red);
  const darkRedRgb = hexToRgb(ABBK_COLORS.darkred);
  const blackRgb = hexToRgb(ABBK_COLORS.black);
  const grayRgb = hexToRgb(ABBK_COLORS.gray);

  // Draw border around the page - NOW BLACK
  doc.setLineWidth(1.5);
  doc.setDrawColor(0, 0, 0); // Black border
  doc.rect(10, 10, pageWidth - 20, pageHeight - 80);
y += 20;
  // Title - BLACK
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('FICHE PLAN', pageWidth / 2, y, { align: 'center' });
  y += 15;
  doc.text('DE FORMATION', pageWidth / 2, y, { align: 'center' });
  y += 30;
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
    doc.setFont(undefined, 'bold');
    doc.setTextColor(redRgb.r, redRgb.g, redRgb.b); // Logo text stays red
    doc.text('ABBK', logoX, logoY + 30);
    doc.setFontSize(12);
    doc.text('PhysicsWorks', logoX, logoY + 50);
    doc.setTextColor(0, 0, 0);
  }

  // Company details below logo - BLACK
  y = logoY + logoHeight + 15;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('ABBK PhysicsWorks', logoX, y);
  y += 12;
  
  doc.setFont(undefined, 'normal');
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
  doc.setFont(undefined, 'normal');
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
y+=20;
  // Horizontal line after header - BLACK
  
  doc.setLineWidth(2);
  doc.setDrawColor(0, 0, 0); // Black line
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

// Formation table
const planData = formData.planData || { formations: [] };
const formations = planData.formations || [];

if (formations.length > 0) {
  const tableStartY = y;
  
  // Calculate widths - Details column gets remaining space
  const dataColsWidth = 120 + 100 + 50 + 50 + 80 + 70 + 70 + 60; // sum of first 8 columns
  const detailsWidth = (pageWidth - 2 * margin) - dataColsWidth;
  
  const colWidths = {
    formation: 120,
    formateur: 100,
    jours: 50,
    duree: 50,
    lieu: 80,
    dateDebut: 70,
    dateFin: 70,
    heures: 60,
    details: detailsWidth
  };

  // Table header - Full width
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 25, 'F');
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 25, 'S');

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);

  // Draw header cells
  let colX = margin;
  const headers = [
    { text: 'Formation', width: colWidths.formation },
    { text: 'Formateur', width: colWidths.formateur },
    { text: 'Nb jours', width: colWidths.jours },
    { text: 'Durée', width: colWidths.duree },
    { text: 'Lieu', width: colWidths.lieu },
    { text: 'Date début', width: colWidths.dateDebut },
    { text: 'Date fin', width: colWidths.dateFin },
    { text: 'Heures', width: colWidths.heures },
    { text: 'Détails', width: colWidths.details }
  ];

  headers.forEach((header, idx) => {
    doc.text(header.text, colX + 5, tableStartY + 16);
    doc.line(colX, tableStartY, colX, tableStartY + 25);
    colX += header.width;
  });

  y = tableStartY + 25;

  // Calculate total height for rows
  const rowHeight = 30;
  const totalRowsHeight = formations.length * rowHeight;

  // Draw data rows (without details column)
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);

  formations.forEach((formation) => {
    colX = margin;
    const rowData = [
      { text: formation.formationName || '', width: colWidths.formation },
      { text: formation.formateur || '', width: colWidths.formateur },
      { text: formation.nombreJours || '', width: colWidths.jours },
      { text: formation.dureeFormation || '', width: colWidths.duree },
      { text: formation.lieuFormation || '', width: colWidths.lieu },
      { text: formation.dateDebut || '', width: colWidths.dateDebut },
      { text: formation.dateFin || '', width: colWidths.dateFin },
      { text: formation.heuresFormation || '9h - 17h', width: colWidths.heures }
    ];

    // Draw each cell
    rowData.forEach(cell => {
      doc.rect(colX, y, cell.width, rowHeight, 'S');
      const lines = doc.splitTextToSize(cell.text, cell.width - 10);
      doc.text(lines, colX + 5, y + 15);
      colX += cell.width;
    });

    y += rowHeight;
  });

  // Draw single merged "Détails" column spanning all rows
  const detailsX = margin + dataColsWidth;
  doc.rect(detailsX, tableStartY + 25, colWidths.details, totalRowsHeight, 'S');
  
  // Collect all details from formations into one paragraph
// Get details from planData (single details field)
const detailsText = planData.details || '';
const wrappedDetails = doc.splitTextToSize(detailsText, colWidths.details - 10);
doc.text(wrappedDetails, detailsX + 5, tableStartY + 40);

  y = tableStartY + 25 + totalRowsHeight + 20;
}


  y += 20;

  // Notes section
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('Note :', margin, y);
  y += 15;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  
  const notes = planData.notes || '';
  const noteLines = doc.splitTextToSize(notes, pageWidth - 2 * margin);
  noteLines.forEach(line => {
    doc.text(line, margin, y);
    y += 12;
  });

  y += 10;

  // Contact note
  if (planData.contactNote) {
    doc.text(planData.contactNote, margin, y);
    y += 20;
  }

  // Date and signatures
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text(`Date Le : ${planData.dateSignature || new Date().toLocaleDateString('fr-FR')}`, margin, y);
  
  y += 30;
  
  doc.text('Signature', margin, y);
  doc.text('Signature ABBK PHYSICSWORKS', pageWidth - margin - 150, y);

  // Footer - BLACK
  doc.setFillColor(blackRgb.r, blackRgb.g, blackRgb.b);
  doc.rect(10, pageHeight - 30, pageWidth - 20, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('© 2026 Sté ABBK PHYSICSWORKS.', pageWidth / 2, pageHeight - 17, { align: 'center' });

  return doc;
}