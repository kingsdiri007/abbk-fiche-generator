import jsPDF from 'jspdf';
import { ABBK_COLORS } from './theme';

// Convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export function generatePDF(formData) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = 20;

  const isFormation = formData.interventionType === 'formation';
  const isLicense = formData.interventionType === 'license';

  // ABBK Colors
  const redRgb = hexToRgb(ABBK_COLORS.red);
  const darkRedRgb = hexToRgb(ABBK_COLORS.darkred);
  const blackRgb = hexToRgb(ABBK_COLORS.black);
  const grayRgb = hexToRgb(ABBK_COLORS.gray);

  // Title at the top with ABBK Red
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(redRgb.r, redRgb.g, redRgb.b);
  const docTitle = isFormation 
    ? "FICHE PROGRAMME D'UNE ACTION DE FORMATION"
    : "FICHE D'INSTALLATION";
  doc.text(docTitle, pageWidth / 2, y, { align: 'center' });
  doc.setTextColor(0, 0, 0); // Reset to black
  y += 25;

  // Draw border around the page with ABBK Red
  doc.setLineWidth(1.5);
  doc.setDrawColor(redRgb.r, redRgb.g, redRgb.b);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 80);
  doc.setDrawColor(0, 0, 0); // Reset to black

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
    doc.setTextColor(redRgb.r, redRgb.g, redRgb.b);
    doc.text('ABBK', logoX, logoY + 30);
    doc.setFontSize(12);
    doc.text('PhysicsWorks', logoX, logoY + 50);
    doc.setTextColor(0, 0, 0);
  }

  // Company details below logo
  y = logoY + logoHeight + 15;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b);
  doc.text('ABBK PhysicsWorks', logoX, y);
  y += 12;
  
  doc.setFont(undefined, 'normal');
  doc.setTextColor(grayRgb.r, grayRgb.g, grayRgb.b);
  doc.text('Adresse: Cyberparc Régional, 3200, Tataouine, Tunisie.', logoX, y);
  y += 12;
  doc.text('Branche: 4ème Étage Pépinière de Technopôle El', logoX, y);
  y += 12;
  doc.text('Ghazela, 2083 Rue Ibn Hamdoun, Tunisie.', logoX, y);
  y += 10;
  doc.setTextColor(0, 0, 0);

  // Right side - Client information box with ABBK Red border
  const rightBoxX = pageWidth - margin - 250;
  const rightBoxY = logoY;
  const boxWidth = 250;
  const boxHeight = 110;

  doc.setLineWidth(2);
  doc.setDrawColor(redRgb.r, redRgb.g, redRgb.b);
  doc.rect(rightBoxX, rightBoxY, boxWidth, boxHeight);
  doc.setDrawColor(0, 0, 0);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  let boxY = rightBoxY + 20;
  
  doc.text(`Client: ${formData.clientName || ''}`, rightBoxX + 10, boxY);
  boxY += 20;
  
  const addressText = formData.address || '';
  const addressLines = doc.splitTextToSize(`Adresse: ${addressText}`, boxWidth - 20);
  addressLines.forEach((line, index) => {
    doc.text(line, rightBoxX + 10, boxY + (index * 12));
  });
  boxY += (addressLines.length * 12) + 8;
  
  doc.text(`Téléphone: ${formData.phone || ''}`, rightBoxX + 10, boxY);
  boxY += 20;
  doc.text(`ID: ${formData.id || ''}`, rightBoxX + 10, boxY);

  // Horizontal line after header with ABBK Red
  y += 10;
  doc.setLineWidth(2);
  doc.setDrawColor(redRgb.r, redRgb.g, redRgb.b);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setDrawColor(0, 0, 0);
  y += 20;

  // ===== FORMATION MODE: Multiple Formations =====
  if (isFormation && formData.selectedFormations && formData.selectedFormations.length > 0) {
    formData.selectedFormations.forEach((formationId, formationIndex) => {
      const formationData = formData.formationsData[formationId] || {};

      if (y > pageHeight - 200) {
        doc.addPage();
        y = margin;
      }

      // Formation Header with ABBK Red background
      doc.setFillColor(redRgb.r, redRgb.g, redRgb.b);
      doc.rect(margin, y, pageWidth - 2 * margin, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(formationData.formationName || 'Formation', margin + 10, y + 20);
      doc.setTextColor(0, 0, 0);
      y += 40;

      // Formation Name and Reference
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b);
      doc.text(`Nom de formation: ${formationData.formationName || ''}`, margin, y);
      y += 15;
      
      doc.text(`Référence: ${formationData.formationRef || ''}`, margin, y);
      y += 20;
      doc.setTextColor(0, 0, 0);

      // Prerequisites, Objectives, Competencies Table
      const detailsTableY = y;
      const colWidth = (pageWidth - 2 * margin) / 3;
      
      doc.setLineWidth(1);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, detailsTableY, colWidth, 30, 'FD');
      doc.rect(margin + colWidth, detailsTableY, colWidth, 30, 'FD');
      doc.rect(margin + 2 * colWidth, detailsTableY, colWidth, 30, 'FD');
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(redRgb.r, redRgb.g, redRgb.b);
      doc.text('Prérequis', margin + 5, detailsTableY + 18);
      doc.text('Objectifs visés', margin + colWidth + 5, detailsTableY + 18);
      doc.text('Compétences acquises', margin + 2 * colWidth + 5, detailsTableY + 18);
      doc.setTextColor(0, 0, 0);
      
      y = detailsTableY + 30;
      
      // Content rows
      const contentHeight = 60;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      
      const prereqLines = doc.splitTextToSize(formationData.prerequisites || '', colWidth - 10);
      doc.text(prereqLines.slice(0, 6), margin + 5, y + 10);
      
      const objLines = doc.splitTextToSize(formationData.objectives || '', colWidth - 10);
      doc.text(objLines.slice(0, 6), margin + colWidth + 5, y + 10);
      
      const compLines = doc.splitTextToSize(formationData.competencies || '', colWidth - 10);
      doc.text(compLines.slice(0, 6), margin + 2 * colWidth + 5, y + 10);
      
      doc.rect(margin, y, colWidth, contentHeight);
      doc.rect(margin + colWidth, y, colWidth, contentHeight);
      doc.rect(margin + 2 * colWidth, y, colWidth, contentHeight);
      
      y += contentHeight + 15;

      // Schedule Table
      if (formationData.schedule && formationData.schedule.length > 0) {
        const tableStartY = y;
        const tableWidth = pageWidth - 2 * margin;
        const rowHeight = 25;

        const colJour = margin;
        const colContenu = margin + 50;
        const colMethodes = margin + 250;
        const colTheorie = margin + 400;
        const colPratique = margin + 480;
        
        // Table header with ABBK Red background
        doc.setFillColor(redRgb.r, redRgb.g, redRgb.b);
        doc.rect(margin, tableStartY, tableWidth, rowHeight, 'F');
        doc.rect(margin, tableStartY, tableWidth, rowHeight, 'S');

        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Jours', colJour + 5, tableStartY + 16);
        doc.text('Contenu / Concepts', colContenu + 5, tableStartY + 16);
        doc.text('Méthodes', colMethodes + 5, tableStartY + 16);
        doc.text('Durée (H)', colTheorie + 5, tableStartY + 12);
        doc.text('Théorie', colTheorie + 5, tableStartY + 22);
        doc.text('Pratique', colPratique + 5, tableStartY + 22);
        doc.setTextColor(0, 0, 0);

        doc.line(colContenu, tableStartY, colContenu, tableStartY + rowHeight);
        doc.line(colMethodes, tableStartY, colMethodes, tableStartY + rowHeight);
        doc.line(colTheorie, tableStartY, colTheorie, tableStartY + rowHeight);
        doc.line(colPratique, tableStartY, colPratique, tableStartY + rowHeight);

        y = tableStartY + rowHeight;

        doc.setFont(undefined, 'normal');
        formationData.schedule.forEach((day) => {
          const contentLines = doc.splitTextToSize(day.content || '', 190);
          const methodLines = doc.splitTextToSize(day.methods || '', 140);
          const dynamicRowHeight = Math.max(
            rowHeight,
            Math.max(contentLines.length, methodLines.length) * 10 + 10
          );
          
          if (y + dynamicRowHeight > pageHeight - 100) {
            doc.addPage();
            y = margin;
          }
          
          doc.rect(margin, y, tableWidth, dynamicRowHeight, 'S');
          doc.line(colContenu, y, colContenu, y + dynamicRowHeight);
          doc.line(colMethodes, y, colMethodes, y + dynamicRowHeight);
          doc.line(colTheorie, y, colTheorie, y + dynamicRowHeight);
          doc.line(colPratique, y, colPratique, y + dynamicRowHeight);

          doc.text(day.day || '', colJour + 5, y + 16);
          doc.text(contentLines.slice(0, 5), colContenu + 5, y + 12);
          doc.text(methodLines.slice(0, 5), colMethodes + 5, y + 12);
          doc.text((day.theoryHours || '').toString(), colTheorie + 15, y + 16);
          doc.text((day.practiceHours || '').toString(), colPratique + 15, y + 16);

          y += dynamicRowHeight;
        });

        y += 10;

        // Total hours with ABBK Red
        const totalTheory = formationData.schedule.reduce((sum, day) => 
          sum + (parseFloat(day.theoryHours) || 0), 0
        );
        const totalPractice = formationData.schedule.reduce((sum, day) => 
          sum + (parseFloat(day.practiceHours) || 0), 0
        );
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(redRgb.r, redRgb.g, redRgb.b);
        doc.text(`Total Théorie: ${totalTheory}h | Total Pratique: ${totalPractice}h | Total: ${totalTheory + totalPractice}h`, 
          margin, y);
        doc.setTextColor(0, 0, 0);
        y += 25;
      }

      if (formationIndex < formData.selectedFormations.length - 1) {
        y += 10;
        doc.setDrawColor(grayRgb.r, grayRgb.g, grayRgb.b);
        doc.line(margin, y, pageWidth - margin, y);
        doc.setDrawColor(0, 0, 0);
        y += 20;
      }
    });

  } else if (isLicense) {
    // ===== LICENSE MODE =====
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b);
    doc.text("Nature de l'intervention: ", margin, y);
    
    doc.setFont(undefined, 'normal');
    const natureText = formData.interventionNature || '';
    const natWidth = doc.getTextWidth("Nature de l'intervention: ");
    const natureLines = doc.splitTextToSize(natureText, pageWidth - margin * 2 - natWidth);
    doc.text(natureLines, margin + natWidth, y);
    y += Math.max(15, natureLines.length * 12) + 10;

    doc.setFont(undefined, 'bold');
    doc.text('Référence BC: ', margin, y);
    doc.setFont(undefined, 'normal');
    doc.text(formData.referenceBC || '', margin + doc.getTextWidth('Référence BC:   '), y);
    y += 25;
    doc.setTextColor(0, 0, 0);

    // License Table with ABBK Red header
    doc.setLineWidth(1);
    const tableStartY = y;
    const col1X = margin;
    const col2X = margin + 220;
    const col3X = margin + 300;
    const col4X = margin + 420;
    const tableWidth = pageWidth - 2 * margin;
    const rowHeight = 25;
    
    doc.setFillColor(redRgb.r, redRgb.g, redRgb.b);
    doc.rect(margin, tableStartY, tableWidth, rowHeight, 'F');
    doc.rect(margin, tableStartY, tableWidth, rowHeight, 'S');

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Licence(s) installée(s)', col1X + 5, tableStartY + 16);
    doc.text('Quantité', col2X + 5, tableStartY + 16);
    doc.text('Numéro de série du logiciel', col3X + 5, tableStartY + 16);
    doc.text('Numéro de facture', col4X + 5, tableStartY + 16);
    doc.setTextColor(0, 0, 0);

    doc.line(col2X, tableStartY, col2X, tableStartY + rowHeight);
    doc.line(col3X, tableStartY, col3X, tableStartY + rowHeight);
    doc.line(col4X, tableStartY, col4X, tableStartY + rowHeight);

    y = tableStartY + rowHeight;

    doc.setFont(undefined, 'normal');
    if (formData.licenses && formData.licenses.length > 0) {
      formData.licenses.forEach((license) => {
        if (license.name) {
          const rowY = y;
          
          doc.rect(margin, rowY, tableWidth, rowHeight, 'S');
          doc.line(col2X, rowY, col2X, rowY + rowHeight);
          doc.line(col3X, rowY, col3X, rowY + rowHeight);
          doc.line(col4X, rowY, col4X, rowY + rowHeight);

          const licenseName = doc.splitTextToSize(license.name || '', 200);
          doc.text(licenseName, col1X + 5, rowY + 16);
          doc.text((license.quantity || '').toString(), col2X + 5, rowY + 16);
          doc.text(license.serial || '', col3X + 5, rowY + 16);
          doc.text(license.invoice || '', col4X + 5, rowY + 16);

          y += rowHeight;
        }
      });
    }

    y += 20;
  }

  // ===== INTERVENANT TABLE with ABBK Red header =====
  const intervTableY = y;
  const intervCol1X = margin;
  const intervCol2X = margin + 200;
  const intervCol3X = margin + 350;
  const tableWidth = pageWidth - 2 * margin;
  const rowHeight = 25;
  
  doc.setFillColor(redRgb.r, redRgb.g, redRgb.b);
  doc.rect(margin, intervTableY, tableWidth, rowHeight, 'F');
  doc.rect(margin, intervTableY, tableWidth, rowHeight, 'S');

  doc.setFont(undefined, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Intervenant(s)', intervCol1X + 5, intervTableY + 16);
  doc.text("Date d'intervention", intervCol2X + 5, intervTableY + 16);
  doc.text("Numéro d'intervention", intervCol3X + 5, intervTableY + 16);
  doc.setTextColor(0, 0, 0);

  doc.line(intervCol2X, intervTableY, intervCol2X, intervTableY + rowHeight);
  doc.line(intervCol3X, intervTableY, intervCol3X, intervTableY + rowHeight);

  y = intervTableY + rowHeight;

  doc.setFont(undefined, 'normal');
  doc.rect(margin, y, tableWidth, rowHeight, 'S');
  doc.line(intervCol2X, y, intervCol2X, y + rowHeight);
  doc.line(intervCol3X, y, intervCol3X, y + rowHeight);

  doc.text(formData.intervenant || '', intervCol1X + 5, y + 16);
  doc.text(formData.interventionDate || '', intervCol2X + 5, y + 16);
  doc.text(formData.referenceBC || '', intervCol3X + 5, y + 16);

  y += rowHeight + 20;

  // ===== OBSERVATIONS =====
  doc.setFont(undefined, 'bold');
  doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b);
  doc.text('Observations: ', margin, y);
  doc.setFont(undefined, 'normal');
  const obsText = formData.observations || '';
  const obsLines = doc.splitTextToSize(obsText, pageWidth - margin * 2 - 100);
  doc.text(obsLines, margin + doc.getTextWidth('Observations:     '), y);
  y += Math.max(20, obsLines.length * 12) + 15;
  doc.setTextColor(0, 0, 0);

  // ===== SIGNATURE SECTION =====
  const signatureY = pageHeight - 170;
  const signBoxHeight = 80;
  const leftBoxWidth = 150;
  const signBoxWidth = (pageWidth - 2 * margin - leftBoxWidth - 30) / 3;

  y = signatureY;

  const box0X = margin;
  doc.rect(box0X, y, leftBoxWidth, signBoxHeight);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(9);
  doc.text('Fait à : ', box0X + 5, y + 20);
  doc.setFont(undefined, 'normal');
  doc.text(formData.location || 'Ariana', box0X + 35, y + 20);
  
  doc.setFont(undefined, 'bold');
  doc.text('Date: ', box0X + 5, y + 40);
  doc.setFont(undefined, 'normal');
  doc.text(new Date().toLocaleDateString('fr-FR'), box0X + 35, y + 40);

  const box1X = box0X + leftBoxWidth + 10;
  doc.rect(box1X, y, signBoxWidth, signBoxHeight);
  doc.setFont(undefined, 'bold');
  doc.text('Remarques client:', box1X + 5, y + 12);

  const box2X = box1X + signBoxWidth + 10;
  doc.rect(box2X, y, signBoxWidth, signBoxHeight);
  doc.text('Signature client:', box2X + 5, y + 12);

  const box3X = box2X + signBoxWidth + 10;
  doc.rect(box3X, y, signBoxWidth, signBoxHeight);
  doc.text("Signature d'intervenant:", box3X + 5, y + 12);

  // ===== FOOTER with ABBK colors =====
  const footerY = pageHeight - 50;
  doc.setFillColor(blackRgb.r, blackRgb.g, blackRgb.b);
  doc.rect(10, footerY, pageWidth - 20, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('© 2024 Sté ABBK PhysicsWorks. Tous les droits réservés.', pageWidth / 2, footerY + 22, { 
    align: 'center' 
  });

  return doc;
}

export function downloadPDF(formData) {
  const doc = generatePDF(formData);
  const timestamp = new Date().toISOString().split('T')[0];
  const type = formData.interventionType === 'formation' ? 'Formation' : 'Installation';
  const fileName = `ABBK_${type}_${formData.clientName || 'Document'}_${timestamp}.pdf`;
  doc.save(fileName);
  return fileName;
}

export function getPDFBlob(formData) {
  const doc = generatePDF(formData);
  return doc.output('blob');
}