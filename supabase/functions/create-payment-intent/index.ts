import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0';
import Stripe from 'https://esm.sh/stripe@12.5.0';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // This is needed for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Note: This function is called by the end-customer, so we use the anon key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { documentId } = (await req.json()).body;

    const { data: document, error: docError } = await supabase
      .from('documents')

      .select('total, user_id')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;
    if (!document) throw new Error('Document not found');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', document.user_id)
      .single();

    if (profileError) throw profileError;
    if (!profile || !profile.stripe_account_id) {
      throw new Error('Business has not connected a Stripe account.');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(document.total * 100), // Amount in cents
      currency: 'usd', // Or your desired currency
      automatic_payment_methods: { enabled: true },
      application_fee_amount: Math.round(document.total * 100 * 0.03), // 3% application fee
      transfer_data: {
        destination: profile.stripe_account_id,
      },
    });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
