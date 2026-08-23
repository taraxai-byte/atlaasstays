import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

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
      return NextResponse.json({ error: 'Failed to fetch from supplier' }, { status: 500 });
    }

    const duffelData = await duffelResponse.json();
    const flightOffers = duffelData?.data?.offers || [];

    if (flightOffers.length > 0) {
      const sql = neon(databaseUrl);
      for (const offer of flightOffers) {
        await sql(
          `INSERT INTO bookable_products (id, origin, destination, departure_date, price, provider, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET price = $5, status = $7`,
          [
            offer.id,
            origin,
            destination,
            departureDate,
            offer.total_amount,
            offer.owner?.name || 'Unknown Airline',
            'available'
          ]
        );
      }
    }

    return NextResponse.json({ success: true, offersCount: flightOffers.length });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
