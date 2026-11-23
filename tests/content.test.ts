import {test} from "node:test";
import assert from "node:assert/strict";
import {modules} from "../src/content/modules.ts";
import {validateModule,publicModule,reviseModule,regroup,moveOnLine} from "../src/domain/content.ts";
test("12 unique IDs, 3 domains, 4 components",()=>{assert.equal(modules.length,12);assert.equal(new Set(modules.map(m=>m.id)).size,12);assert.equal(new Set(modules.map(m=>m.domain)).size,3);assert.equal(new Set(modules.flatMap(m=>m.activities.map(a=>a.component))).size,4);});
test("all fixtures are valid NEEDS_REVIEW drafts",()=>{for(const m of modules){assert.equal(validateModule(m),m);assert.equal(m.status,"draft");assert.equal(m.reviewStatus,"NEEDS_REVIEW");}});
test("pilot rejects every draft",()=>{for(const m of modules)assert.throws(()=>publicModule(m,"pilot"));});
test("publication requires approval for same version",()=>{assert.throws(()=>validateModule({...modules[0],status:"published"}));assert.throws(()=>validateModule({...modules[0],status:"published",reviewStatus:"APPROVED",review:{reviewer:"test",reviewedAt:"2026-11-22",version:2}}));});
test("approved publication passes",()=>{assert.equal(publicModule({...modules[0],status:"published",reviewStatus:"APPROVED",review:{reviewer:"synthetic-reviewer",reviewedAt:"2026-11-22",version:1}},"pilot").status,"published");});
test("revision leaves old version immutable and drops approval",()=>{const old=JSON.stringify(modules[0]);const next=reviseModule(modules[0]);assert.equal(next.version,2);assert.equal(next.activities[0].version,2);assert.equal(next.review,undefined);assert.equal(JSON.stringify(modules[0]),old);});
test("public DTO never leaks answer/scoring/error config",()=>{const raw={...modules[0],answer:"secret",activities:[{...modules[0].activities[0],scoring_rule:"secret",error_mapping:{secret:true},config:{...modules[0].activities[0].config,answer:"secret"}}]};assert.equal(JSON.stringify(publicModule(raw,"demo")).includes("secret"),false);});
test("invalid ranges rejected",()=>{for(const config of [{min:0,max:10,step:0,initial:0},{min:0,max:10,step:1,initial:11},{min:0,max:11,step:1,initial:0}])assert.throws(()=>validateModule({...modules[0],activities:[{...modules[0].activities[0],config}]}));});
test("unknown component rejected",()=>assert.throws(()=>validateModule({...modules[0],activities:[{...modules[0].activities[0],component:"unknown"}]})));
test("duplicate options rejected",()=>{const m=modules[2];assert.throws(()=>validateModule({...m,activities:[{...m.activities[0],config:{...m.activities[0].config,options:[{id:"a",label:"4"},{id:"a",label:"7"}]}}]}));});
test("module and version mismatch rejected",()=>{assert.throws(()=>validateModule({...modules[0],activities:[{...modules[0].activities[0],moduleId:"PV-01"}]}));assert.throws(()=>validateModule({...modules[0],activities:[{...modules[0].activities[0],version:2}]}));});
test("regrouping preserves quantity",()=>{const b=regroup(2,3,"unbundle");assert.deepEqual(b,{tens:1,ones:13});assert.deepEqual(regroup(b.tens,b.ones,"bundle"),{tens:2,ones:3});});
test("regrouping cannot create negative blocks",()=>{assert.deepEqual(regroup(0,3,"unbundle"),{tens:0,ones:3});assert.deepEqual(regroup(1,3,"bundle"),{tens:1,ones:3});assert.throws(()=>regroup(-1,0,"bundle"));});
test("number line bounds and steps",()=>{assert.equal(moveOnLine(0,-1,0,10,1),0);assert.equal(moveOnLine(10,1,0,10,1),10);assert.equal(moveOnLine(20,1,0,50,10),30);});

