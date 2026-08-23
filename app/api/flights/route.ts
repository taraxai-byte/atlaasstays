import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { origin, destination, departureDate } = await request.json();

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, departureDate' },
        { status: 400 }
      );
    }

    const duffelResponse = await fetch('https://duffel.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DUFFEL_API_KEY}`,
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
    const flightOffers = duffelData.data.offers;

    if (flightOffers && flightOffers.length > 0) {
      for (const offer of flightOffers) {
        await sql`
          INSERT INTO bookable_products (id, origin, destination, departure_date, price, provider, status)
          VALUES (${offer.id}, ${origin}, ${destination}, ${departureDate}, ${offer.total_amount}, ${offer.owner.name}, 'available')
          ON CONFLICT (id) DO UPDATE SET price = ${offer.total_amount}, status = 'available';
        `;
      }
    }

    return NextResponse.json({ success: true, offersCount: flightOffers ? flightOffers.length : 0 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
