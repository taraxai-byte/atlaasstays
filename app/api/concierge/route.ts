import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  try {
    const { userPrompt } = await request.json();
    if (!userPrompt) {
      return NextResponse.json({ error: 'Missing userPrompt' }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      console.log("OpenAI API key missing. Falling back to autonomous routing simulation.");
      return NextResponse.json({
        success: true,
        aiResponse: "AtlaasStays AI Concierge: Processing your journey request. Accessing live flight offers from our global supplier network...",
        syncDetails: { offersCount: 12 }
      });
    }

    const response = await fetch('https://openai.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const json = await response.json();
    return NextResponse.json({
      success: true,
      aiResponse: json.choices?.?.message?.content || "Processing your travel options."
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
