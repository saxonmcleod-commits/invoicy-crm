import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: '2022-11-15',
});
const SITE_URL = process.env.SITE_URL;

const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'No authorization header received.' });
    }

    // *** FIX: Use the SERVICE_ROLE_KEY for admin actions ***
    const supabase = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '', // Use the secret key
      { global: { headers: { Authorization: req.headers.authorization! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Supabase auth error:', authError.message);
      return res.status(401).json({ error: `Supabase auth error: ${authError.message}` });
    }
    if (!user) {
      return res.status(401).json({ error: 'User not found. Invalid token.' });
    }
    if (!user.email) {
      return res.status(400).json({ error: 'User email is missing.' });
    }

    console.log(`Authenticated user: ${user.id}`);

    const { data: profileData, error: profileSelectError } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileSelectError) throw profileSelectError;

    let accountId: string | null | undefined = profileData?.stripe_account_id;

    if (!profileData) {
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          company_name: user.email,
          subscription_tier: 'free',
        })
        .single();
      if (profileInsertError) throw profileInsertError;
    }

    if (!accountId) {
      if (!process.env.STRIPE_API_KEY) {
        throw new Error('STRIPE_API_KEY is not set in Vercel.');
      }
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
      });
      accountId = account.id;

      await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);
    }

    if (!SITE_URL) {
      throw new Error('SITE_URL is not set in Vercel.');
    }
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId!,
      refresh_url: `${SITE_URL}/#/settings`,
      return_url: `${SITE_URL}/#/settings`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Full error in create-stripe-account-link:', error.message);
    return res.status(500).json({ error: error.message });
  }
}