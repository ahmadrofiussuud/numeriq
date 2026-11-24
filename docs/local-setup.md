# Local setup from scratch

## Prerequisites

Node.js 24, npm 11, Docker-compatible runtime, Git, and a fresh clone of the intended phase branch. Supabase CLI can run through npx; no cloud project is required.

## Environment

Copy `.env.example` to `.env.local`. Use local values from `npx supabase status --output json`:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`: server-only, never `NEXT_PUBLIC_*`
- `SANDBOX_WEBHOOK_SECRET`: random 24+ characters, never a live gateway secret
- `APP_ORIGIN=http://127.0.0.1:3000`

Keep `NUMERIQ_DEMO_PASSWORD` (12+ chars) in the shell only.

## Bootstrap

```powershell
npm install
npx supabase start
npx supabase db reset
$env:SUPABASE_SERVICE_ROLE_KEY = "LOCAL_SERVICE_KEY_FROM_STATUS"
$env:NUMERIQ_DEMO_PASSWORD = "Synthetic-Only-Strong-Pass!"
node scripts/seed-users.mjs
npm run dev
```

`db reset` is destructive. Run only against confirmed `numeriq-local` synthetic data. Seven migrations are applied in filename order.

## Synthetic accounts

| Email | Role |
|---|---|
| admin@numeriq.test | School Admin |
| guru@numeriq.test | Teacher school A |
| wali@numeriq.test | Parent |
| guru-b@numeriq.test | Teacher school B / isolation check |
| operator@numeriq.test | Internal operator |

All use the shell password. The seed prints Bima's one-use invite; Nara is linked but starts without consent.

## Verification

```powershell
npm test
npm run typecheck
npm run build
npm run test:browser
node scripts/test-integration.mjs
$env:RUN_AUTH_BROWSER = "1"; node scripts/test-integration.mjs
```

Integration tests mutate synthetic state. If Windows leaves a locked partial `node_modules`, verify the exact project path, remove only that generated folder, reinstall, and use CI as the clean reference.

## Common failures

- Login disabled: verify local URL/key and Supabase status.
- Seed conflict: reset the synthetic instance; seed intentionally avoids overwriting users.
- Child blocked: verified relation, latest consent and active entitlement are all required.
- Draft unavailable: synthetic mode is seed-only and must never be enabled for real users.
- Webhook 401: sign exact raw JSON bytes; browser redirect never activates access.