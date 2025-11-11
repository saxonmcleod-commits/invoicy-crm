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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', // Use ANON_KEY
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not found');
    if (!user.email) throw new Error('User email is missing.');

    // --- ROBUST PROFILE HANDLING ---
    // 1. Try to get the profile, use .maybeSingle() to prevent error if it doesn't exist
    const { data: profileData, error: profileSelectError } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileSelectError) throw profileSelectError;

    let accountId: string | null | undefined = profileData?.stripe_account_id;

    // 2. If no profile exists, create one
    if (!profileData) {
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id, // Link to the auth.users id
          company_name: user.email, // Use email as a default
          subscription_tier: 'free',
        })
        .single();
        
      if (profileInsertError) throw profileInsertError;
      // accountId remains null here, which is correct.
    }

    // 3. If no Stripe account ID, create one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
      });
      accountId = account.id;

      // Update the profile (which we now know exists)
      await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);
    }

    // 4. Create the account link
    const accountLink = await stripe.accountLinks.create({
      account: accountId!,
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