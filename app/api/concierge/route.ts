export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';

// 1. Wixii Muhiimka Ahaa: Rate Limiting & Security koodhkii hore laga soo qaatay
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000; 
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 30; 
const rateMap = new Map();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

function getClientIp(request: Request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function isRateLimited(ip: string) {
  const entry = rateMap.get(ip);
  const now = Date.now();
  if (!entry) {
    rateMap.set(ip, { count: 1, firstRequestAt: now });
    return false;
  }
  if (now - entry.firstRequestAt > RATE_LIMIT_WINDOW_MS) {
    rateMap.set(ip, { count: 1, firstRequestAt: now });
    return false;
  }
  entry.count += 1;
  rateMap.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX;
}

// 2. Wixii Muhiimka Ahaa: Schema-gii rasmiga ahaa ee safarka
const conciergeSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  departureDate: z.string().optional(),
  budget: z.string().optional(),
});

// 3. Wixii Muhiimka Ahaa: Habka wicitaanka OpenAI rasmiga ah ee koodhkii hore
async function callOpenAI(systemPrompt: string, userPrompt: string) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing');
  
  const response = await fetch('https://openai.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1200
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || '';
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const { userPrompt } = await request.json();
    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid user prompt' }, { status: 400 });
    }
    
    let aiResponseText = "";
    let attempts = 0;
    const maxAttempts = 3; 
    let lastError = "";

    // 4. KORDHINTA CUSUB: AUTONOMOUS SELF-HEALING AI LOOP
    while (attempts < maxAttempts) {
      const systemPrompt = attempts === 0 
        ? "You are an expert autonomous travel coordinator. Analyze the user request and extract the origin and destination into a strict JSON object matching the requested schema. Return ONLY valid raw JSON."
        : `CRITICAL ERROR: Your previous JSON output failed validation with the following error: "${lastError}". You must analyze this error, rewrite the JSON payload, fix missing parameters, and output 100% valid schema-compliant JSON now.`;

      aiResponseText = await callOpenAI(systemPrompt, userPrompt);

      try {
        const cleanJsonString = aiResponseText.replace(/```json|```/g, "").trim();
        const parsedJson = JSON.parse(cleanJsonString);
        
        // Zod validation execution
        const validatedData = conciergeSchema.parse(parsedJson);
        return NextResponse.json({ success: true, data: validatedData });
        
      } catch (validationError: any) {
        attempts++;
        lastError = validationError.message || "Invalid JSON syntax structure";
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: "AI global autonomous self-correction cycle limit reached.", 
      error: lastError 
    }, { status: 422 });

  } catch (globalError: any) {
    console.error("[Fatal Runtime Exception]:", globalError);
    return NextResponse.json({ success: false, error: "Internal Server Infrastructure Error" }, { status: 500 });
  }
}
