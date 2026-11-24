# Phase 7 - pilot-readiness report

## Keputusan gate

**BLOCKED — belum READY_FOR_PILOT dan bukan production-ready.** Engine dan alur sintetis dapat didemokan secara lokal, tetapi pilot dengan anak nyata belum boleh dimulai. Blocking approvals: 12 modul dan taxonomy oleh Education Specialist; parameter BKT dan hint oleh AI/ML + ahli; consent, retensi, verifikasi wali, serta data request oleh legal/privacy; security review; usability teramati pada anak, guru, dan wali; serta keputusan produk OD-04/05/06 untuk billing live.

## Audit acceptance AT-01..AT-18

| ID | Status engineering | Bukti / sisa gate |
|---|---|---|
| AT-01 | PASS synthetic | quota transaction + integration check |
| AT-02 | PASS synthetic | school-funded Home browser journey; checkout blocked |
| AT-03 | PASS synthetic | consent blocks assignment/session/read/write |
| AT-04 | PASS synthetic | verified guardian relation and invite checks |
| AT-05 | PASS | cross-tenant RPC/RLS checks |
| AT-06 | PASS | response idempotency/concurrency checks |
| AT-07 | PASS synthetic | one error remains `insufficient_evidence`; expert validity pending |
| AT-08 | PASS reference math | deterministic BKT tests; parameter approval pending |
| AT-09 | PASS synthetic | immutable rejection annotation |
| AT-10 | PASS | response pins item version |
| AT-11 | PASS synthetic | 12 draft modules and persisted progress |
| AT-12 | PASS sandbox | duplicate/conflicting webhook tests |
| AT-13 | PASS sandbox | failed payment gives no entitlement |
| AT-14 | PASS backend | expired entitlement blocks access; operational scheduler pending |
| AT-15 | PASS scoped cases | cross-tenant mutations denied; independent security review pending |
| AT-16 | PASS | resume and duplicate-item checks |
| AT-17 | PARTIAL | keyboard skip, labelled controls, reduced motion, coarse touch and 390px smoke automated; manual screen-reader/device/usability audit pending |
| AT-18 | PASS workflow, legal pending | withdrawal revokes sessions and creates restriction request; retention/deletion policy requires legal approval |

## P0 audit

Core supervised learning, assessment, evidence, four-role flow, entitlement, sandbox billing, consent, privacy request ledger, and isolation tests exist. P0 remains incomplete for production/pilot: CSV student import and robust invite administration, account recovery/verification, published expert-approved content, operational request-resolution console, automated expiry scheduler, real monitoring destination, tested restore drill, and observed usability/accessibility validation.

## Security and privacy boundary

- Direct domain-table mutation remains deny-by-default; privileged operations use actor-validated RPCs.
- Child sessions are short, adult-bound, and recheck consent plus entitlement.
- Billing webhook verifies HMAC before service-role mutation and returns a request ID; secrets remain server-only.
- Audit/privacy records contain metadata, not raw child answers. Data deletion is never automatic.
- No critical/high defect is currently known from automated synthetic checks. This is not a penetration-test conclusion.

## Bug register

| Severity | Item | Disposition |
|---|---|---|
| High gate | Draft educational content and model parameters unapproved | Blocks pilot; human approval required |
| High gate | Legal/privacy policy, retention, age/guardian verification unapproved | Blocks pilot |
| Medium | Data-request resolution has no operator UI/SLA | Manual DB-safe procedure only; implement before pilot |
| Medium | Subscription expiry has no scheduler | RPC exists; operations schedule required |
| Medium | Accessibility lacks real screen-reader/device review | Conduct moderated tests |
| Low | Local Windows dependency install can leave locked `node_modules` | CI is authoritative; document clean setup in Phase 8 |

## Pilot package contents

Use synthetic accounts only. Include PRD, this report, content checklist, backup/restore plan, CI result, consent copy, test traceability, and a signed approval sheet. Stop immediately on cross-tenant exposure, consent bypass, duplicate state mutation, clinical wording, or unreviewed content shown as approved.

## Release checklist

- [x] Automated unit, build, database, RLS/integration, browser checks configured.
- [x] Payment sandbox and no-double-entitlement checks.
- [x] Synthetic-data and non-diagnosis labels.
- [ ] All P0 functional gaps closed.
- [ ] 12 modules, taxonomy, remediation, BKT and hint rules approved.
- [ ] Legal/privacy, retention and guardian-verification approval.
- [ ] Security review and restore drill evidence.
- [ ] Teacher, parent and child usability; screen-reader and target-device testing.
- [ ] PM signs `READY_FOR_PILOT` after reviewing evidence.

Production deployment is explicitly out of scope.
