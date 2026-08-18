import { NextResponse } from 'next/server';

// Simple in-memory rate limiter (per-IP). For production use a distributed store (Redis).
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000; // 1 minute
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 30; // max requests per window
const rateMap: Map<string, { count: number; firstRequestAt: number }> = new Map();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';

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

function sanitizePrompt(input: any) {
  if (!input) return '';
  if (typeof input !== 'string') input = String(input);
  // Basic sanitization: trim and limit length
  let s = input.trim();
  if (s.length > 2000) s = s.substring(0, 2000);
  return s;
}

async function callOpenAI(messages: Array<any>) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured in environment');

  const payload = {
    model: OPENAI_MODEL,
    messages,
    temperature: 0.2,
    max_tokens: 1200,
    // You can add other parameters like stop, top_p, frequency_penalty, etc.
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText} - ${text}`);
  }

  const json = await res.json();
  // Safely extract assistant content
  const assistant = json.choices?.[0]?.message?.content ?? json.choices?.[0]?.text ?? null;
  return { raw: json, assistant };
}

function parseAssistantJson(content: string) {
  // Try to find the first JSON object in the response and parse it.
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    const maybeJson = content.substring(start, end + 1);
    try {
      return JSON.parse(maybeJson);
    } catch (err) {
      // fallthrough to return raw content
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const prompt = sanitizePrompt(body?.prompt);
    if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

    // Build a system prompt that instructs the model to return structured JSON.
    const systemPrompt = `You are the AtlaasStays Journey Orchestrator. Given the user's natural-language travel request, produce a single JSON object (and only the JSON) that follows this schema:
{
  "summary": string, // short human readable summary
  "destination": string,
  "start_date": string (ISO date or best estimate),
  "end_date": string (ISO date or best estimate),
  "nights": number,
  "flights": [ { "from": string, "to": string, "departure": string, "arrival": string, "airline": string, "priceUSD": number } ],
  "hotel": { "name": string, "nights": number, "pricePerNightUSD": number },
  "transfers": [ { "type": string, "provider": string, "priceUSD": number } ],
  "activities": [ { "day": number, "title": string, "duration": string } ],
  "notes": { "disclaimer": string }
}

Always respond with valid JSON exactly matching the structure above where possible. If some fields are unknown, supply reasonable estimates or null. Do not include any additional explanatory text outside of the JSON object.`;

    const userMessage = `User request: ${prompt}\n\nReturn a JSON itinerary following the schema.`;

    // Call the LLM provider
    const { assistant, raw } = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    const generatedAt = new Date().toISOString();

    // Attempt to parse JSON from assistant
    let parsed = null;
    if (typeof assistant === 'string') {
      parsed = parseAssistantJson(assistant);
    }

    const result = {
      promptReceived: prompt,
      generatedAt,
      model: OPENAI_MODEL,
      rawModelResponse: raw,
      llmText: assistant,
      parsedItinerary: parsed,
      notes: {
        warning: parsed ? null : 'Model did not return valid JSON; see llmText or rawModelResponse for details',
      },
    };

    return NextResponse.json({ data: result });
  } catch (err: any) {
    console.error('concierge POST error:', err?.message ?? err);
    const status = err?.message?.includes('OPENAI_API_KEY') ? 500 : 500;
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status });
  }
}
