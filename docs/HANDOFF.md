# NUMERIQ engineering handoff

Kondisi akhir Phase 8: demo sintetis lokal, CI Phase 7 hijau, **BLOCKED untuk pilot anak nyata**, dan tidak dideploy.

## Peta dokumen

| Kebutuhan | Dokumen |
|---|---|
| Setup dari nol, env, akun, tes | `local-setup.md` |
| Arsitektur, ERD, migration, RPC | `technical-inventory.md` |
| Demo aman untuk juri/reviewer | `demo-script.md` |
| Consent, billing, privacy, admin | `operations-runbook.md` |
| QA AT-01..18 dan release gate | `phase-7-pilot-readiness.md` |
| Backup/restore | `backup-restore-plan.md` |
| Approval konten | `content-approval-checklist.md` |
| Requirement sumber | `NUMERIQ_PRD_MVP_v1.0.md`, `traceability.md` |

## Baseline yang diserahkan

- Stack: Next.js App Router + TypeScript + React, Supabase lokal Postgres/Auth/RLS, Playwright.
- Data hanya sintetis; konten, taxonomy, remediation dan BKT masih `NEEDS_REVIEW`.
- Direct domain writes deny-by-default; child mode supervised; tenant, assignment, guardian, consent dan entitlement diperiksa backend.
- Payment hanya sandbox lokal; tidak ada actual charge, live credential, auto-refund atau deployment.
- Verifikasi terakhir: 41 unit/reference, typecheck, build, 11 browser, Supabase reset, 81 integration/RLS/security/performance, dan 3 authenticated journeys.

## FR completed vs remaining

| Area | Completed synthetic | Partial / belum |
|---|---|---|
| Identity/access | adult login, role routing, guardian link, consent, supervised child session | registration, verification, recovery, multi-membership |
| School | summary, people, quota, teacher assignment, upgrade request | teacher invite/revoke UI, CSV import, invoice artifact |
| Teacher | assignment, report, evidence, BKT trajectory, immutable review | approved remediation and expert-approved model/content |
| Student | resume, hints, 4 activities, 12 draft modules, progress | target-child/device usability and accessibility |
| Parent | link, consent, progress, school-funded Home, sandbox Home, privacy requests | request-resolution console and approved deletion policy |
| Billing/operator | plans, capacity approval, signed idempotent webhook, cancel/expiry/reconciliation | live gateway, scheduler, refund/add-on rules, complete console |
| Operations | audit metadata, webhook request ID, QA docs, backup plan | external monitoring, restore drill, incident process |

## Blocking owners

1. Education Specialist: 12 modules and item/KC/error/remediation mappings.
2. AI/ML + Education: BKT parameters, hints and interpretation.
3. Legal/Privacy: guardian verification, consent, retention/deletion and incident duties.
4. Security: threat model, dependency review, penetration test, production secrets/cookies.
5. Product/Finance/Legal: OD-04 add-on, OD-05 overlap refund, OD-06 gateway.
6. UX Research: observed teacher, parent, child and screen-reader tests.

Do not relabel `NEEDS_REVIEW` or declare `READY_FOR_PILOT` without signed evidence.