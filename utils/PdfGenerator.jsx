import jsPDF from 'jspdf';
import { ABBK_COLORS } from './theme';
import { generateInterventionNature } from './mockData';

// Convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const drawPageBorder = (doc, pageWidth, pageHeight) => {
  doc.setLineWidth(1.5);
  doc.setDrawColor(0, 0, 0);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 80);
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

  // Draw border on first page
  drawPageBorder(doc, pageWidth, pageHeight);

  // Title at the top - BLACK
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  y+=20;
  const docTitle = isFormation 
    ? "FICHE PROGRAMME D'UNE ACTION DE FORMATION"
    : "FICHE DE SUPPORT D'INTERVENTION DE LICENCE LOGICIELLE";
  doc.text(docTitle, pageWidth / 2, y, { align: 'center' });
  y += 25;

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
    doc.text('PHYSICSWORKS', logoX, logoY + 50);
    doc.setTextColor(0, 0, 0);
  }

  // Company details below logo - BLACK
  y = logoY + logoHeight + 15;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('ABBK PHYSICSWORKS', logoX, y);
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

  // Right side - Client information box - BLACK BORDER
  const rightBoxX = pageWidth - margin - 250;
  const rightBoxY = logoY;
  const boxWidth = 250;
  const boxHeight = 110;

  doc.setLineWidth(2);
  doc.setDrawColor(0, 0, 0);
  doc.rect(rightBoxX, rightBoxY, boxWidth, boxHeight);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
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
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // ===== FORMATION MODE: Multiple Formations =====
  if (isFormation && formData.selectedFormations && formData.selectedFormations.length > 0) {
    formData.selectedFormations.forEach((formationId, formationIndex) => {
      const formationData = formData.formationsData[formationId] || {};

      // Check if we need a new page before starting this formation
      if (y > pageHeight - 300) {
        doc.addPage();
        y = margin;
        drawPageBorder(doc, pageWidth, pageHeight);
      }

      // Formation Header - GRAY background with BLACK text
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F');
      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, y, pageWidth - 2 * margin, 25, 'S');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(formationData.formationName || 'Formation', margin + 5, y + 15);
      y += 40;

      // Formation Name and Reference
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`Nom de formation: ${formationData.formationName || ''}`, margin, y);
      y += 15;
      
      doc.text(`Référence: ${formationData.formation_id || ''}`, margin, y);
      y += 20;

      // Prerequisites, Objectives, Competencies Table
      if (y + 120 > pageHeight - margin) {
        doc.addPage();
        y = margin;
        drawPageBorder(doc, pageWidth, pageHeight);
      }
      
      const detailsTableY = y;
      const colWidth = (pageWidth - 2 * margin) / 3;
      
      doc.setLineWidth(1);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, detailsTableY, colWidth, 30, 'FD');
      doc.rect(margin + colWidth, detailsTableY, colWidth, 30, 'FD');
      doc.rect(margin + 2 * colWidth, detailsTableY, colWidth, 30, 'FD');
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('Prérequis', margin + 5, detailsTableY + 18);
      doc.text('Objectifs visés', margin + colWidth + 5, detailsTableY + 18);
      doc.text('Compétences acquises', margin + 2 * colWidth + 5, detailsTableY + 18);
      
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
      
      y += contentHeight + 30;

      // Schedule Table - with proper page break handling
      if (formationData.schedule && formationData.schedule.length > 0) {
        if (y + 100 > pageHeight - margin) {
          doc.addPage();
          y = margin;
          drawPageBorder(doc, pageWidth, pageHeight);
        }

        const tableStartY = y;
        const tableWidth = pageWidth - 2 * margin;
        const headerRowHeight = 25;
        const minRowHeight = 25;

        const colJour = margin;
        const colContenu = margin + 40;
        const colMethodes = margin + 200;
        const colIntervenant = margin + 300;
        const colTheorie = margin + 400;
        const colPratique = margin + 450;
        
        // Table header
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, tableStartY, tableWidth, headerRowHeight, 'F');
        doc.rect(margin, tableStartY, tableWidth, headerRowHeight, 'S');

        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Jours', colJour + 5, tableStartY + 16);
        doc.text('Contenu / Concepts', colContenu + 5, tableStartY + 16);
        doc.text('Méthodes', colMethodes + 5, tableStartY + 16);
        doc.text('Intervenant', colIntervenant + 5, tableStartY + 16);
        doc.text('Durée (H)', colTheorie + 5, tableStartY + 12);
        doc.text('Théorie', colTheorie + 5, tableStartY + 22);
        doc.text('Pratique', colPratique + 5, tableStartY + 22);

        // Draw header separators
        doc.line(colContenu, tableStartY, colContenu, tableStartY + headerRowHeight);
        doc.line(colMethodes, tableStartY, colMethodes, tableStartY + headerRowHeight);
        doc.line(colIntervenant, tableStartY, colIntervenant, tableStartY + headerRowHeight);
        doc.line(colTheorie, tableStartY, colTheorie, tableStartY + headerRowHeight);
        doc.line(colPratique, tableStartY, colPratique, tableStartY + headerRowHeight);

        y = tableStartY + headerRowHeight;

        // Draw data rows with page break handling
        doc.setFont(undefined, 'normal');
        
        formationData.schedule.forEach((day, dayIndex) => {
          const contentLines = doc.splitTextToSize(day.content || '', 170);
          const methodLines = doc.splitTextToSize(day.methods || '', 120);
          const intervenantLines = doc.splitTextToSize(day.intervenant || '', 110);
          
          const maxLines = Math.max(
            contentLines.length, 
            methodLines.length, 
            intervenantLines.length
          );
          const dynamicRowHeight = Math.max(minRowHeight, maxLines * 10 + 10);
          
          if (y + dynamicRowHeight > pageHeight - margin - 50) {
            doc.addPage();
            y = margin;
            drawPageBorder(doc, pageWidth, pageHeight);
            
            // Redraw table header on new page
            doc.setFillColor(220, 220, 220);
            doc.rect(margin, y, tableWidth, headerRowHeight, 'F');
            doc.rect(margin, y, tableWidth, headerRowHeight, 'S');
            
            doc.setFontSize(8);
            doc.setFont(undefined, 'bold');
            doc.text('Jours', colJour + 5, y + 16);
            doc.text('Contenu / Concepts', colContenu + 5, y + 16);
            doc.text('Méthodes', colMethodes + 5, y + 16);
            doc.text('Intervenant', colIntervenant + 5, y + 16);
            doc.text('Durée (H)', colTheorie + 5, y + 12);
            doc.text('Théorie', colTheorie + 5, y + 22);
            doc.text('Pratique', colPratique + 5, y + 22);
            
            doc.line(colContenu, y, colContenu, y + headerRowHeight);
            doc.line(colMethodes, y, colMethodes, y + headerRowHeight);
            doc.line(colIntervenant, y, colIntervenant, y + headerRowHeight);
            doc.line(colTheorie, y, colTheorie, y + headerRowHeight);
            doc.line(colPratique, y, colPratique, y + headerRowHeight);
            
            y += headerRowHeight;
          }
          
          // Draw the row
          doc.rect(margin, y, tableWidth, dynamicRowHeight, 'S');
          doc.line(colContenu, y, colContenu, y + dynamicRowHeight);
          doc.line(colMethodes, y, colMethodes, y + dynamicRowHeight);
          doc.line(colIntervenant, y, colIntervenant, y + dynamicRowHeight);
          doc.line(colTheorie, y, colTheorie, y + dynamicRowHeight);
          doc.line(colPratique, y, colPratique, y + dynamicRowHeight);

          doc.text(day.day || '', colJour + 5, y + 16);
          doc.text(contentLines, colContenu + 5, y + 12);
          doc.text(methodLines, colMethodes + 5, y + 12);
          doc.text(intervenantLines, colIntervenant + 5, y + 12);
          doc.text((day.theoryHours || '').toString(), colTheorie + 15, y + 16);
          doc.text((day.practiceHours || '').toString(), colPratique + 15, y + 16);

          y += dynamicRowHeight;
        });

        // Total hours - ensure we have space
        y+=20;
        if (y + 30 > pageHeight - margin - 50) {
          doc.addPage();
          y = margin;
          drawPageBorder(doc, pageWidth, pageHeight);
        }

        const totalTheory = formationData.schedule.reduce((sum, day) => 
          sum + (parseFloat(day.theoryHours) || 0), 0
        );
        const totalPractice = formationData.schedule.reduce((sum, day) => 
          sum + (parseFloat(day.practiceHours) || 0), 0
        );
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Théorie: ${totalTheory}h | Total Pratique: ${totalPractice}h | Total: ${totalTheory + totalPractice}h`, 
          margin, y);
        y += 30;
      }

      // Add separation between formations if there are more
      if (formationIndex < formData.selectedFormations.length - 1) {
        if (y + 30 > pageHeight - margin) {
          doc.addPage();
          y = margin;
          drawPageBorder(doc, pageWidth, pageHeight);
        } else {
          y += 10;
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, y, pageWidth - margin, y);
          doc.setDrawColor(0, 0, 0);
          y += 20;
        }
      }
    });

  } else if (isLicense) {
    // ===== LICENSE MODE =====
    
    // Always regenerate intervention nature for licenses
    const interventionNatureText = generateInterventionNature(formData.licenses, formData.clientName);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text("Nature de l'intervention: ", margin, y);
    
    doc.setFont(undefined, 'normal');
    const natWidth = doc.getTextWidth("Nature de l'intervention:     ");
    const natureLines = doc.splitTextToSize(interventionNatureText, pageWidth - margin * 2 - natWidth);
    doc.text(natureLines, margin + natWidth, y);
    y += Math.max(15, natureLines.length * 12) + 10;

    doc.setFont(undefined, 'bold');
    doc.text('Référence BC:    ', margin, y);
    doc.setFont(undefined, 'normal');
    y += 25;

    // License Table - GRAY header
    doc.setLineWidth(1);
    const tableStartY = y;
    const col1X = margin;
    const col2X = margin + 220;
    const col3X = margin + 280;
    const col4X = margin + 420;
    const tableWidth = pageWidth - 2 * margin;
    const rowHeight = 25;
    
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, tableStartY, tableWidth, rowHeight, 'F');
    doc.rect(margin, tableStartY, tableWidth, rowHeight, 'S');

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Licence(s) installée(s)', col1X + 5, tableStartY + 16);
    doc.text('Quantité', col2X +5, tableStartY + 16);
    doc.text('Numéro de série du logiciel', col3X +2, tableStartY + 16);
    doc.text('Numéro de facture', col4X + 5, tableStartY + 16);

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

  // ===== INTERVENANT TABLE - GRAY header =====
  const intervTableY = y;
  const intervCol1X = margin;
  const intervCol2X = margin + 200;
  const intervCol3X = margin + 350;
  const tableWidth = pageWidth - 2 * margin;
  const rowHeight = 25;
  
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, intervTableY, tableWidth, rowHeight, 'F');
  doc.rect(margin, intervTableY, tableWidth, rowHeight, 'S');

  doc.setFont(undefined, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Intervenant(s)', intervCol1X + 5, intervTableY + 16);
  doc.text("Date d'intervention", intervCol2X + 5, intervTableY + 16);
  doc.text("Réference d'intervention", intervCol3X + 5, intervTableY + 16);

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

  // ===== OBSERVATIONS - Only for License mode =====
  if (isLicense) {
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Observations: ', margin, y);
    doc.setFont(undefined, 'normal');
    const obsText = formData.observations || '';
    const obsLines = doc.splitTextToSize(obsText, pageWidth - margin * 2 - 100);
    doc.text(obsLines, margin + doc.getTextWidth('Observations:     '), y);
    y += Math.max(20, obsLines.length * 12) + 15;
  }

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
  doc.setTextColor(0, 0, 0);
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

  // ===== FOOTER - BLACK =====
  const footerY = pageHeight - 50;
  doc.setFillColor(blackRgb.r, blackRgb.g, blackRgb.b);
  doc.rect(10, footerY, pageWidth - 20, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('© 2026 ABBK PHYSICSWORKS.', pageWidth / 2, footerY + 22, { 
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