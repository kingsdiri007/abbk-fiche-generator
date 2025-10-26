import jsPDF from 'jspdf';

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

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('FICHE PLAN', pageWidth / 2, y, { align: 'center' });
  y += 15;
  doc.text('DE FORMATION', pageWidth / 2, y, { align: 'center' });
  y += 30;

  // Header with logo placeholder
  doc.setLineWidth(2);
  doc.rect(margin, y, pageWidth - 2 * margin, 60);
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('ABBK PHYSICSWORKS', margin + 10, y + 35);
  
  y += 70;

  // Formation table
  const planData = formData.planData || { formations: [] };
  const formations = planData.formations || [];

  if (formations.length > 0) {
    const tableStartY = y;
    const colWidths = {
      formation: 120,
      formateur: 100,
      jours: 50,
      duree: 50,
      lieu: 80,
      dateDebut: 70,
      dateFin: 70,
      heures: 60,
      details: 100
    };

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, tableStartY, pageWidth - 2 * margin, 25, 'F');
    doc.rect(margin, tableStartY, pageWidth - 2 * margin, 25, 'S');

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    
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

    headers.forEach(header => {
      doc.text(header.text, colX + 5, tableStartY + 16);
      doc.line(colX, tableStartY, colX, tableStartY + 25);
      colX += header.width;
    });

    y = tableStartY + 25;

    // Table rows
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);

    formations.forEach((formation) => {
      const rowHeight = 30;
      
      doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'S');

      colX = margin;
      const rowData = [
        { text: formation.formationName || '', width: colWidths.formation },
        { text: formation.formateur || '', width: colWidths.formateur },
        { text: formation.nombreJours || '', width: colWidths.jours },
        { text: formation.dureeFormation || '', width: colWidths.duree },
        { text: formation.lieuFormation || '', width: colWidths.lieu },
        { text: formation.dateDebut || '', width: colWidths.dateDebut },
        { text: formation.dateFin || '', width: colWidths.dateFin },
        { text: formation.heuresFormation || '9h - 17h', width: colWidths.heures },
        { text: formation.details || '', width: colWidths.details }
      ];

      rowData.forEach(cell => {
        const lines = doc.splitTextToSize(cell.text, cell.width - 10);
        doc.text(lines, colX + 5, y + 15);
        doc.line(colX, y, colX, y + rowHeight);
        colX += cell.width;
      });

      y += rowHeight;
    });
  }

  y += 20;

  // Notes section
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Note :', margin, y);
  y += 15;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  
  const notes = planData.notes || [];
  notes.forEach((note) => {
    const lines = doc.splitTextToSize(`* ${note}`, pageWidth - 2 * margin);
    lines.forEach(line => {
      doc.text(line, margin, y);
      y += 12;
    });
  });

  y += 10;

  // Contact note
  if (planData.contactNote) {
    doc.text(planData.contactNote, margin, y);
    y += 20;
  }

  // Date and signatures
  doc.setFont(undefined, 'bold');
  doc.text(`Date Le : ${planData.dateSignature || new Date().toLocaleDateString('fr-FR')}`, margin, y);
  
  y += 30;
  
  const sigWidth = (pageWidth - 2 * margin) / 3;
  doc.text('Siganture', margin, y);
  doc.text('Signature ABBK PHYSICSWORKS', pageWidth - margin - 150, y);

  // Footer
  doc.setFillColor(100, 100, 100);
  doc.rect(10, pageHeight - 30, pageWidth - 20, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('© 2024 Sté ABBK PhysicsWorks. Tous les droits réservés.', pageWidth / 2, pageHeight - 17, { align: 'center' });

  return doc;
}