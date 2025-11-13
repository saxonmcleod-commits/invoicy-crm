// /Users/saxon/Dev Projects/invoicy-crm-v1.01/supabase/functions/create-payment-link/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.12.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'; // Import CORS headers

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
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Create a Supabase client to interact with your database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Get the invoice data from the request body
    const { invoice, stripe_account_id } = await req.json();

    // *** THIS IS THE MAIN FIX ***
    // Check if stripe_account_id is missing or null
    if (!stripe_account_id) {
      console.error('User has no Stripe account ID. Cannot create payment link.');
      // Return a 400 Bad Request error with a clear message
      return new Response(
        JSON.stringify({
          error:
            'You must connect a Stripe account in your Settings page before you can create payment links.',
        }),
        {
          status: 400, // 400 Bad Request (client-side error)
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    // *** END OF FIX ***

    if (!invoice) {
      throw new Error('Invoice data not provided.');
    }

    // 3. Initialize Stripe with your secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 4. Create a Product in Stripe for this specific invoice
    const product = await stripe.products.create(
      {
        name: `Invoice ${invoice.doc_number}`,
      },
      {
        stripeAccount: stripe_account_id,
      }
    );

    // 5. Create a Price for the Product (amount must be in cents)
    const price = await stripe.prices.create(
      {
        product: product.id,
        unit_amount: Math.round(invoice.total * 100),
        currency: 'aud', // IMPORTANT: Change this to your currency if not AUD
      },
      {
        stripeAccount: stripe_account_id,
      }
    );

    // 6. Create the actual Payment Link that the customer will use
    const paymentLink = await stripe.paymentLinks.create(
      {
        line_items: [{ price: price.id, quantity: 1 }],
        after_completion: {
          type: 'redirect',
          redirect: {
            // URL to redirect to after successful payment.
            // We can build a nice "Thank You" page here later.
            // *** FIX: Changed to a generic success URL, update this to your app's domain ***
            url: `https://your-app-url.com/payment-success?invoice_id=${invoice.id}`,
          },
        },
      },
      {
        stripeAccount: stripe_account_id,
      }
    );

    // 7. Save the generated payment link back to your 'documents' table
    const { error: updateError } = await supabaseClient
      .from('documents')
      .update({ stripe_payment_link: paymentLink.url })
      .eq('id', invoice.id);

    if (updateError) {
      throw updateError;
    }

    // 8. Send the payment link URL back to the front-end
    return new Response(JSON.stringify({ paymentLinkUrl: paymentLink.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});