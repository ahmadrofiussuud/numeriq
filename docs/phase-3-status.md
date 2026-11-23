# Phase 3 — assessment and response engine
Status: implementation in progress; verification pending. Synthetic fixtures only, NEEDS_REVIEW.
Changes: transactional assignment, immutable question versions, created/in_progress/completed/expired sessions, server-side scoring, hint tracking, idempotent responses, safe resume, teacher evidence view.
Authorization: relation + tenant snapshot + consent + entitlement + adult-bound child session rechecked server-side. Student DTO excludes scoring keys and correctness; teacher report explicitly authorized.
Source paths: migration 202611230003_assessments.sql; assessment-seed.sql; src/domain/assessment.ts; API routes; assessment-runner.tsx; teacher and student assessment pages; scripts/test-assessments.mjs; tests/auth/assessment.spec.ts.
PRD: TC-03/04, ST-03/04, ENG-01/02, BR-14/19/20/24, NFR-02/09/12/13/14; AT-03/05/06/10/16/18.
Version semantics: session pins set/item versions. Original responses are immutable even to direct privileged UPDATE; new content creates new versions.
Retry semantics: same response UUID and payload returns existing result; changed payload conflicts. New UUID for same item cannot add another score. A session lock serializes parallel submissions.
Hint usage is recorded by separate server mutation and copied into response; client cannot submit a hint flag or correctness.
One answer per item per assessment; subsequent learning attempts require another assignment. No BKT or misconception classification before Phase 4.
Local workstation disconnected during implementation. GitHub branch is authoritative for continued changes; latest remote work is not guaranteed in the Windows folder.
