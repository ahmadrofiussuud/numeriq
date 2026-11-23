export type Role = "school" | "teacher" | "parent";
export type Actor = { id: string; role: Role; institutionId: string | null; active: boolean };
export type Child = { id: string; institutionId: string | null };
export type Relation = { adultId: string; childId: string; kind: "teacher" | "guardian"; active: boolean; verified: boolean };
export function canReadChild(actor: Actor, child: Child, relations: Relation[]): boolean {
  if (!actor.active || actor.role === "school") return false;
  return relations.some(r => r.adultId === actor.id && r.childId === child.id && r.active &&
    (actor.role === "parent" ? r.kind === "guardian" && r.verified :
      r.kind === "teacher" && actor.institutionId !== null && actor.institutionId === child.institutionId));
}
export type Consent = { status: "granted" | "withdrawn"; version: string; at: number };
export function consentValid(ledger: Consent[], version: string): boolean {
  const latest = ledger.filter(x => x.version === version).sort((a,b) => b.at-a.at)[0];
  return latest?.status === "granted";
}
export type Entitlement = { source: "school" | "home"; active: boolean; starts: number; ends: number };
export function resolveAccess(entries: Entitlement[], now: number): "school" | "home" | null {
  const active = entries.filter(e => e.active && e.starts <= now && e.ends > now);
  return active.some(e => e.source === "school") ? "school" : active.some(e => e.source === "home") ? "home" : null;
}
export function canStartChildSession(actor: Actor, child: Child, relations: Relation[], ledger: Consent[], entitlements: Entitlement[], now: number): boolean {
  return canReadChild(actor, child, relations) && consentValid(ledger, "demo-v1") && resolveAccess(entitlements, now) !== null;
}

