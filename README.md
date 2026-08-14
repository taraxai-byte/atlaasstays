# ATLAASSTAYS — Production AI Travel Platform

AtlasStays Global Technologies.

## What this build contains

- Next.js application foundation
- AI Concierge using OpenAI server-side
- Structured AI travel requirement extraction
- Neon PostgreSQL schema
- Verified-product pricing boundary
- Unified booking model
- Stripe Checkout creation
- Stripe webhook signature verification
- Stripe event idempotency
- Booking/payment status updates
- Health endpoint
- Mobile-first premium UI

## Important production rule

This application does NOT fabricate live travel inventory.

The `bookable_products` table is the verified-data boundary. A product must be populated by a trusted AtlasStays data source or a connected supplier integration before it is marked available.

Do not mark demo/static records as live inventory.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add the Neon `DATABASE_URL`.
3. Add server-side OpenAI and Stripe secrets.
4. Run `db/schema.sql` against the Neon database.
5. Install dependencies:
   `npm install`
6. Run:
   `npm run dev`

## Stripe webhook

Configure Stripe to send checkout events to:

`https://atlaasstays.com/api/stripe/webhook`

At minimum subscribe to:
- checkout.session.completed
- checkout.session.expired

Set `STRIPE_WEBHOOK_SECRET`.

## Next production layers

The current foundation intentionally refuses to invent supplier inventory. Before accepting real travel bookings, connect verified supplier adapters for hotels, flights, rentals, transfers and experiences and implement server-side price revalidation + supplier reservation confirmation.

The application architecture keeps those integrations behind the booking/search service boundary so the customer-facing application remains one unified product.
