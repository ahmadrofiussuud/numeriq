# NUMERIQ — Phase 1 foundation
Local-only, synthetic data. UI and backend foundation source exists; Next build and Supabase integration are NOT VERIFIED in this environment.

## Prerequisites
Node 24.11.1 / npm 11.6.4 detected. npm registry DNS failed (ENOTFOUND). Docker was not found on PATH or at the standard Docker Desktop CLI path.
Install/enable a Docker-compatible runtime and Supabase CLI on your development machine. No cloud account or live payment is required.
Dependency ranges are provisional because registry access failed; npm install must resolve and produce package-lock.json before compatibility can be confirmed.

## Setup (PowerShell)
1. npm.cmd install
2. supabase start
3. supabase db reset (ONLY the fresh numeriq-local development database; destroys its prior local demo data)
4. Copy .env.example to .env.local; use local API URL and anon key from supabase status.
5. Set SUPABASE_SERVICE_ROLE_KEY in the current shell to the LOCAL key from supabase status. Set NUMERIQ_DEMO_PASSWORD to a password of at least 12 characters. Never put the service key in public/client env.
6. node scripts/seed-users.mjs (run once after fresh reset; fails on existing users to avoid silently replacing them).
7. npm.cmd run dev
8. Open http://127.0.0.1:3000

Accounts: admin@numeriq.test, guru@numeriq.test, wali@numeriq.test, guru-b@numeriq.test. All use the password you chose in step 5. Names and records are synthetic.
Seed script prints a synthetic single-use invitation for Bima; intended only for the seeded guardian. Nara is already linked but has no consent.
No refresh token is retained: after one hour adults sign in again. Child sessions expire after 15 minutes, are bound to the adult and recheck consent/access on every read. Phase 1 uses a single institution per adult profile; multi-membership from the PRD remains a documented gap.

## Verification
npm.cmd test — pure authorization domain tests, runs without dependencies.
npm.cmd run typecheck — requires installed dependencies.
npm.cmd run build — requires installed dependencies.
Integration/RLS/browser checks must be performed after local setup. Passing domain tests is NOT proof of SQL policies or runtime UI.
No real assessment content, scoring, BKT, billing, or clinical claims are implemented.

## Demo flow
Parent sign-in -> inspect Nara -> grant draft demo consent -> open child session -> child shell -> return to adult.
Use printed invite -> verify Bima -> grant consent. Withdraw consent -> future child session reads denied.
Teacher -> only assigned school-A children. Teacher-B -> school-B only.
Admin -> aggregate school data, no response-level learner access.
Try another role URL -> forbidden. Without login -> login. Without backend config -> login disabled with explanation.

## Remaining Phase 1 gates
Build/typecheck, actual Supabase migration and API tests, negative RLS tests, browser/accessibility verification; adult registration/recovery and robust login rate limiting; protected adult re-entry from child mode (currently supervised shared device); production secure-cookie config; multi-membership. Draft consent requires expert/legal review before real use.
See docs/phase-1-status.md. Do not advance to Phase 2 or claim pilot readiness.

