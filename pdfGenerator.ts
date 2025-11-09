import { Document, CompanyInfo, BusinessLetter } from './types';

declare var jspdf: any;

const addWrappedText = (
  doc: any,
  text: string,
  x: number,
  y: number,
  options: { maxWidth: number; align?: string }
) => {
  if (!text) return y;
  const lines = doc.splitTextToSize(text, options.maxWidth);
  doc.text(lines, x, y, { align: options.align || 'left' });
  return y + lines.length * 10;
};

const drawModernTemplate = (doc: any, document: Document, companyInfo: CompanyInfo) => {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let companyInfoY = 50;
  let headerLineY = 90;

  if (companyInfo.logo && companyInfo.logo.startsWith('data:image')) {
    try {
      const logoHeight = 40;
      const logoWidth = 40;
      doc.addImage(companyInfo.logo, '', pageW - margin - logoWidth, 40, logoWidth, logoHeight);
      companyInfoY = 90;
    } catch (e) {
      console.error('PDF Logo Error (Modern):', e);
    }
  }

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#1e293b');
  doc.setFontSize(16);
  doc.text(companyInfo.name, pageW - margin, companyInfoY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#64748b');
  doc.setFontSize(10);
  let addressY = addWrappedText(doc, companyInfo.address, pageW - margin, companyInfoY + 15, {
    maxWidth: 150,
    align: 'right',
  });
  if (companyInfo.abn) {
    doc.text(`ABN: ${companyInfo.abn}`, pageW - margin, addressY, { align: 'right' });
  }

  headerLineY = addressY + 10;

  doc.setDrawColor('#3b82f6');
  doc.setLineWidth(2);
  doc.line(margin, headerLineY, pageW - margin, headerLineY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#2563eb');
  doc.setFontSize(36);
  doc.text(document.type.toUpperCase(), margin, 60);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#64748b');
  doc.setFontSize(10);
  doc.text(document.doc_number, margin, 80);

  // Billing Info
  let currentY = headerLineY + 30;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#64748b');
  doc.setFontSize(10);
  doc.text('BILL TO', margin, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#1d4ed8');
  doc.setFontSize(14);
  doc.text(document.customer?.name || '', margin, currentY + 15);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#334155');
  doc.setFontSize(10);
  let customerY = addWrappedText(doc, document.customer?.address || '', margin, currentY + 28, {
    maxWidth: 200,
  });
  doc.text(document.customer?.email || '', margin, customerY);

  // Dates
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#64748b');
  doc.text('Issue Date:', pageW - margin - 120, currentY, { align: 'left' });
  doc.text('Due Date:', pageW - margin - 120, currentY + 15, { align: 'left' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#334155');
  doc.text(document.issue_date, pageW - margin, currentY, { align: 'right' });
  doc.text(document.due_date, pageW - margin, currentY + 15, { align: 'right' });
  currentY = Math.max(customerY, currentY + 15) + 30;

  // Table Header
  doc.setFillColor('#3b82f6');
  doc.rect(margin, currentY, pageW - margin * 2, 25, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#ffffff');
  doc.setFontSize(10);
  doc.text('DESCRIPTION', margin + 10, currentY + 16);
  doc.text('QTY', pageW - margin - 200, currentY + 16, { align: 'center' });
  doc.text('UNIT PRICE', pageW - margin - 120, currentY + 16, { align: 'right' });
  doc.text('TOTAL', pageW - margin - 10, currentY + 16, { align: 'right' });
  currentY += 35;

  // Table Body
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#1e293b');
  document.items.forEach((item) => {
    const itemYStart = currentY;
    const descriptionLines = doc.splitTextToSize(item.description, 250);
    doc.text(descriptionLines, margin + 10, itemYStart);
    const itemHeight = descriptionLines.length * 12;
    doc.text(String(item.quantity), pageW - margin - 200, itemYStart, { align: 'center' });
    doc.text(`$${item.price.toFixed(2)}`, pageW - margin - 120, itemYStart, { align: 'right' });
    doc.text(`$${(item.quantity * item.price).toFixed(2)}`, pageW - margin - 10, itemYStart, {
      align: 'right',
    });
    currentY += itemHeight + 8;
    doc.setDrawColor('#e2e8f0');
    doc.line(margin, currentY - 4, pageW - margin, currentY - 4);
  });

  // Totals
  currentY += 20;
  const totalsXLabel = pageW - margin - 80;
  const totalsXValue = pageW - margin;
  doc.setFontSize(11);
  doc.setTextColor('#334155');
  doc.text('Subtotal', totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${document.subtotal.toFixed(2)}`, totalsXValue, currentY, { align: 'right' });
  currentY += 18;
  doc.text(`Tax (${document.tax}%)`, totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${((document.subtotal * document.tax) / 100).toFixed(2)}`, totalsXValue, currentY, {
    align: 'right',
  });
  currentY += 18;
  doc.setDrawColor('#3b82f6');
  doc.setLineWidth(1.5);
  doc.line(pageW / 2 + 60, currentY, pageW - margin, currentY);
  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor('#2563eb');
  doc.text('Total', totalsXLabel, currentY + 12, { align: 'right' });
  doc.text(`$${document.total.toFixed(2)}`, totalsXValue, currentY + 12, { align: 'right' });

  // Notes
  if (document.notes) {
    currentY = doc.internal.pageSize.getHeight() - 80;
    doc.setDrawColor('#e2e8f0');
    doc.line(margin, currentY, pageW - margin, currentY);
    currentY += 20;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#334155');
    doc.setFontSize(10);
    doc.text('Notes', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#64748b');
    addWrappedText(doc, document.notes, margin, currentY + 12, { maxWidth: pageW - margin * 2 });
  }
};

const drawClassicTemplate = (doc: any, document: Document, companyInfo: CompanyInfo) => {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 50;
  let companyInfoY = 60;
  let lineY = 120;

  if (companyInfo.logo && companyInfo.logo.startsWith('data:image')) {
    try {
      const logoHeight = 40;
      const logoWidth = 40;
      doc.addImage(companyInfo.logo, '', pageW / 2 - logoWidth / 2, 40, logoWidth, logoHeight);
      companyInfoY = 90;
    } catch (e) {
      console.error('PDF Logo Error (Classic):', e);
    }
  }

  doc.setFont('serif', 'bold');
  doc.setFontSize(32);
  doc.text(companyInfo.name, pageW / 2, companyInfoY, { align: 'center' });
  doc.setFont('serif', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#374151');
  let addressY = addWrappedText(doc, companyInfo.address, pageW / 2, companyInfoY + 15, {
    maxWidth: 300,
    align: 'center',
  });
  if (companyInfo.abn)
    doc.text(`ABN: ${companyInfo.abn}`, pageW / 2, addressY, { align: 'center' });

  lineY = addressY + 20;
  doc.setDrawColor('#d1d5db');
  doc.line(margin, lineY, pageW - margin, lineY);

  let currentY = lineY + 20;
  doc.setFont('serif', 'bold');
  doc.setFontSize(20);
  doc.text(document.type, margin, currentY);
  doc.setFontSize(10);
  doc.setTextColor('#1f2937');
  doc.text(`Number: ${document.doc_number}`, margin, currentY + 15);
  doc.text(`Date: ${document.issue_date}`, margin, currentY + 28);
  doc.text(`Due: ${document.due_date}`, margin, currentY + 41);

  doc.setFont('serif', 'bold');
  doc.text('Billed To:', pageW - margin, currentY, { align: 'right' });
  doc.setFont('serif', 'normal');
  let customerY = currentY + 13;
  doc.text(document.customer?.name || '', pageW - margin, customerY, { align: 'right' });
  customerY += 13;
  customerY = addWrappedText(doc, document.customer?.address || '', pageW - margin, customerY, {
    maxWidth: 200,
    align: 'right',
  });
  doc.text(document.customer?.email || '', pageW - margin, customerY, { align: 'right' });

  currentY = Math.max(customerY, currentY + 41) + 40;
  const tableHeaders = ['Item Description', 'Quantity', 'Price', 'Amount'];
  const tableColWidths = [295, 70, 70, 70];
  const tableHeaderY = currentY;
  doc.setFont('serif', 'bold');
  doc.setFillColor('#f3f4f6');
  doc.rect(margin, tableHeaderY, pageW - margin * 2, 25, 'F');
  doc.setDrawColor('#d1d5db');
  doc.rect(margin, tableHeaderY, pageW - margin * 2, 25, 'S');
  let x = margin;
  tableHeaders.forEach((header, i) => {
    doc.line(x, tableHeaderY, x, tableHeaderY + 25);
    doc.text(header, x + 5, tableHeaderY + 16, { align: i > 0 ? 'right' : 'left' });
    x += tableColWidths[i];
  });
  doc.line(x, tableHeaderY, x, tableHeaderY + 25);
  currentY += 25;

  doc.setFont('serif', 'normal');
  doc.setFontSize(9);
  document.items.forEach((item) => {
    const itemY = currentY;
    let itemHeight = 25;
    doc.rect(margin, itemY, pageW - margin * 2, itemHeight, 'S');
    let x = margin;

    const descLines = doc.splitTextToSize(item.description, tableColWidths[0] - 10);
    itemHeight = Math.max(itemHeight, descLines.length * 10 + 10);
    doc.rect(margin, itemY, pageW - margin * 2, itemHeight, 'S');

    addWrappedText(doc, item.description, x + 5, itemY + 8, { maxWidth: tableColWidths[0] - 10 });
    x += tableColWidths[0];
    doc.text(String(item.quantity), x - 5, itemY + 16, { align: 'right' });
    x += tableColWidths[1];
    doc.text(`$${item.price.toFixed(2)}`, x - 5, itemY + 16, { align: 'right' });
    x += tableColWidths[2];
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, x - 5, itemY + 16, { align: 'right' });

    x = margin;
    tableColWidths.forEach((width, i) => {
      doc.line(x, itemY, x, itemY + itemHeight);
      x += width;
    });
    doc.line(x, itemY, x, itemY + itemHeight);

    currentY += itemHeight;
  });

  const totalsXLabel = pageW - margin - 140;
  const totalsXValue = pageW - margin - 5;
  currentY += 10;
  doc.setFontSize(10);
  doc.text('Subtotal:', totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${document.subtotal.toFixed(2)}`, totalsXValue, currentY, { align: 'right' });
  currentY += 15;
  doc.text(`Tax (${document.tax}%):`, totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${((document.subtotal * document.tax) / 100).toFixed(2)}`, totalsXValue, currentY, {
    align: 'right',
  });
  currentY += 15;
  doc.setDrawColor('#1f2937');
  doc.setLineWidth(1.5);
  doc.line(totalsXLabel - 20, currentY, pageW - margin, currentY);
  currentY += 3;
  doc.setFont('serif', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', totalsXLabel, currentY + 10, { align: 'right' });
  doc.text(`$${document.total.toFixed(2)}`, totalsXValue, currentY + 10, { align: 'right' });

  if (document.notes) {
    doc.setFont('serif', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#4b5563');
    addWrappedText(doc, document.notes, margin, doc.internal.pageSize.getHeight() - 60, {
      maxWidth: pageW - margin * 2,
    });
  }
};

const drawCreativeTemplate = (doc: any, document: Document, companyInfo: CompanyInfo) => {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFillColor('#111827');
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F');

  doc.setFillColor(217, 70, 239, 0.3);
  doc.circle(-20, -20, 80, 'F');
  doc.setFillColor(6, 182, 212, 0.3);
  doc.circle(pageW + 20, doc.internal.pageSize.getHeight() + 20, 80, 'F');

  let companyInfoY = 60;
  if (companyInfo.logo && companyInfo.logo.startsWith('data:image')) {
    try {
      const logoHeight = 30;
      const logoWidth = 30;
      doc.addImage(companyInfo.logo, '', margin, 45, logoWidth, logoHeight);
      companyInfoY = 85;
    } catch (e) {
      console.error('PDF Logo Error (Creative):', e);
    }
  }

  doc.setFont('courier', 'bold');
  doc.setTextColor('#ffffff');
  doc.setFontSize(24);
  doc.text(companyInfo.name, margin, companyInfoY);
  doc.setFontSize(10);
  doc.setTextColor('#9ca3af');
  doc.text(companyInfo.email, margin, companyInfoY + 15);

  doc.setFont('courier', 'bold');
  doc.setTextColor('#22d3ee');
  doc.setFontSize(40);
  doc.text(document.type.toUpperCase(), pageW - margin, 70, { align: 'right' });
  doc.setTextColor('#d946ef');
  doc.setFontSize(12);
  doc.text(document.doc_number, pageW - margin, 85, { align: 'right' });

  let currentY = 140;
  doc.setTextColor('#22d3ee');
  doc.setFontSize(10);
  doc.text('TO:', margin, currentY);
  doc.setTextColor('#ffffff');
  doc.setFontSize(12);
  doc.text(document.customer?.name || '', margin, currentY + 12);
  doc.setTextColor('#9ca3af');
  doc.setFontSize(10);
  addWrappedText(doc, document.customer?.address || '', margin, currentY + 24, { maxWidth: 250 });

  doc.setTextColor('#22d3ee');
  doc.text('Issue Date:', pageW - margin, currentY, { align: 'right' });
  doc.text('Due Date:', pageW - margin, currentY + 15, { align: 'right' });
  doc.setTextColor('#ffffff');
  doc.text(document.issue_date, pageW - margin - 70, currentY, { align: 'right' });
  doc.text(document.due_date, pageW - margin - 70, currentY + 15, { align: 'right' });

  currentY = 220;
  doc.setDrawColor('#22d3ee');
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 15;

  document.items.forEach((item) => {
    doc.setFont('courier', 'bold');
    doc.setTextColor('#ffffff');
    doc.setFontSize(14);
    const descLines = doc.splitTextToSize(item.description, 350);
    doc.text(descLines, margin, currentY);
    const itemY = currentY;
    const itemHeight = descLines.length * 12;

    doc.setFont('courier', 'normal');
    doc.setTextColor('#d946ef');
    doc.setFontSize(10);
    doc.text(`${item.quantity} x $${item.price.toFixed(2)}`, margin, currentY + itemHeight);

    doc.setFont('courier', 'bold');
    doc.setFontSize(16);
    doc.setTextColor('#ffffff');
    doc.text(
      `$${(item.quantity * item.price).toFixed(2)}`,
      pageW - margin,
      itemY + itemHeight / 2,
      { align: 'right' }
    );

    currentY += itemHeight + 20;
    doc.setDrawColor('#4b5563');
    doc.line(margin, currentY, pageW - margin, currentY);
    currentY += 15;
  });

  currentY += 10;
  const totalsXLabel = pageW - margin - 100;
  const totalsXValue = pageW - margin;
  doc.setFontSize(12);
  doc.setTextColor('#9ca3af');
  doc.text('Subtotal', totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${document.subtotal.toFixed(2)}`, totalsXValue, currentY, { align: 'right' });
  currentY += 20;
  doc.text(`Tax (${document.tax}%)`, totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${((document.subtotal * document.tax) / 100).toFixed(2)}`, totalsXValue, currentY, {
    align: 'right',
  });
  currentY += 20;
  doc.setDrawColor('#d946ef');
  doc.line(totalsXLabel - 50, currentY, pageW - margin, currentY);
  currentY += 10;
  doc.setFont('courier', 'bold');
  doc.setFontSize(22);
  doc.setTextColor('#22d3ee');
  doc.text('Total', totalsXLabel, currentY + 12, { align: 'right' });
  doc.text(`$${document.total.toFixed(2)}`, totalsXValue, currentY + 12, { align: 'right' });

  if (document.notes) {
    doc.setTextColor('#9ca3af');
    doc.setFontSize(10);
    addWrappedText(doc, `// ${document.notes}`, pageW / 2, doc.internal.pageSize.getHeight() - 60, {
      maxWidth: pageW - margin * 2,
      align: 'center',
    });
  }
};

const drawMinimalistTemplate = (doc: any, document: Document, companyInfo: CompanyInfo) => {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 50;

  let companyInfoY = 60;
  if (companyInfo.logo && companyInfo.logo.startsWith('data:image')) {
    try {
      const logoHeight = 25;
      const logoWidth = 25;
      doc.addImage(companyInfo.logo, '', margin, 50, logoWidth, logoHeight);
      companyInfoY = 85;
    } catch (e) {
      console.error('PDF Logo Error (Minimalist):', e);
    }
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#2d3748');
  doc.setFontSize(14);
  doc.text(companyInfo.name.toUpperCase(), margin, companyInfoY);

  doc.setFontSize(28);
  doc.setTextColor('#a0aec0');
  doc.text(document.type.toUpperCase(), pageW - margin, 60, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor('#4a5568');
  doc.text(document.doc_number, pageW - margin, 75, { align: 'right' });

  let currentY = 140;
  doc.setFontSize(8);
  doc.setTextColor('#718096');
  doc.text('BILLED TO', margin, currentY);
  doc.text('ISSUE DATE', margin + 180, currentY);
  doc.text('DUE DATE', margin + 300, currentY);

  currentY += 15;
  doc.setFontSize(10);
  doc.setTextColor('#2d3748');
  doc.setFont('helvetica', 'bold');
  doc.text(document.customer?.name || '', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(document.issue_date, margin + 180, currentY);
  doc.text(document.due_date, margin + 300, currentY);

  let customerAddressY = addWrappedText(
    doc,
    document.customer?.address || '',
    margin,
    currentY + 12,
    { maxWidth: 150 }
  );

  currentY = Math.max(customerAddressY, currentY + 12) + 40;

  doc.setDrawColor('#cbd5e0');
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 15;

  doc.setFontSize(8);
  doc.setTextColor('#718096');
  doc.text('DESCRIPTION', margin, currentY);
  doc.text('QTY', pageW - margin - 150, currentY, { align: 'center' });
  doc.text('UNIT PRICE', pageW - margin - 80, currentY, { align: 'right' });
  doc.text('TOTAL', pageW - margin, currentY, { align: 'right' });
  currentY += 10;
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 15;

  doc.setFontSize(10);
  doc.setTextColor('#2d3748');
  document.items.forEach((item) => {
    const itemYStart = currentY;
    const descriptionLines = doc.splitTextToSize(item.description, 280);
    doc.text(descriptionLines, margin, itemYStart);
    const itemHeight = descriptionLines.length * 10;
    doc.text(String(item.quantity), pageW - margin - 150, itemYStart, { align: 'center' });
    doc.text(`$${item.price.toFixed(2)}`, pageW - margin - 80, itemYStart, { align: 'right' });
    doc.text(`$${(item.quantity * item.price).toFixed(2)}`, pageW - margin, itemYStart, {
      align: 'right',
    });
    currentY += itemHeight + 15;
    doc.setDrawColor('#e2e8f0');
    doc.line(margin, currentY - 8, pageW - margin, currentY - 8);
  });

  const totalsXLabel = pageW - margin - 80;
  const totalsXValue = pageW - margin;
  currentY += 20;
  doc.setTextColor('#4a5568');
  doc.setFontSize(10);
  doc.text('Subtotal', totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${document.subtotal.toFixed(2)}`, totalsXValue, currentY, { align: 'right' });
  currentY += 18;
  doc.text(`Tax (${document.tax}%)`, totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${((document.subtotal * document.tax) / 100).toFixed(2)}`, totalsXValue, currentY, {
    align: 'right',
  });
  currentY += 18;
  doc.setDrawColor('#1a202c');
  doc.line(totalsXLabel - 50, currentY, pageW - margin, currentY);
  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor('#1a202c');
  doc.text('Total', totalsXLabel, currentY + 12, { align: 'right' });
  doc.text(`$${document.total.toFixed(2)}`, totalsXValue, currentY + 12, { align: 'right' });

  if (document.notes) {
    currentY = doc.internal.pageSize.getHeight() - 80;
    doc.setDrawColor('#e2e8f0');
    doc.line(margin, currentY, pageW - margin, currentY);
    currentY += 20;
    doc.setTextColor('#4a5568');
    doc.setFontSize(9);
    addWrappedText(doc, document.notes, margin, currentY, { maxWidth: pageW - margin * 2 });
  }
};

const drawBoldTemplate = (doc: any, document: Document, companyInfo: CompanyInfo) => {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFillColor('#111827');
  doc.rect(0, 0, pageW, 140, 'F');

  if (companyInfo.logo && companyInfo.logo.startsWith('data:image')) {
    try {
      const logoHeight = 40;
      const logoWidth = 40;
      doc.addImage(companyInfo.logo, '', margin, 40, logoWidth, logoHeight);
    } catch (e) {
      console.error('PDF Logo Error (Bold):', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#ffffff');
  doc.setFontSize(24);
  doc.text(companyInfo.name, margin, 100);

  doc.setFontSize(42);
  doc.text(document.type.toUpperCase(), pageW - margin, 80, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor('#d1d5db');
  doc.text(document.doc_number, pageW - margin, 100, { align: 'right' });

  let currentY = 180;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor('#6b7280');
  doc.text('BILL TO', margin, currentY);

  currentY += 15;
  doc.setFontSize(12);
  doc.setTextColor('#111827');
  doc.text(document.customer?.name || '', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#4b5563');
  let customerAddressY = addWrappedText(
    doc,
    document.customer?.address || '',
    margin,
    currentY + 15,
    { maxWidth: 200 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#6b7280');
  doc.text('Issue Date:', pageW - margin - 120, 180, { align: 'left' });
  doc.text('Due Date:', pageW - margin - 120, 195, { align: 'left' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#111827');
  doc.text(document.issue_date, pageW - margin, 180, { align: 'right' });
  doc.text(document.due_date, pageW - margin, 195, { align: 'right' });

  currentY = Math.max(customerAddressY, 195) + 40;

  doc.setDrawColor('#111827');
  doc.setLineWidth(2);
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#111827');
  doc.text('DESCRIPTION', margin, currentY);
  doc.text('QTY', pageW - margin - 150, currentY, { align: 'center' });
  doc.text('UNIT PRICE', pageW - margin - 80, currentY, { align: 'right' });
  doc.text('TOTAL', pageW - margin, currentY, { align: 'right' });
  currentY += 10;
  doc.setLineWidth(1);
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 20;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#111827');
  document.items.forEach((item) => {
    const itemYStart = currentY;
    const descriptionLines = doc.splitTextToSize(item.description, 280);
    const textHeight = descriptionLines.length * 12;

    doc.setFont('helvetica', 'bold');
    doc.text(descriptionLines, margin, itemYStart);
    doc.setFont('helvetica', 'normal');

    doc.text(String(item.quantity), pageW - margin - 150, itemYStart, { align: 'center' });
    doc.text(`$${item.price.toFixed(2)}`, pageW - margin - 80, itemYStart, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`$${(item.quantity * item.price).toFixed(2)}`, pageW - margin, itemYStart, {
      align: 'right',
    });

    currentY += Math.max(35, textHeight + 15);

    doc.setDrawColor('#e5e7eb');
    doc.line(margin, currentY - 8, pageW - margin, currentY - 8);
  });

  const totalsXLabel = pageW - margin - 80;
  const totalsXValue = pageW - margin;
  currentY += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#4b5563');
  doc.text('Subtotal', totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${document.subtotal.toFixed(2)}`, totalsXValue, currentY, { align: 'right' });
  currentY += 18;
  doc.text(`Tax (${document.tax}%)`, totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${((document.subtotal * document.tax) / 100).toFixed(2)}`, totalsXValue, currentY, {
    align: 'right',
  });
  currentY += 25;

  doc.setFillColor('#111827');
  doc.rect(totalsXLabel - 50, currentY, 150, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor('#ffffff');
  doc.text('Total', totalsXLabel, currentY + 20, { align: 'right' });
  doc.text(`$${document.total.toFixed(2)}`, totalsXValue, currentY + 20, { align: 'right' });

  if (document.notes) {
    currentY = doc.internal.pageSize.getHeight() - 80;
    doc.setDrawColor('#e5e7eb');
    doc.line(margin, currentY, pageW - margin, currentY);
    currentY += 20;
    doc.setTextColor('#4b5563');
    doc.setFontSize(9);
    addWrappedText(doc, document.notes, margin, currentY, { maxWidth: pageW - margin * 2 });
  }
};

const drawRetroTemplate = (doc: any, document: Document, companyInfo: CompanyInfo) => {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 50;

  // Colors from Solarized Light theme
  const baseColor = '#586e75';
  const accentColor = '#cb4b16'; // orange
  const secondaryAccent = '#b58900'; // yellow
  const borderColor = '#93a1a1';

  let currentY = margin;
  doc.setFont('courier', 'bold');
  doc.setTextColor(accentColor);
  doc.setFontSize(32);
  doc.text(`[ ${companyInfo.name} ]`, pageW / 2, currentY, { align: 'center' });

  currentY += 15;
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(baseColor);
  currentY = addWrappedText(doc, companyInfo.address, pageW / 2, currentY, {
    maxWidth: 300,
    align: 'center',
  });

  currentY += 10;
  doc.setDrawColor(borderColor);
  doc.setLineDashPattern([5, 3], 0);
  doc.line(margin, currentY, pageW - margin, currentY);
  doc.setLineDashPattern([], 0);

  currentY += 40;
  doc.setFont('courier', 'bold');
  doc.setTextColor(secondaryAccent);
  doc.setFontSize(10);
  doc.text('TO:', margin, currentY);

  doc.setTextColor(baseColor);
  doc.setFont('courier', 'normal');
  doc.text(document.customer?.name || '', margin + 30, currentY);
  let customerAddressY = addWrappedText(
    doc,
    document.customer?.address || '',
    margin + 30,
    currentY + 12,
    { maxWidth: 200 }
  );

  doc.setFont('courier', 'bold');
  doc.setTextColor(secondaryAccent);
  doc.text(`${document.type.toUpperCase()} #:`, pageW - margin - 80, currentY, { align: 'right' });
  doc.text('DATE:', pageW - margin - 80, currentY + 15, { align: 'right' });
  doc.text('DUE:', pageW - margin - 80, currentY + 30, { align: 'right' });

  doc.setTextColor(baseColor);
  doc.setFont('courier', 'normal');
  doc.text(document.doc_number, pageW - margin, currentY, { align: 'right' });
  doc.text(document.issue_date, pageW - margin, currentY + 15, { align: 'right' });
  doc.text(document.due_date, pageW - margin, currentY + 30, { align: 'right' });

  currentY = Math.max(customerAddressY, currentY + 30) + 40;

  // Table Header
  doc.setDrawColor(borderColor);
  doc.setLineWidth(1.5);
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 15;
  doc.setFont('courier', 'bold');
  doc.text('ITEM', margin, currentY);
  doc.text('QTY', pageW - margin - 150, currentY, { align: 'center' });
  doc.text('PRICE', pageW - margin - 80, currentY, { align: 'right' });
  doc.text('TOTAL', pageW - margin, currentY, { align: 'right' });
  currentY += 5;
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 20;

  // Table Body
  doc.setFont('courier', 'normal');
  document.items.forEach((item) => {
    const itemYStart = currentY;
    const descriptionLines = doc.splitTextToSize(item.description, 280);
    doc.text(descriptionLines, margin, itemYStart);
    const textHeight = descriptionLines.length * 10;
    doc.text(String(item.quantity), pageW - margin - 150, itemYStart, { align: 'center' });
    doc.text(`$${item.price.toFixed(2)}`, pageW - margin - 80, itemYStart, { align: 'right' });
    doc.text(`$${(item.quantity * item.price).toFixed(2)}`, pageW - margin, itemYStart, {
      align: 'right',
    });
    currentY += textHeight + 10;
  });

  // Totals
  currentY += 20;
  const totalsXLabel = pageW - margin - 80;
  const totalsXValue = pageW - margin;
  doc.setLineDashPattern([2, 2], 0);
  doc.line(pageW / 2, currentY, pageW - margin, currentY);
  doc.setLineDashPattern([], 0);
  currentY += 15;

  doc.setFontSize(10);
  doc.text('Subtotal:', totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${document.subtotal.toFixed(2)}`, totalsXValue, currentY, { align: 'right' });
  currentY += 18;
  doc.text(`Tax (${document.tax}%):`, totalsXLabel, currentY, { align: 'right' });
  doc.text(`$${((document.subtotal * document.tax) / 100).toFixed(2)}`, totalsXValue, currentY, {
    align: 'right',
  });
  currentY += 18;
  doc.setLineWidth(1.5);
  doc.line(pageW / 2, currentY, pageW - margin, currentY);
  currentY += 5;
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(accentColor);
  doc.text('TOTAL:', totalsXLabel, currentY + 12, { align: 'right' });
  doc.text(`$${document.total.toFixed(2)}`, totalsXValue, currentY + 12, { align: 'right' });

  if (document.notes) {
    currentY = doc.internal.pageSize.getHeight() - 80;
    doc.setLineDashPattern([5, 3], 0);
    doc.line(margin, currentY, pageW - margin, currentY);
    doc.setLineDashPattern([], 0);
    currentY += 20;
    doc.setTextColor(baseColor);
    doc.setFontSize(9);
    addWrappedText(doc, `NOTES: ${document.notes}`, margin, currentY, {
      maxWidth: pageW - margin * 2,
    });
  }
};

// ... other templates would follow the same pattern of correction ...

const templates: {
  [key: string]: (doc: any, document: Document, companyInfo: CompanyInfo) => void;
} = {
  modern: drawModernTemplate,
  classic: drawClassicTemplate,
  creative: drawCreativeTemplate,
  minimalist: drawMinimalistTemplate,
  bold: drawBoldTemplate,
  retro: drawRetroTemplate,
  // Other templates need to be added here to be selectable
  // corporate: drawCorporateTemplate
};

export const generatePdf = (document: Document, companyInfo: CompanyInfo) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
  });

  const drawTemplate = templates[document.template_id] || drawModernTemplate;
  if (!templates[document.template_id]) {
    console.warn(`PDF template "${document.template_id}" not found, falling back to "modern".`);
  }
  drawTemplate(doc, document, companyInfo);

  doc.save(`${document.type}-${document.doc_number}.pdf`);
};

const drawLetterTemplate = (doc: any, letter: BusinessLetter, companyInfo: CompanyInfo) => {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 50;
  let currentY = margin;

  // Company info
  if (companyInfo.logo && companyInfo.logo.startsWith('data:image')) {
    try {
      const logoHeight = 40;
      const logoWidth = 40;
      doc.addImage(companyInfo.logo, '', margin, currentY, logoWidth, logoHeight);
    } catch (e) {
      console.error('PDF Logo Error:', e);
    }
  }

  doc.setFont('serif', 'bold');
  doc.setFontSize(14);
  doc.text(companyInfo.name, pageW - margin, currentY + 10, { align: 'right' });
  doc.setFont('serif', 'normal');
  doc.setFontSize(10);
  let companyAddressY = addWrappedText(doc, companyInfo.address, pageW - margin, currentY + 25, {
    maxWidth: 150,
    align: 'right',
  });

  currentY = Math.max(currentY + 50, companyAddressY) + 20;

  doc.text(letter.issue_date, pageW - margin, currentY, { align: 'right' });
  currentY += 30;

  // Recipient
  doc.setFont('serif', 'bold');
  doc.text(letter.customer?.name || '', margin, currentY);
  doc.setFont('serif', 'normal');
  currentY = addWrappedText(doc, letter.customer?.address || '', margin, currentY + 15, {
    maxWidth: 200,
  });
  currentY += 30;

  // Subject
  doc.setFont('serif', 'bold');
  doc.text(`RE: ${letter.subject}`, margin, currentY);
  currentY += 30;

  // Body
  currentY = addWrappedText(doc, letter.body, margin, currentY, { maxWidth: pageW - margin * 2 });
  currentY += 50;

  // Closing
  doc.text('Sincerely,', margin, currentY);
  currentY += 40;
  doc.setFont('serif', 'bold');
  doc.text(companyInfo.name, margin, currentY);
};

export const generateLetterPdf = (letter: BusinessLetter, companyInfo: CompanyInfo) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4',
  });

  drawLetterTemplate(doc, letter, companyInfo);
  doc.save(`Letter-${letter.doc_number}.pdf`);
};
