import { NextResponse } from 'next/server';
import { z } from 'zod';

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
      // fallthrough to return null
    }
  }
  return null;
}

// Zod schema for the Journey Itinerary
const FlightSchema = z.object({
  from: z.string(),
  to: z.string(),
  departure: z.string().optional(),
  arrival: z.string().optional(),
  airline: z.string().optional(),
  priceUSD: z.number().optional(),
});

const HotelSchema = z.object({
  name: z.string().optional(),
  nights: z.number().optional(),
  pricePerNightUSD: z.number().optional(),
});

const TransferSchema = z.object({
  type: z.string().optional(),
  provider: z.string().optional(),
  priceUSD: z.number().optional(),
});

const ActivitySchema = z.object({
  day: z.number().optional(),
  title: z.string().optional(),
  duration: z.string().optional(),
});

const ItinerarySchema = z.object({
  summary: z.string().optional(),
  destination: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  nights: z.number().optional(),
  flights: z.array(FlightSchema).optional(),
  hotel: HotelSchema.optional(),
  transfers: z.array(TransferSchema).optional(),
  activities: z.array(ActivitySchema).optional(),
  notes: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded', code: 'RATE_LIMIT' }, { status: 429 });
    }

    const body = await request.json();
    const prompt = sanitizePrompt(body?.prompt);
    if (!prompt) return NextResponse.json({ error: 'Missing prompt', code: 'MISSING_PROMPT' }, { status: 400 });

    const systemPrompt = `You are the AtlaasStays Journey Orchestrator. Given the user's natural-language travel request, produce a single JSON object (and only the JSON) that follows this schema:\n{\n  \"summary\": string,\n  \"destination\": string,\n  \"start_date\": string (ISO date or best estimate),\n  \"end_date\": string (ISO date or best estimate),\n  \"nights\": number,\n  \"flights\": [ { \"from\": string, \"to\": string, \"departure\": string, \"arrival\": string, \"airline\": string, \"priceUSD\": number } ],\n  \"hotel\": { \"name\": string, \"nights\": number, \"pricePerNightUSD\": number },\n  \"transfers\": [ { \"type\": string, \"provider\": string, \"priceUSD\": number } ],\n  \"activities\": [ { \"day\": number, \"title\": string, \"duration\": string } ],\n  \"notes\": { \"disclaimer\": string }\n}\n\nAlways respond with valid JSON exactly matching the structure above where possible. If some fields are unknown, supply reasonable estimates or null. Do not include any additional explanatory text outside of the JSON object.`;

    const userMessage = `User request: ${prompt}\n\nReturn a JSON itinerary following the schema.`;

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

    if (!parsed) {
      // Structured error response: LLM did not return parsable JSON
      return NextResponse.json(
        {
          error: 'LLM_RESPONSE_NOT_JSON',
          message: 'The language model did not return a valid JSON itinerary.',
          details: {
            hint: 'Inspect llmText and rawModelResponse for troubleshooting',
            llmText: assistant,
            rawModelResponse: raw,
          },
        },
        { status: 502 }
      );
    }

    // Validate parsed JSON against the schema
    const validation = ItinerarySchema.safeParse(parsed);
    if (!validation.success) {
      // Return structured validation errors
      return NextResponse.json(
        {
          error: 'ITINERARY_SCHEMA_INVALID',
          message: 'Parsed itinerary did not match the expected schema.',
          details: {
            issues: validation.error.format(),
            parsed,
            llmText: assistant,
            rawModelResponse: raw,
          },
        },
        { status: 422 }
      );
    }

    const result = {
      promptReceived: prompt,
      generatedAt,
      model: OPENAI_MODEL,
      parsedItinerary: validation.data,
      rawModelResponse: raw,
      llmText: assistant,
    };

    return NextResponse.json({ data: result });
  } catch (err: any) {
    console.error('concierge POST error:', err?.message ?? err);
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err?.message ?? 'Internal server error' }, { status: 500 });
  }
}
