# Local operations runbook

## Guardian and consent

Only recipient-specific, unexpired, unused invites verify guardian links. Latest append-only consent wins. Withdrawal revokes child sessions and opens a pending `restrict` request. Re-grant does not silently close it.

## Privacy

Parent can request `export` or `delete`; duplicate open requests are rejected and direct table access is denied. Current build intentionally has no auto-delete or resolution console. Before resolution: authenticate requester, verify relationship, apply approved retention rules, record scope/approval, transfer securely or run approved deletion/anonymization, then audit the outcome.

## School capacity

School submits a reasoned request. Operator approval/rejection is audited. OD-04 is unresolved: approval is not an invoice or final add-on price.

## Sandbox payment

Price is server-owned. Active School access returns `school_included`. Exact raw-body HMAC is verified before service-role mutation. Order, amount and IDR currency are checked. Duplicate event is idempotent; changed replay is rejected. Failed payment creates no entitlement. Cancellation stops renewal. Overlap opens reconciliation, creates no second Home entitlement and never auto-refunds.

## Expiry/reconciliation

`expire_home_access` has no production scheduler. Define owner, cadence, retries, alerts and clock policy before pilot. Reconciliation waits for OD-05 and an approved operator procedure.

## Stop conditions

Stop processing and preserve minimal audit evidence on cross-tenant exposure, consent bypass, child-mode escape, duplicate response/payment state, client-controlled scoring/price, leaked secret, or draft represented as approved. Do not copy raw child answers into tickets unless strictly authorized.

## Monitoring required

Before pilot: external error destination, propagated request IDs, uptime/DB/auth/webhook/scheduler/privacy-aging alerts, named owners and retention. Current webhook request ID is not complete observability.