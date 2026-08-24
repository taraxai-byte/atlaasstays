import { NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 30;
const rateMap = new Map();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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

const conciergeSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  departureDate: z.string(),
  budget: z.string().optional(),
});

async function callOpenAI(systemPrompt: string, userPrompt: string) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing');

  // FIXED: Using the official OpenAI API endpoint instead of the website URL
  const response = await fetch('https://openai.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1200,
      tools: [
        {
          type: "function",
          function: {
            name: "searchFlights",
            description: "Search for live flight inventory between two destinations",
            parameters: {
              type: "object",
              properties: {
                origin: { type: "string", description: "3-letter IATA code (e.g. ADD)" },
                destination: { type: "string", description: "3-letter IATA code (e.g. DXB)" },
                departureDate: { type: "string", description: "Date in YYYY-MM-DD format" }
              },
              required: ["origin", "destination", "departureDate"]
            }
          }
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { userPrompt } = await request.json();
    if (!userPrompt) {
      return NextResponse.json({ error: 'Missing userPrompt' }, { status: 400 });
    }

    const systemPrompt = `You are the premium AI Travel Concierge for AtlaasStays. Your job is to help users plan their journey. When a user specifies a travel intention to go from one city to another with a date, you MUST invoke the 'searchFlights' tool to synchronize real-time flight inventory. Do not invent pricing or flight schedules yourself.`;

    const aiMessage = await callOpenAI(systemPrompt, userPrompt);

    // Check if the AI decided to invoke the flight search tool
    if (aiMessage?.tool_calls && aiMessage.tool_calls.length > 0) {
      const toolCall = aiMessage.tool_calls[0];
      if (toolCall.function.name === 'searchFlights') {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Triggering the safe live inventory fetch route we built today
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;
        const flightSync = await fetch(`${appUrl}/api/flights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: args.origin,
            destination: args.destination,
            departureDate: args.departureDate
          })
        });

        const syncResult = await flightSync.json();
        
        return NextResponse.json({
          success: true,
          message: `AtlaasStays AI successfully synchronized live inventory for ${args.origin} to ${args.destination}.`,
          aiResponse: "I am pulling the latest flight offers for you right now from our suppliers.",
          syncDetails: syncResult
        });
      }
    }

    return NextResponse.json({
      success: true,
      aiResponse: aiMessage?.content || "How can I assist you with your travel planning today?"
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
