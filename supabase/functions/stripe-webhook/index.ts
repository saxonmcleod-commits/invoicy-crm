// /Users/saxon/Dev Projects/invoicy-crm-v1.01/supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.12.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY')!, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!
    )
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(err.message, { status: 400 })
  }

  // Handle the 'checkout.session.completed' event
  if (receivedEvent.type === 'checkout.session.completed') {
    const session = receivedEvent.data.object;
    const paymentLinkUrl = session.payment_link;
    const connectedAccountId = receivedEvent.account; // The Stripe ID of the connected account

    if (paymentLinkUrl) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // First, find the user_id from our profiles table that matches the connected account ID
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('stripe_account_id', connectedAccountId)
          .single();

        if (profileError || !profile) throw new Error(`Could not find profile for Stripe account ${connectedAccountId}`);

        // Find the document with the matching payment link and update its status
        const { error } = await supabaseClient
          .from('documents')
          .update({ status: 'paid' }) // Assumes you have a 'status' column
          .eq('user_id', profile.id) // Ensure we only update a document belonging to the correct user
          .eq('stripe_payment_link', paymentLinkUrl);

        if (error) {
          console.error('Error updating document status:', error);
          // We still return 200 to Stripe, but log the error for debugging
        } else {
          console.log(`Successfully marked invoice with link ${paymentLinkUrl} as paid.`);
        }

      } catch (dbError) {
        console.error('Supabase client error:', dbError);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
