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
      .select('*, customer:customers(*)') // Also fetch customer details
      .not('recurrence', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    const today = new Date();
    const createdInvoices = [];

    // 2. Loop through them and check if a new one should be created
    for (const doc of recurringDocs) {
      const issueDate = new Date(doc.issue_date);

      // Simple check: Does the day of the month match?
      // A more robust solution would handle different frequencies and edge cases.
      const shouldCreateToday = doc.recurrence.frequency === 'monthly' && issueDate.getDate() === today.getDate();

      // Prevent creating an invoice on the same day the original was created.
      const isSameDayAsOriginal =
        issueDate.getFullYear() === today.getFullYear() &&
        issueDate.getMonth() === today.getMonth() &&
        issueDate.getDate() === today.getDate();

      if (shouldCreateToday && !isSameDayAsOriginal) {
        // It's the right day of the month to create a new invoice.
        if (!doc.customer) {
          console.warn(`Skipping recurring invoice ${doc.doc_number} because it has no customer.`);
          continue;
        }

        // We'll create a copy of the original, but with new dates.
        const newDueDate = new Date(today);
        newDueDate.setDate(newDueDate.getDate() + 30); // Assuming net 30

        const newInvoice = {
          ...doc,
          issue_date: today.toISOString().split('T')[0],
          due_date: newDueDate.toISOString().split('T')[0],
          status: 'Draft', // Create as Draft first
          // Important: remove properties that should be unique for a new record
          id: undefined,
          doc_number: `INV-${Date.now().toString().slice(-6)}`,
          created_at: undefined,
        };
        delete newInvoice.id;
        delete newInvoice.created_at;

        // 3. Insert the new invoice into the database
        const { data: insertedData, error: insertError } = await supabaseAdmin
          .from('documents')
          .insert(newInvoice)
          .select()
          .single();

        if (insertError) {
          console.error(`Failed to insert new invoice for ${doc.doc_number}:`, insertError);
          continue; // Skip to the next recurring doc
        }

        // 4. Get company info to pass to PDF generator
        const { data: profile } = await supabaseAdmin.from('profiles').select('*').single();
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
        const { error: emailError } = await supabaseAdmin.functions.invoke('send-email', {
          body: {
            to: doc.customer.email,
            subject: `New Invoice ${insertedData.doc_number} from ${companyInfo.name}`,
            body: `Hi ${doc.customer.name},\n\nPlease find your latest invoice attached.\n\nThank you!`,
            attachment: {
              filename: `${insertedData.doc_number}.pdf`,
              content: btoa(new Uint8Array(pdfData).reduce((data, byte) => data + String.fromCharCode(byte), '')), // Convert ArrayBuffer to base64
            },
          },
        });

        if (emailError) {
          console.error(`Failed to email PDF for ${insertedData.doc_number}:`, emailError);
          continue;
        }

        createdInvoices.push(insertedData.doc_number);
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