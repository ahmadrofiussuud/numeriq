# Phase 2 — content and reusable activities
Source authored 22 November 2026. Four components and 12 synthetic draft modules implemented. Review status remains NEEDS_REVIEW.

## Scope and traceability
| Requirement | Implementation | Scope |
|---|---|---|
| ST-05 / ENG-01 | src/domain/content.ts, src/content/modules.ts | 12 module IDs, typed schema, runtime validator, version/review gate; demo fixtures only |
| ST-06 / ENG-10 | src/components/activities/player.tsx | Supportive feedback, no fabricated grading |
| ST-08 / NFR-06/07 | player.tsx, activities.css, tests/browser | Keyboard controls, native range/radio, touch-sized controls, 390/1366 coverage |
| BR-20 / NFR-12 | content.ts, migration 202611220002 | Revision drops approval; published rows immutable; private scoring separate |
| PL-01 / ST-01 follow-up | actions.ts, supabase.ts, student/page.tsx | Child mode blocks adult routes/actions; return requires adult password |

## Activities
TenFrameActivity: ten toggle buttons, pressed state and live count.
NumberLineActivity: native slider, keyboard, min/max/step, increment buttons.
BaseTenBlocksActivity: add/remove tens and ones; bundle/unbundle preserves quantity.
ResponseChoiceActivity: native radio selection.
ActivityPlayer: schema-driven rendering, reset, completion acknowledgement, draft notice.
All examples currently contain one interaction per module. Choice matching/multi-step variants and content approval are not claimed complete.

## Routes and local run
npm install, then npm run dev. Open /demo/activities, then /demo/activities/NS-01 (or other ID).
The demo catalog deliberately works without Supabase and contains no user records. Authenticated learning remains separate and requires configured local Supabase.
No assessment persistence or server scoring before Phase 3. No progress stored in browser or database.

## Verification
Local: 27/27 domain tests PASS. npm DNS still fails; Docker absent on this host.
CI at PR #1 runs dependency resolution, typecheck, Next build and 8 browser checks. See actual GitHub run result before treating those checks as passed.
Additional database job starts temporary local Supabase and tests real RPC/RLS boundaries. Integration results pending at authoring time.
No deployment. No legal, pedagogical, screen-reader, or expert approval claimed.

## Phase 1 remaining scope
Adult registration/recovery, robust application rate limiting, multi-institution memberships and full lifecycle usability remain outstanding. Source migrations are not a production-ready security claim.
Runtime environment issue is isolated: GitHub API works, terminal DNS does not. origin points to the provided repository; source is synchronized via API branch because native fetch/push fails.

