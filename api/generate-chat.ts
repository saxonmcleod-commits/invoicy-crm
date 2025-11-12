// api/generate-chat.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Helper to set CORS headers
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
    // 1. Check user authentication
    const supabase = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_ANON_KEY ?? '',
      { global: { headers: { Authorization: req.headers.authorization! } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // 2. Get data from request
    const { history, message } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY environment variable.');
    }

    // 3. Prepare request for Gemini
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

    // 4. Call Gemini API
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

    // 5. Send response
    return res.status(200).json({ response: modelResponse });
  } catch (error: any) {
    console.error('Error in generate-chat function:', error.message);
    return res.status(500).json({ error: error.message });
  }
}