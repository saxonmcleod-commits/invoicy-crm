import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'authorization, x-client-info, apikey, content-type'
  );
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  try {
    // *** Validate Env Vars ***
    const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!STRIPE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing one or more environment variables');
      throw new Error('Server configuration error.');
    }

    // *** Initialize Stripe inside try block ***
    const stripe = new Stripe(STRIPE_API_KEY, {
      apiVersion: '2022-11-15',
    });

    // *** Use the SERVICE_ROLE_KEY to read RLS-protected tables ***
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { documentId } = req.body;

    if (!documentId) {
      throw new Error('documentId is required');
    }

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
      amount: Math.round(document.total * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      application_fee_amount: Math.round(document.total * 100 * 0.03), // 3% fee
      transfer_data: {
        destination: profile.stripe_account_id,
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}