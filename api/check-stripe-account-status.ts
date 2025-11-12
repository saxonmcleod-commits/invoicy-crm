import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'authorization, x-client-info, apikey, content-type'
  );
  // Note: Your original file had 'GET', but the client-side fetches with 'POST'
  // I've changed it to 'POST' to match the client.
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  // Your client is sending a POST request, not a GET
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // *** Validate Env Vars ***
    const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !STRIPE_API_KEY ||
      !SUPABASE_URL ||
      !SUPABASE_ANON_KEY ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error('Missing one or more environment variables');
      throw new Error('Server configuration error.');
    }

    // *** Initialize Stripe inside try block ***
    const stripe = new Stripe(STRIPE_API_KEY, {
      apiVersion: '2022-11-15',
    });

    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'No authorization header received.' });
    }

    // *** STEP 1: Authenticate the user ***
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.authorization! } },
    });
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError) {
      throw authError;
    }
    if (!user) {
      return res.status(401).json({ error: 'User not found. Invalid token.' });
    }

    // *** STEP 2: Use Admin client ***
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('stripe_account_id, stripe_account_setup_complete')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile || !profile.stripe_account_id) {
      return res
        .status(200)
        .json({ setupComplete: false, message: 'No Stripe account ID found.' });
    }

    if (profile.stripe_account_setup_complete) {
      return res.status(200).json({ setupComplete: true });
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    if (account.charges_enabled) {
      await adminClient
        .from('profiles')
        .update({ stripe_account_setup_complete: true })
        .eq('id', user.id);
      return res.status(200).json({ setupComplete: true });
    }

    return res.status(200).json({ setupComplete: false });
  } catch (error: any) {
    console.error(
      'Full error in check-stripe-account-status:',
      error.message
    );
    return res.status(500).json({ error: error.message });
  }
}