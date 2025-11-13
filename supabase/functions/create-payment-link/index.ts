// /Users/saxon/Dev Projects/invoicy-crm-v1.01/supabase/functions/create-payment-link/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.12.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This is a custom type definition for the invoice data we expect to receive.
// It helps ensure the data is in the correct format.
interface Invoice {
  id: string;
  doc_number: string;
  total: number;
  // Add other invoice properties if needed for Stripe
}

// The main function that will be executed when the Edge Function is called.
serve(async (req) => {
  // This is to handle a CORS preflight request.
  // It's a standard requirement for web security.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
     } })
  }

  try {
    // 1. Create a Supabase client to interact with your database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Get the invoice data from the request body
    const { invoice }: { invoice: Invoice } = await req.json()
    if (!invoice) {
      throw new Error("Invoice data not provided in the request body.");
    }

    // 3. Initialize Stripe with your secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 4. Create a Product in Stripe for this specific invoice
    const product = await stripe.products.create({
      name: `Invoice ${invoice.doc_number}`,
    });

    // 5. Create a Price for the Product (amount must be in cents)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(invoice.total * 100),
      currency: 'aud', // IMPORTANT: Change this to your currency if not AUD
    });

    // 6. Create the actual Payment Link that the customer will use
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: {
        type: 'redirect',
        redirect: {
          // URL to redirect to after successful payment.
          // We can build a nice "Thank You" page here later.
          url: `https://your-app-url.com/payment-success?invoice_id=${invoice.id}`,
        },
      },
    });

    // 7. Save the generated payment link back to your 'documents' table
    const { error: updateError } = await supabaseClient
      .from('documents')
      .update({ stripe_payment_link: paymentLink.url })
      .eq('id', invoice.id)

    if (updateError) {
      throw updateError
    }

    // 8. Send the payment link URL back to the front-end
    return new Response(
      JSON.stringify({ paymentLinkUrl: paymentLink.url }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error('Error creating payment link:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }
})
