// supabase/functions/generate-invoice-pdf/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';

// --- We are copying the types and PDF logic from your app's pdfGenerator.ts ---

interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  abn?: string;
  logo?: string;
}
interface Customer {
  name: string;
  email: string;
  address: string;
}
interface DocumentItem {
  description: string;
  quantity: number;
  price: number;
}
interface InvoiceData {
  doc_number: string;
  type: 'Invoice' | 'Quote';
  customer: Customer;
  items: DocumentItem[];
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  template_id: string; // We need this to select the right template
}

const addWrappedText = (doc: any, text: string, x: number, y: number, options: { maxWidth: number, align?: string }) => {
    if (!text) return y;
    const lines = doc.splitTextToSize(text, options.maxWidth);
    doc.text(lines, x, y, { align: options.align || 'left' });
    return y + lines.length * 10;
};

const drawModernTemplate = (doc: any, document: InvoiceData, companyInfo: CompanyInfo) => {
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
        } catch(e) { console.error("PDF Logo Error (Modern):", e) }
    }

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#1e293b');
    doc.setFontSize(16);
    doc.text(companyInfo.name, pageW - margin, companyInfoY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#64748b');
    doc.setFontSize(10);
    let addressY = addWrappedText(doc, companyInfo.address, pageW - margin, companyInfoY + 15, { maxWidth: 150, align: 'right' });
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
    let customerY = addWrappedText(doc, document.customer?.address || '', margin, currentY + 28, { maxWidth: 200 });
    doc.text(document.customer?.email || '', margin, customerY);

    // Dates
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#64748b');
    doc.text('Issue Date:', pageW - margin - 120, currentY, { align: 'left'});
    doc.text('Due Date:', pageW - margin - 120, currentY + 15, { align: 'left'});
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#334155');
    doc.text(document.issue_date, pageW - margin, currentY, { align: 'right'});
    doc.text(document.due_date, pageW - margin, currentY + 15, { align: 'right'});
    currentY = Math.max(customerY, currentY + 15) + 30;

    // Table Header
    doc.setFillColor('#3b82f6');
    doc.rect(margin, currentY, pageW - (margin * 2), 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#ffffff');
    doc.setFontSize(10);
    doc.text('DESCRIPTION', margin + 10, currentY + 16);
    doc.text('QTY', pageW - margin - 200, currentY + 16, { align: 'center'});
    doc.text('UNIT PRICE', pageW - margin - 120, currentY + 16, { align: 'right'});
    doc.text('TOTAL', pageW - margin - 10, currentY + 16, { align: 'right'});
    currentY += 35;

    // Table Body
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#1e293b');
    document.items.forEach(item => {
        const itemYStart = currentY;
        const descriptionLines = doc.splitTextToSize(item.description, 250);
        doc.text(descriptionLines, margin + 10, itemYStart);
        const itemHeight = descriptionLines.length * 12;
        doc.text(String(item.quantity), pageW - margin - 200, itemYStart, { align: 'center'});
        doc.text(`$${item.price.toFixed(2)}`, pageW - margin - 120, itemYStart, { align: 'right'});
        doc.text(`$${(item.quantity * item.price).toFixed(2)}`, pageW - margin - 10, itemYStart, { align: 'right'});
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
    doc.text(`$${(document.subtotal * document.tax / 100).toFixed(2)}`, totalsXValue, currentY, { align: 'right' });
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
        addWrappedText(doc, document.notes, margin, currentY + 12, { maxWidth: pageW - (margin * 2) });
    }
};

// In a real project, you would copy ALL your template functions here
// (drawClassicTemplate, drawCreativeTemplate, etc.)

const templates: { [key: string]: (doc: any, document: InvoiceData, companyInfo: CompanyInfo) => void } = {
    modern: drawModernTemplate,
    // classic: drawClassicTemplate,
    // ... other templates
};

serve(async (req) => {
  // This is needed for CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the invoice and company data from the request
    const { invoiceData, companyInfo } = (await req.json()) as { invoiceData: InvoiceData, companyInfo: CompanyInfo };

    // Create a new PDF document
    const doc = new jsPDF();

    // Select the correct drawing function based on the template_id
    const drawTemplate = templates[invoiceData.template_id] || drawModernTemplate;
    drawTemplate(doc, invoiceData, companyInfo);

    // Get the PDF as a raw ArrayBuffer
    const pdfArrayBuffer = doc.output('arraybuffer');

    // Return the PDF file
    return new Response(pdfArrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceData.doc_number}.pdf"`,
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});