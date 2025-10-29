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

  const redRgb = hexToRgb(ABBK_COLORS.red);
  const darkRedRgb = hexToRgb(ABBK_COLORS.darkred);
  const blackRgb = hexToRgb(ABBK_COLORS.black);

  // Title with ABBK Dark Red
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(darkRedRgb.r, darkRedRgb.g, darkRedRgb.b);
  doc.text("FICHE D'ÉVALUATION", pageWidth / 2, y, { align: 'center' });
  y += 18;
  doc.text('DES PARTICIPANTS', pageWidth / 2, y, { align: 'center' });
  y += 30;
  doc.setTextColor(0, 0, 0);

  // Header with logo and ABBK Red border
  doc.setLineWidth(2);
  doc.setDrawColor(darkRedRgb.r, darkRedRgb.g, darkRedRgb.b);
  doc.rect(margin, y, pageWidth - 2 * margin, 60);
  doc.setDrawColor(0, 0, 0);
  
  // Add logo
  try {
    const logoPath = '/logo-abbk.png';
    doc.addImage(logoPath, 'PNG', margin + 10, y + 10, 80, 40);
  } catch (error) {
    console.warn('Logo not found');
  }
  
  doc.setFontSize(14);
  doc.setTextColor(darkRedRgb.r, darkRedRgb.g, darkRedRgb.b);
  doc.text('ABBK PHYSICSWORKS', margin + 100, y + 35);
  doc.setTextColor(0, 0, 0);
  
  y += 70;

  // Formation details with ABBK Red borders
  doc.setLineWidth(1);
  const detailsHeight = 50;
  doc.setDrawColor(redRgb.r, redRgb.g, redRgb.b);
  doc.rect(margin, y, pageWidth - 2 * margin, detailsHeight);
  doc.setDrawColor(0, 0, 0);
  
  const detailsY = y;
  const colWidth = (pageWidth - 2 * margin) / 2;
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(redRgb.r, redRgb.g, redRgb.b);
  
  // Row 1
  let rowY = detailsY + 15;
  doc.text(`Thème de formation : `, margin + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${evaluationData.themeFormation || ''}`, margin + 95, rowY);
  
  doc.setFont(undefined, 'bold');
  doc.setTextColor(redRgb.r, redRgb.g, redRgb.b);
  doc.text(`Période de formation : `, margin + colWidth + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${evaluationData.periodeDebut || ''} à ${evaluationData.periodeFin || ''}`, margin + colWidth + 105, rowY);
  
  // Row 2
  rowY += 20;
  doc.setFont(undefined, 'bold');
  doc.setTextColor(redRgb.r, redRgb.g, redRgb.b);
  doc.text(`Durée de la formation : `, margin + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${evaluationData.dureeFormation || ''}`, margin + 105, rowY);
  
  doc.setFont(undefined, 'bold');
  doc.setTextColor(redRgb.r, redRgb.g, redRgb.b);
  doc.text(`Formateur : `, margin + colWidth + 5, rowY);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${evaluationData.formateur || ''}`, margin + colWidth + 60, rowY);
  
  // Grid lines
  doc.line(margin + colWidth, detailsY, margin + colWidth, detailsY + detailsHeight);
  doc.line(margin, detailsY + 25, pageWidth - margin, detailsY + 25);
  
  y = detailsY + detailsHeight + 20;

  // Evaluation Table
  const tableStartY = y;
  const firstColWidth = 180;
  const participantColWidth = (pageWidth - 2 * margin - firstColWidth) / evaluations.length;
  
  // Table header with ABBK Red
  doc.setFillColor(redRgb.r, redRgb.g, redRgb.b);
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 20, 'F');
  doc.rect(margin, tableStartY, pageWidth - 2 * margin, 20, 'S');
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  
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
    // Section header with ABBK Red
    doc.setFillColor(redRgb.r, redRgb.g, redRgb.b);
    doc.rect(margin, y, pageWidth - 2 * margin, 18, 'FD');
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(section.title, margin + 5, y + 12);
    doc.setTextColor(0, 0, 0);
    
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
  doc.setTextColor(255, 255, 255);
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
  doc.setTextColor(redRgb.r, redRgb.g, redRgb.b);
  doc.text('Note :', margin, y);
  y += 15;
  doc.setTextColor(0, 0, 0);
  
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
  doc.setTextColor(blackRgb.r, blackRgb.g, blackRgb.b);
  doc.text(`Date Le : ${evaluationData.dateLe || ''}`, margin, y);
  
  y += 20;
  
  doc.text('Signature de Formateur', margin, y);
  doc.text('Signature ABBK PHYSICSWORKS', pageWidth - margin - 180, y);
  doc.setTextColor(0, 0, 0);

  // Footer with ABBK Black
  doc.setFillColor(blackRgb.r, blackRgb.g, blackRgb.b);
  doc.rect(10, pageHeight - 30, pageWidth - 20, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('© 2024 Sté ABBK PhysicsWorks. Tous les droits réservés.', pageWidth / 2, pageHeight - 17, { align: 'center' });

  return doc;
}