import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { history, message } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY environment variable.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    const geminiReqBody = {
      contents: [
        ...history.map((msg: { role: string, content: string }) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ],
    };

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiReqBody),
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      throw new Error(`Gemini API failed: ${errorText}`);
    }

    const geminiData = await geminiRes.json();
    const modelResponse = geminiData.candidates[0].content.parts[0].text;

    return res.status(200).json({ response: modelResponse });
  } catch (error: any) {
    console.error('Error in generate-chat function:', error.message);
    return res.status(500).json({ error: error.message });
  }
}