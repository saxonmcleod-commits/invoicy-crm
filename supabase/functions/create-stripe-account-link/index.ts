// supabase/functions/create-stripe-account-link/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0';
import Stripe from 'https://esm.sh/stripe@12.5.0';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

const SITE_URL = Deno.env.get('SITE_URL');

serve(async (req) => {
  // This is needed for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    //
    // --- THIS IS THE FIX ---
    //
    // We must use the ANON key here so the client can
    // correctly identify the user from the Authorization header.
    // Using the SERVICE_ROLE_KEY conflicts with passing the user's auth.
    //
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', // Use ANON_KEY
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    let accountId = profile.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
      });
      accountId = account.id;

      // This update will succeed because the user is authenticated
      // and RLS policies should allow them to update their own profile.
      await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${SITE_URL}/settings`,
      return_url: `${SITE_URL}/settings`,
      type: 'account_onboarding',
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});