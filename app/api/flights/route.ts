import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    const duffelApiKey = process.env.DUFFEL_API_KEY;

    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database URL is missing' }, { status: 500 });
    }

    const { origin, destination, departureDate } = await request.json();

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing fields: origin, destination, departureDate' },
        { status: 400 }
      );
    }

    if (!duffelApiKey) {
      return NextResponse.json({ error: 'Supplier API key is missing' }, { status: 500 });
    }

    const duffelResponse = await fetch('https://duffel.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${duffelApiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
      },
      body: JSON.stringify({
        data: {
          slices: [{ origin, destination, departure_date: departureDate }],
          passengers: [{ type: 'adult' }],
        },
      }),
    });

    if (!duffelResponse.ok) {
      const errText = await duffelResponse.text();
      return NextResponse.json({ error: 'Supplier API error', details: errText }, { status: 500 });
    }

    const duffelData = await duffelResponse.json();
    const flightOffers = duffelData?.data?.offers || [];

    if (flightOffers.length > 0) {
      try {
        const postgres = require('postgres');
        const sql = postgres(databaseUrl, { ssl: 'require' });
        
        for (const offer of flightOffers) {
          await sql`
            INSERT INTO bookable_products (id, origin, destination, departure_date, price, provider, status)
            VALUES (${offer.id}, ${origin}, ${destination}, ${departureDate}, ${offer.total_amount}, ${offer.owner?.name || 'Unknown Airline'}, 'available')
            ON CONFLICT (id) DO UPDATE SET price = ${offer.total_amount}, status = 'available';
          `;
        }
      } catch (dbError: any) {
        console.error("Database storage skipped or failed:", dbError.message);
      }
    }

    return NextResponse.json({ success: true, offersCount: flightOffers.length });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
