# ATLAASSTAYS MASTER BUILD

ONE unified AtlasStays application.

Included:
- Next.js web application
- Atlas AI Concierge
- Structured AI output
- Neon PostgreSQL schema
- Unified booking model
- Server-authoritative pricing boundary
- Stripe Checkout
- Stripe webhook verification/idempotency
- Verified supplier adapter interface
- Supplier registry
- Security headers
- Health endpoint
- Mobile-first UI
- Environment configuration

IMPORTANT:
Real hotel/flight/rental/transfer/experience booking cannot honestly be
claimed until verified supplier APIs and credentials are connected.
The supplier layer fails closed: no adapter means no live inventory.
No fabricated live results.

External configuration required:
- Neon
- OpenAI
- Stripe + webhook
- Waafi merchant/API integration if enabled
- Verified travel supplier credentials
- Production email/SMS provider if enabled

Secrets must stay in deployment environment/secret manager.

0-human operating model:
search → verify → price → reserve → pay → webhook → confirm → notify

Exceptions should enter an auditable recovery workflow instead of being
silently marked successful.
