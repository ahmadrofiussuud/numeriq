# Phase 4 — learning evidence, BKT, and teacher oversight

Status: implemented and CI verified on 23 November 2026 in draft PR #3. All rules, parameters, and content are synthetic and marked NEEDS_REVIEW.

## Implemented scope
- Deterministic server-side option-to-error mapping pinned to set, item, and rule versions. Unmapped answers remain unknown.
- Distinct-item evidence threshold: one wrong answer stays `insufficient_evidence`; at least two different items can become `needs_review`.
- Classical BKT per knowledge component with versioned `p_init`, `p_learn`, `p_guess`, and `p_slip`.
- Immutable learning observation per response ID. Duplicate response delivery cannot update mastery twice.
- Responses using a hint are recorded for evidence history but excluded from BKT and persistent-pattern counts under the provisional OD-03 rule.
- Immutable teacher decisions: reviewed, rejected, or corrected. New decisions append history and never change the raw response.
- Teacher evidence UI with provisional pattern state, response IDs/count, model/rule versions, rounded mastery estimate, and nonclinical copy.
- Versioned remediation mapping that exposes only activities whose mapping and module are both approved/published. Otherwise the UI gives an explicit no-approved-activity fallback.
- Direct link to the assessment session created by a teacher assignment, avoiding ambiguity when prior sessions exist.

## Verification evidence
GitHub Actions run #45185668733 passed on commit e9253fbf:
- 39 domain/math tests passed, including reference BKT calculations, zero denominator handling, hinted exclusion, and deterministic replay.
- TypeScript and production build passed.
- 9 browser tests for reusable activities passed.
- Supabase migrations and synthetic seeds reset successfully.
- 52 database integration checks passed, including cross-tenant denial, unknown error mapping, one-item insufficient evidence, two-item threshold, exact-once BKT, immutable versions, consent withdrawal, review idempotency, and private helper denial.
- 2 authenticated browser journeys passed: the complete Phase 3 assessment flow and the Phase 4 pattern/review flow.

## Safety and interpretation limits
- No diagnosis, clinical risk score, or claim of dyscalculia is generated.
- Mastery is displayed as an estimate with model version and NEEDS_REVIEW status.
- Error taxonomy, evidence threshold, hinted-response treatment, BKT priors, and remediation mappings need expert validation under OD-02 and OD-03.
- No remediation activity is automatically suggested from the synthetic unreviewed mapping.
- Synthetic seeds are for local development only. No student data, deployment, merge, or production activation is included.

## Source map
- Migration: `supabase/migrations/202611230004_learning_engine.sql`
- Synthetic fixtures: `supabase/learning-seed.sql`
- Reference math: `src/domain/bkt.ts`
- Teacher evidence UI: `src/app/teacher/insights/[student]/page.tsx`
- Database tests: `scripts/test-learning.mjs`
- Browser flow: `tests/auth/learning.spec.ts`

The Windows folder remains a stale uncommitted copy because local Git cannot reach GitHub. The remote branch `codex/phase-4-learning-engine` is authoritative.
