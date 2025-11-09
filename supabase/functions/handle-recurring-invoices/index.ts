// supabase/functions/handle-recurring-invoices/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Hello from handle-recurring-invoices!');

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Fetch all documents that are recurring
    const { data: recurringDocs, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('*, customer:customers!inner(*)') // Also fetch customer details, ensuring customer is not null
      .not('recurrence', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    const today = new Date();
    const createdInvoices = [];

    // 2. Loop through them and check if a new one should be created
    for (const doc of recurringDocs) {
      const issueDate = new Date(doc.issue_date);

      // Check if it's the right day of the month to potentially create an invoice
      if (doc.recurrence.frequency === 'monthly' && issueDate.getDate() === today.getDate()) {
        // Now, check if an invoice for this recurring series has already been created this month.
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const { count: existingInvoiceCount, error: checkError } = await supabaseAdmin
          .from('documents')
          .select('id', { count: 'exact', head: true })
          .eq('source_doc_id', doc.id) // Assuming you have a column to track the source
          .gte('issue_date', startOfMonth.toISOString())
          .lte('issue_date', endOfMonth.toISOString());

        if (checkError) {
          console.error(`Error checking for existing invoices for ${doc.doc_number}:`, checkError);
          continue;
        }

        // If no invoice was found for this month, we can create one.
        if (existingInvoiceCount === 0) {

          // We'll create a copy of the original, but with new dates.
          const newDueDate = new Date(today);
          newDueDate.setDate(newDueDate.getDate() + 30); // Assuming net 30

          // Get all invoices to calculate the next sequential number
          const { data: allInvoices } = await supabaseAdmin.from('documents').select('doc_number').eq('type', 'Invoice');
          let maxNumber = 10000;
          allInvoices?.forEach(inv => {
            const num = parseInt(String(inv.doc_number).replace(/\D/g, ''), 10);
            if (!isNaN(num) && num > maxNumber) maxNumber = num;
          });
          const nextDocNumber = `INV-${maxNumber + 1}`;

          const newInvoice = {
            ...doc,
            issue_date: today.toISOString().split('T')[0],
            due_date: newDueDate.toISOString().split('T')[0],
            status: 'Draft', // Create as Draft first
            source_doc_id: doc.id, // Link back to the original recurring invoice
            // Important: remove properties that should be unique for a new record
            id: undefined,
            doc_number: nextDocNumber,
            created_at: undefined,
          };
          delete newInvoice.id;
          delete newInvoice.customer; // Remove the nested customer object
          delete newInvoice.activityLog; // Remove the activityLog property
          delete newInvoice.created_at;

          // 3. Insert the new invoice into the database
          const { data: insertedData, error: insertError } = await supabaseAdmin
            .from('documents')
            .insert(newInvoice)
            .select('*') // This is the fix! Get all columns of the new invoice.
            .single();

          if (insertError) {
            console.error(`Failed to insert new invoice for ${doc.doc_number}:`, insertError);
            continue; // Skip to the next recurring doc
          }

          // 4. Get company info to pass to PDF generator
          const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', doc.user_id).single();
          const companyInfo = {
            name: profile?.company_name || 'Your Company',
            address: profile?.company_address || '',
            email: profile?.company_email || '',
            abn: profile?.company_abn || '',
            logo: profile?.company_logo || '',
          };

          // 5. Invoke the PDF generation function
          const { data: pdfData, error: pdfError } = await supabaseAdmin.functions.invoke(
            'generate-invoice-pdf',
            { body: { invoiceData: { ...insertedData, customer: doc.customer }, companyInfo } }
          );

          if (pdfError) {
            console.error(`Failed to generate PDF for ${insertedData.doc_number}:`, pdfError);
            continue;
          }

          // 6. Invoke the email function with the PDF as an attachment
          // We need to convert the ArrayBuffer from the PDF function into a base64 string for the email attachment.
          const pdfBase64 = btoa(new Uint8Array(pdfData).reduce((data, byte) => data + String.fromCharCode(byte), ''));

          const { error: emailError } = await supabaseAdmin.functions.invoke('send-email', {
            body: {
              to: doc.customer.email,
              subject: `New Invoice ${insertedData.doc_number} from ${companyInfo.name}`,
              body: `Hi ${doc.customer.name},\n\nPlease find your latest invoice attached.\n\nThank you!`,
              attachment: {
                filename: `${insertedData.doc_number}.pdf`,
                content: pdfBase64,
              },
            },
          });

          if (emailError) {
            console.error(`Failed to email PDF for ${insertedData.doc_number}:`, emailError);
            continue;
          }

          createdInvoices.push(insertedData.doc_number);

          // 7. Update the new invoice's status to 'Sent'
          await supabaseAdmin.from('documents').update({ status: 'Sent' }).eq('id', insertedData.id);
        }
      }
    }

    return new Response(JSON.stringify({ message: `Processed recurring invoices. Sent: ${createdInvoices.join(', ')}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});