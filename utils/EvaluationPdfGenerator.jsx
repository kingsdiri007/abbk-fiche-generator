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

  export function generateEvaluationPDF(formData, fileName) {
    const doc = createEvaluationPDF(formData);
    doc.save(fileName);
  }

  export function getEvaluationPDFBlob(formData) {
    const doc = createEvaluationPDF(formData);
    return doc.output('blob');
  }

  function createEvaluationPDF(formData) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = 20;

    const evaluationData = formData.evaluationData || {};
    const evaluations = evaluationData.evaluations || [];

  
    // ABBK Colors
    const redRgb = hexToRgb(ABBK_COLORS.red);
    const darkRedRgb = hexToRgb(ABBK_COLORS.darkred);
    const blackRgb = hexToRgb(ABBK_COLORS.black);
    const grayRgb = hexToRgb(ABBK_COLORS.gray);

    // Title - BLACK
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0); // Black
    doc.text("FICHE D'ÉVALUATION", pageWidth / 2, y, { align: 'center' });
    y += 18;
    doc.text('DES PARTICIPANTS', pageWidth / 2, y, { align: 'center' });
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



    // Horizontal line after header - BLACK
    y += 10;
    doc.setLineWidth(2);
    doc.setDrawColor(0, 0, 0); // Black line
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;


    // Formation details - BLACK borders
    doc.setLineWidth(1);
    const detailsHeight = 50;
    doc.setDrawColor(0, 0, 0); // Black border
    doc.rect(margin, y, pageWidth - 2 * margin, detailsHeight);
    
    const detailsY = y;
    const colWidth = (pageWidth - 2 * margin) / 2;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0); // Black
    
    // Row 1
    let rowY = detailsY + 15;
    doc.text(`Thème de formation : `, margin + 5, rowY);
    doc.setFont(undefined, 'normal');
    doc.text(`${evaluationData.themeFormation || ''}`, margin + 95, rowY);
    
    doc.setFont(undefined, 'bold');
    doc.text(`Période de formation : `, margin + colWidth + 5, rowY);
    doc.setFont(undefined, 'normal');
    doc.text(`${evaluationData.periodeDebut || ''} à ${evaluationData.periodeFin || ''}`, margin + colWidth + 105, rowY);
    
    // Row 2
    rowY += 20;
    doc.setFont(undefined, 'bold');
    doc.text(`Durée de la formation : `, margin + 5, rowY);
    doc.setFont(undefined, 'normal');
    doc.text(`${evaluationData.dureeFormation || ''}`, margin + 105, rowY);
    
    doc.setFont(undefined, 'bold');
    doc.text(`Formateur : `, margin + colWidth + 5, rowY);
    doc.setFont(undefined, 'normal');
    doc.text(`${evaluationData.formateur || ''}`, margin + colWidth + 60, rowY);
    
    // Grid lines
    doc.line(margin + colWidth, detailsY, margin + colWidth, detailsY + detailsHeight);
    doc.line(margin, detailsY + 25, pageWidth - margin, detailsY + 25);
    
    y = detailsY + detailsHeight + 20;

    // Evaluation Table
    const tableStartY = y;
    const firstColWidth = 180;
    const participantColWidth = (pageWidth - 2 * margin - firstColWidth) / evaluations.length;
    
    // Table header - GRAY background
    doc.setFillColor(220, 220, 220); // Gray
    doc.rect(margin, tableStartY, pageWidth - 2 * margin, 20, 'F');
    doc.rect(margin, tableStartY, pageWidth - 2 * margin, 20, 'S');
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0); // Black text
    
    // First column empty
    doc.rect(margin, tableStartY, firstColWidth, 20, 'S');
    
    // Participants header
    let colX = margin + firstColWidth;
    doc.text('Liste des participants', colX + ((participantColWidth * evaluations.length) / 2) - 40, tableStartY + 13);
    
    y = tableStartY + 20;
    
    // Participant names row
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, pageWidth - 2 * margin, 20, 'FD');
    
    doc.setTextColor(0, 0, 0);
    colX = margin + firstColWidth;
    evaluations.forEach((evaluation, idx) => {
      const participantName = evaluation.participantName || `Participant ${idx + 1}`;
      const nameLines = doc.splitTextToSize(participantName, participantColWidth - 10);
      doc.text(nameLines, colX + (participantColWidth / 2), y + 13, { align: 'center' });
      
      if (idx > 0) {
        doc.line(colX, tableStartY, colX, y + 20);
      }
      colX += participantColWidth;
    });
    
    doc.line(margin + firstColWidth, tableStartY, margin + firstColWidth, y + 20);
    doc.line(pageWidth - margin, tableStartY, pageWidth - margin, y + 20);
    
    y += 20;

    // Evaluation criteria sections
    const sections = [
      {
        title: 'Informations sur le Niveau',
        items: [
          { field: 'niveauInitial', label: 'Niveau Initial' },
          { field: 'connaissancesTheoriques', label: 'Connaissances théoriques' },
          { field: 'competencesPratiques', label: 'Compétences pratiques' }
        ]
      },
      {
        title: 'Participation et engagement',
        items: [
          { field: 'niveauParticipation', label: 'Niveau de participation active' },
          { field: 'contributionDiscussions', label: 'Contribution aux discussions' }
        ]
      },
      {
        title: 'Compréhension du contenu',
        items: [
          { field: 'bonneComprehension', label: 'A démontré une bonne compréhension' },
          { field: 'capaciteAppliquer', label: 'Capacité à appliquer les connaissances' },
          { field: 'niveauCompetences', label: 'Niveau des compétences techniques acquises pendant la formation' },
          { field: 'attitudeGenerale', label: 'Attitude générale pendant la formation' },
          { field: 'participantPonctuel', label: 'Le participant a-t-il été ponctuel et assidu' },
          { field: 'amelioration', label: 'A montré une amélioration significative pendant la formation' }
        ]
      }
    ];

    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);

    sections.forEach(section => {
      // Section header - GRAY background
      doc.setFillColor(200, 200, 200); // Darker gray for section headers
      doc.rect(margin, y, pageWidth - 2 * margin, 18, 'FD');
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0); // Black text
      doc.text(section.title, margin + 5, y + 12);
      
      doc.line(margin + firstColWidth, y, margin + firstColWidth, y + 18);
      
      y += 18;

      // Section items
      doc.setFont(undefined, 'normal');
      section.items.forEach(item => {
        const rowHeight = 18;
        doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'S');
        
        // Criteria label
        const labelLines = doc.splitTextToSize(item.label, firstColWidth - 10);
        doc.text(labelLines, margin + 5, y + 11);
        
        // Participant values
        colX = margin + firstColWidth;
        evaluations.forEach((evaluation, idx) => {
          const value = evaluation[item.field] || '';
          doc.text(value, colX + (participantColWidth / 2), y + 11, { align: 'center' });
          
          if (idx === 0) {
            doc.line(colX, y, colX, y + rowHeight);
          }
          doc.line(colX + participantColWidth, y, colX + participantColWidth, y + rowHeight);
          colX += participantColWidth;
        });
        
        y += rowHeight;
      });
    });

    // Note Général row with Green background
    doc.setFillColor(34, 197, 94); // Green
    doc.rect(margin, y, pageWidth - 2 * margin, 20, 'FD');
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255); // White text on green
    doc.text('Note Général', margin + 5, y + 13);
    
    colX = margin + firstColWidth;
    const noteGeneral = evaluationData.noteGeneral || [];
    evaluations.forEach((evaluation, idx) => {
      const note = noteGeneral[idx] || '0';
      doc.text(note, colX + (participantColWidth / 2), y + 13, { align: 'center' });
      
      if (idx === 0) {
        doc.line(colX, y, colX, y + 20);
      }
      doc.line(colX + participantColWidth, y, colX + participantColWidth, y + 20);
      colX += participantColWidth;
    });
    doc.setTextColor(0, 0, 0);
    
    y += 30;

    // Notes section
    if (y > pageHeight - 150) {
      doc.addPage();
      y = margin;
    }
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black
    doc.text('Note :', margin, y);
    y += 15;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    const notes = evaluationData.notes || '';
    const noteLines = doc.splitTextToSize(notes, pageWidth - 2 * margin);
    noteLines.forEach((line) => {
      doc.text(line, margin, y);
      y += 10;
    });
    
    y += 15;

    // Signatures
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0); // Black
    doc.text(`Date Le : ${evaluationData.dateLe || ''}`, margin, y);
    
    y += 20;
    
    doc.text('Signature de Formateur', margin, y);
    doc.text('Signature ABBK PHYSICSWORKS', pageWidth - margin - 180, y);

    // Footer - BLACK
    doc.setFillColor(blackRgb.r, blackRgb.g, blackRgb.b);
    doc.rect(10, pageHeight - 30, pageWidth - 20, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('© 2026 Sté ABBK PHYSICSWORKS.', pageWidth / 2, pageHeight - 17, { align: 'center' });

    return doc;
  }