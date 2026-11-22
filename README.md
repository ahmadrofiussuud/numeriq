# NUMERIQ — Phase 2 learning foundation
Local-only, synthetic data. Next typecheck/build passed in GitHub Actions. Four activity components and 12 draft modules are available at /demo/activities. Database and final browser results are tracked in docs/phase-2-status.md.

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
No real assessment scoring, BKT, billing, or clinical claims are implemented. Phase 2 fixtures are synthetic and NEEDS_REVIEW; they do not store learner responses.

## Demo flow
Parent sign-in -> inspect Nara -> grant draft demo consent -> open child session -> child shell -> return to adult.
Use printed invite -> verify Bima -> grant consent. Withdraw consent -> future child session reads denied.
Teacher -> only assigned school-A children. Teacher-B -> school-B only.
Admin -> aggregate school data, no response-level learner access.
Try another role URL -> forbidden. Without login -> login. Without backend config -> login disabled with explanation.

## Current verification and remaining gates
Phase 2 was authorized by PM. Child-mode return now requires adult password; child-mode cookies also block adult routes and actions. Typecheck/build passed on GitHub Actions; local dependency installation is still blocked by terminal DNS.
Remaining: actual Supabase migration/API tests, full authenticated browser flow, screen-reader review, adult registration/recovery, robust application rate limits, production cookie policy and multi-membership. Draft consent requires review before real use.
See docs/phase-2-status.md for current status; docs/phase-1-status.md is the earlier checkpoint. No pilot readiness claim.

## Repository
https://github.com/ahmadrofiussuud/numeriq — work branch codex/phase-2-learning, draft PR #1. No deployment configured.
Terminal Git DNS fails in the current sandbox, so source was synchronized through the connected GitHub API. Local origin is configured, but remote history has not been fetched. Once Git connectivity works, clone the work branch into a new directory to obtain the canonical commit history; do not force-push an unrelated local history.

