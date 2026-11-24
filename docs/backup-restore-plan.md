# Backup and restore plan — pilot draft

Status: procedure draft; no production backup exists and no restore drill has been signed off.

## Scope and controls

Back up Postgres schema/data, auth identities, migration history and versioned content. Keep secrets outside dumps. Encrypt backups, restrict operators, record backup/restore audit metadata, and define retention only after OD-07 legal/privacy review. Never copy real child data into developer machines.

## Local synthetic drill

1. Confirm the target project is `numeriq-local` and contains synthetic data only.
2. Record migration head and test timestamp.
3. Create a Postgres dump using the local Supabase database credentials into an encrypted, access-restricted location.
4. Start a separate empty recovery instance; never overwrite the source during a drill.
5. Apply repository migrations, restore the dump, then run `node scripts/test-integration.mjs`.
6. Verify row counts, immutable response/payment events, tenant isolation, consent state, and active entitlement resolution.
7. Record RPO/RTO, checksums, operator, failures and cleanup. Destroy the temporary recovered synthetic instance.

## Pilot gate

Before real pilot data: owner, frequency, retention, geographic location, encryption/key rotation, breach process, RPO/RTO and deletion interaction require Security + Legal/Privacy approval. At least one witnessed restore drill must pass. Repository migrations and seed are not a substitute for a data backup.
