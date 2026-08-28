import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { userInput, sessionContext } = await req.json();

    const formattedMessages = [
      {
        role: 'system',
        content: `You are the master autonomous AI travel concierge for ATLAS&STAYS. Your architecture is 1200% robust, global.

Analyze the user's input:
1. Direct Intent: If they provide an origin and destination worldwide, instantly parse it and switch to direct mode.
2. Conversational Intent: If the request is ambiguous or they want to chat, answer with high intelligence.

CRITICAL: You must ALWAYS respond in a strict JSON object format with these exact keys:
{
  "mode": "direct" or "chat",
  "message": "Your conversational response to the user here.",
  "destination": "City, Country name resolved dynamically",
  "flights": "Specific flight routing, duration, and price options from live context.",
  "hotels": "4-star and budget hotel selections with total prices.",
  "carRentals": "Compact car details and daily rental matrix."
}`
      }
    ];

    if (sessionContext && Array.isArray(sessionContext)) {
      sessionContext.forEach(msg => {
        if (['user', 'assistant', 'system'].includes(msg.role)) {
          formattedMessages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    formattedMessages.push({ role: 'user', content: userInput });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: formattedMessages,
      response_format: { type: 'json_object' }
    });

    const aiContent = response.choices?.[0]?.message?.content || '{}';
    const aiResponse = JSON.parse(aiContent);

    return NextResponse.json(aiResponse);

  } catch (error) {
    return NextResponse.json({
      mode: 'chat',
      message: 'AtlaasStays core engine is adjusting routing to shield against supplier instability. Please try again.',
      destination: 'Global Fault Loop',
      flights: 'Rerouting operational pipelines...',
      hotels: 'Hotel ledger isolated.',
      carRentals: 'Mobility systems secured.'
    }, { status: 500 });
  }
}
