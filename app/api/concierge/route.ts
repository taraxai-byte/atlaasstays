import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = (body && body.prompt) || '';

    // Simple mock orchestration result based on the prompt
    const now = new Date().toISOString();
    const mockResponse = {
      promptReceived: prompt,
      generatedAt: now,
      summary: `Mock itinerary generated for prompt: ${prompt.substring(0, 160)}`,
      itinerary: {
        days: 7,
        destination: 'New York, USA',
        start: '2026-09-01',
        end: '2026-09-08',
        flights: [
          { from: 'ADD', to: 'JFK', airline: 'MOCK Air', priceUSD: 850 },
        ],
        hotel: {
          name: 'Mock Plaza Hotel',
          nights: 7,
          pricePerNightUSD: 180,
        },
        transfers: [
          { type: 'airport', provider: 'Mock Transfers Co.', priceUSD: 50 },
        ],
        activities: [
          { day: 2, title: 'City walking tour', duration: '3h' },
          { day: 4, title: 'Broadway show', duration: '2.5h' },
        ],
      },
      notes: {
        disclaimer: 'This is a mock response for local development. Replace the API handler to call your real orchestration backend or LLM.',
      },
    };

    return NextResponse.json({ data: mockResponse });
  } catch (err) {
    console.error('concierge POST error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
