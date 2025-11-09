// supabase/functions/handle-recurring-invoices/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
      .select('*')
      .not('recurrence', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    const today = new Date();
    const invoicesToCreate = [];

    // 2. Loop through them and check if a new one should be created
    for (const doc of recurringDocs) {
      const issueDate = new Date(doc.issue_date);

      // Simple check: Does the day of the month match?
      // A more robust solution would handle different frequencies (weekly, yearly)
      // and check if an invoice for the current period has already been created.
      if (doc.recurrence.frequency === 'monthly' && issueDate.getDate() === today.getDate()) {
        // It's the right day of the month to create a new invoice.
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

        invoicesToCreate.push(newInvoice);
      }
    }

    // 3. Insert the new invoices into the database
    if (invoicesToCreate.length > 0) {
      const { error: insertError } = await supabaseAdmin.from('documents').insert(invoicesToCreate);
      if (insertError) {
        throw insertError;
      }
    }

    return new Response(JSON.stringify({ message: `Created ${invoicesToCreate.length} new invoices.` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(String(error?.message ?? error), { status: 500 });
  }
});