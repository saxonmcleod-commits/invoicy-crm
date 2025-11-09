// supabase/functions/generate-chat/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Assuming you have these types in a shared location or defined here
interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

serve(async (req) => {
  // This is needed for CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { history, message } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY environment variable.');
    }

    // The Gemini API URL for generating content
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const geminiReqBody = {
      contents: [
        ...history.map((msg: ChatMessage) => ({
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

    return new Response(JSON.stringify({ response: modelResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});