// supabase/functions/send-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// FIX: Declare Deno to resolve "Cannot find name 'Deno'" error in environments without Deno types.
declare const Deno: any;

// The main function that handles requests
serve(async (req) => {
  // This is needed for CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get the data from the request body
    const { to, subject, body } = await req.json();

    // 2. Get the secret API key from the environment
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      throw new Error('Resend API key is not set in environment variables.');
    }

    // 3. Use the Resend API to send the email
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'InvoicyCRM <onboarding@resend.dev>', // Using Resend's sandbox email for testing
        to: to,
        subject: subject,
        html: body, // Using 'html' allows for better formatting
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      // If Resend returns an error, throw it
      throw new Error(data.error?.message || `Failed to send email (${res.status})`);
    }

    // 4. Return a success response to your app
    return new Response(JSON.stringify({ message: 'Email sent successfully!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // 5. If anything goes wrong, return an error response
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
