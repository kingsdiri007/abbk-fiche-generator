import jsPDF from 'jspdf';

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

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text("FICHE D'ÉVALUATION", pageWidth / 2, y, { align: 'center' });
  y += 18;
  doc.text('DES PARTICIPANTS', pageWidth / 2, y, { align: 'center' });
  y += 30;

  // Header with logo
  doc.setLineWidth(2);
  doc.rect(margin, y, pageWidth - 2 * margin, 60);
  
  doc.setFontSize(14);
  doc.text('ABBK PHYSICSWORKS', margin + 10, y + 35);
  
  y += 70;

  // Formation details
  doc.setLineWidth(1);
  const detailsHeight = 50;
  doc.rect(margin, y, pageWidth - 2 * margin, detailsHeight);
  
  const detailsY = y;
  const colWidth = (pageWidth - 2 * margin) / 2;
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  
  // Row 1
  let rowY = detailsY + 15;
  doc.text(`Thème de formation : ${evaluationData.themeFormation || ''}`, margin + 5, rowY);
  doc.text(`Période de formation : ${evaluationData.periodeDebut || ''} à ${evaluationData.periodeFin || ''}`, margin + colWidth + 5, rowY);
  
  // Row 2
  rowY += 20;
  doc.text(`Durée de la formation : ${evaluationData.dureeFormation || ''}`, margin + 5, rowY);
  doc.text(`Formateur : ${evaluationData.formateur || ''}`, margin + colWidth + 5, rowY);
  
  // Grid lines
  doc.line(margin + colWidth, detailsY, margin + colWidth, detailsY + detailsHeight);
  doc.line(margin, detailsY + 25, pageWidth - margin, detailsY + 25);
  
  y = detailsY + detailsHeight + 20;

  // Evaluation Table
  const tableStartY = y;
  const firstColWidth = 180;
  const participantColWidth = (pageWidth - 2 * margin - firstColWidth) / evaluations.length;
  
  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 20, 'F');
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 20, 'S');
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  
  // First column empty
  doc.rect(margin, tableStartY, firstColWidth, 20, 'S');
  
  // Participants header
  let colX = margin + firstColWidth;
  doc.text('Liste des participants', colX + ((participantColWidth * evaluations.length) / 2) - 40, tableStartY + 13);
  
  y = tableStartY + 20;
  
  // Participant names row
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'FD');
  
  colX = margin + firstColWidth;
  evaluations.forEach((evaluation, idx) => {
    const participantName = evaluation.participantName || `Participant ${idx + 1}`;
    const nameLines = doc.splitTextToSize(participantName, participantColWidth - 10);
    doc.text(nameLines, colX + (participantColWidth / 2), y + 13, { align: 'center' });
    
    // Vertical line
    if (idx > 0) {
      doc.line(colX, tableStartY, colX, y + 20);
    }
    colX += participantColWidth;
  });
  
  // Right border
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
    // Section header
    doc.setFillColor(200, 200, 200);
    doc.rect(margin, y, pageWidth - 2 * margin, 18, 'FD');
    doc.setFont(undefined, 'bold');
    doc.text(section.title, margin + 5, y + 12);
    
    // Vertical line
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
        
        // Vertical line
        if (idx === 0) {
          doc.line(colX, y, colX, y + rowHeight);
        }
        doc.line(colX + participantColWidth, y, colX + participantColWidth, y + rowHeight);
        colX += participantColWidth;
      });
      
      y += rowHeight;
    });
  });

  // Note Général row
  doc.setFillColor(200, 240, 200);
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'FD');
  doc.setFont(undefined, 'bold');
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
  
  y += 30;

  // Notes section
  if (y > pageHeight - 150) {
    doc.addPage();
    y = margin;
  }
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
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
  doc.text(`Date Le : ${evaluationData.dateLe || ''}`, margin, y);
  
  y += 20;
  
  const sigWidth = (pageWidth - 2 * margin - 40) / 2;
  doc.text('Signature de Formateur', margin, y);
  doc.text('Signature ABBK PHYSICSWORKS', pageWidth - margin - 180, y);

  // Footer
  doc.setFillColor(100, 100, 100);
  doc.rect(10, pageHeight - 30, pageWidth - 20, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('© 2024 Sté ABBK PhysicsWorks. Tous les droits réservés.', pageWidth / 2, pageHeight - 17, { align: 'center' });

  return doc;
}