import { test } from "node:test";
import assert from "node:assert/strict";
import { canReadChild, consentValid, resolveAccess, canStartChildSession } from "../src/domain/access.ts";
import type { Actor, Relation } from "../src/domain/access.ts";
const teacher: Actor = { id:"t1",role:"teacher",institutionId:"a",active:true };
const parent: Actor = { id:"p1",role:"parent",institutionId:null,active:true };
const child = { id:"c1",institutionId:"a" };
const relations: Relation[] = [
 {adultId:"t1",childId:"c1",kind:"teacher",active:true,verified:true},
 {adultId:"p1",childId:"c1",kind:"guardian",active:true,verified:true}
];
test("assigned teacher can access own tenant child",()=>assert.equal(canReadChild(teacher,child,relations),true));
test("teacher cannot cross tenant even with mismatched assignment",()=>assert.equal(canReadChild(teacher,{...child,institutionId:"b"},relations),false));
test("same tenant without assignment is denied",()=>assert.equal(canReadChild(teacher,child,[]),false));
test("inactive adult denied",()=>assert.equal(canReadChild({...teacher,active:false},child,relations),false));
test("admin cannot read individual learning records",()=>assert.equal(canReadChild({...teacher,role:"school"},child,relations),false));
test("verified guardian allowed",()=>assert.equal(canReadChild(parent,child,relations),true));
test("unverified guardian denied",()=>assert.equal(canReadChild(parent,child,relations.map(r=>({...r,verified:false}))),false));
test("guardian cannot select unrelated child",()=>assert.equal(canReadChild(parent,{...child,id:"c2"},relations),false));
test("withdrawal overrides previous consent",()=>assert.equal(consentValid([{status:"granted",version:"demo-v1",at:1},{status:"withdrawn",version:"demo-v1",at:2}],"demo-v1"),false));
test("old document consent not reused",()=>assert.equal(consentValid([{status:"granted",version:"old",at:1}],"demo-v1"),false));
test("school entitlement wins over home",()=>assert.equal(resolveAccess([{source:"home",active:true,starts:1,ends:100},{source:"school",active:true,starts:1,ends:100}],10),"school"));
test("expired or future entitlement denied",()=>assert.equal(resolveAccess([{source:"home",active:true,starts:20,ends:30},{source:"school",active:true,starts:1,ends:10}],10),null));
test("session needs consent and licensed access",()=>{
 const consent=[{status:"granted" as const,version:"demo-v1",at:1}];
 const access=[{source:"school" as const,active:true,starts:1,ends:100}];
 assert.equal(canStartChildSession(teacher,child,relations,consent,access,10),true);
 assert.equal(canStartChildSession(teacher,child,relations,[],access,10),false);
 assert.equal(canStartChildSession(teacher,child,relations,consent,[],10),false);
});

