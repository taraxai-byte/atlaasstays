import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userInput, sessionContext } = await req.json();

    if (!userInput) {
      return NextResponse.json(
        { error: 'userInput is required' },
        { status: 400 }
      );
    }

    const history = Array.isArray(sessionContext) ? sessionContext : [];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are the master autonomous AI travel concierge for ATLAS&STAYS. Your architecture is 1200% robust, global.\n\nAnalyze the user\'s input:\n1. Direct Intent: If they provide an origin and destination worldwide, instantly parse it and switch to direct mode.\n2. Conversational Intent: If the request is ambiguous or they want to chat, answer with high intelligence.\n\nCRITICAL: You must ALWAYS respond in a strict JSON object format with these exact keys:\n{\n  "mode": "direct" or "chat",\n  "message": "Your conversational response to the user here.",\n  "destination": "City, Country name resolved dynamically",\n  "flights": "Specific flight routing, duration, and price options from live context.",\n  "hotels": "4-star and budget hotel selections with total prices.",\n  "carRentals": "Compact car details and daily rental matrix."\n}'
        },
        ...history,
        { role: 'user', content: userInput }
      ],
      response_format: { type: 'json_object' }
    });

    const aiContent = response.choices?.[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json({ error: "No response from AI agent" }, { status: 500 });
    }

    const aiResponse = JSON.parse(aiContent);
    return NextResponse.json(aiResponse);

  } catch (error: any) {
    console.error('AtlaasStays Engine Error:', error);

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
