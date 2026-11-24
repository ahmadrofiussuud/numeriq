import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
export async function runLearningChecks({rpc,request,check,parent,teacher,other,admin,service,nara}){
 const assign=()=>({p_student:nara,p_set:"pattern-demo",p_version:1,p_key:randomUUID()});
 const created=await rpc("assign_assessment",teacher,assign());assert.equal(created.ok,true,JSON.stringify(created.data));const session=created.data;
 const token=(await rpc("start_child_session",teacher,{p_student:nara})).data;
 const base={p_session:session,p_token:token};
 const insight=()=>rpc("learning_insights",teacher,{p_student:nara});
 const probe=async()=>{const r=await insight();assert.equal(r.ok,true,JSON.stringify(r.data));return r.data};
 const pattern=async()=>{const d=await probe();return d.patterns.find(p=>p.error_code==="PLACE_VALUE_COMPOSE")};
 await check("P4 rule unknown before mapped response",async()=>assert.equal(await pattern(),undefined));
 await check("P4 one error yields insufficient evidence",async()=>{
 const response=await rpc("submit_assessment_response",teacher,{...base,p_response:randomUUID(),p_item:"PATTERN-01",p_version:1,p_answer:"five"});
 assert.equal(response.ok,true,JSON.stringify(response.data));
 const p=await pattern();assert.equal(p.state,"insufficient_evidence");assert.equal(p.distinct_items,1);assert.equal(p.rule_review,"NEEDS_REVIEW");assert.equal(p.activity,null);
 const row=(await probe()).timeline.find(r=>r.kc_id==="tens_ones_probe");assert.equal(row.model_version,1);assert.equal(row.parameter_review,"NEEDS_REVIEW");
 assert.ok(Math.abs(row.posterior-(.02/.66))<1e-12);assert.ok(Math.abs(row.mastery-(.02/.66+(1-.02/.66)*.1))<1e-12);
 });
 await check("P4 duplicate POST does not update BKT twice",async()=>{
 const existing=(await probe()).timeline.find(r=>r.kc_id==="tens_ones_probe");
 const result=await rpc("submit_assessment_response",teacher,{...base,p_response:existing.response_id,p_item:"PATTERN-01",p_version:1,p_answer:"five"});
 assert.equal(result.data.duplicate,true);assert.equal((await probe()).timeline.filter(r=>r.kc_id==="tens_ones_probe").length,1);
 });
 await check("P4 distinct item evidence opens teacher review",async()=>{
 const r=await rpc("submit_assessment_response",teacher,{...base,p_response:randomUUID(),p_item:"PATTERN-02",p_version:1,p_answer:"six"});
 assert.equal(r.ok,true,JSON.stringify(r.data));
 const d=await probe(),p=d.patterns.find(p=>p.error_code==="PLACE_VALUE_COMPOSE");assert.equal(p.state,"needs_review");assert.equal(p.distinct_items,2);assert.equal(p.response_ids.length,2);
 const rows=d.timeline.filter(r=>r.kc_id==="tens_ones_probe");assert.equal(rows.length,2);assert.equal(rows[1].prior,rows[0].mastery);
 const expected=(rows[0].mastery*.1)/(rows[0].mastery*.1+(1-rows[0].mastery)*.8);
 assert.ok(Math.abs(rows[1].posterior-expected)<1e-12);
 });
 const fields={p_student:nara,p_kc:"tens_ones_probe",p_code:"PLACE_VALUE_COMPOSE",p_rule:1,p_decision:"rejected",p_reason:"Bukti memerlukan konteks pengajaran sebelum disimpulkan.",p_corrected:null,p_key:randomUUID()};
 await check("P4 teacher rejection is an immutable annotation",async()=>{
 const a=await rpc("submit_teacher_review",teacher,fields);assert.equal(a.ok,true,JSON.stringify(a.data));
 const b=await rpc("submit_teacher_review",teacher,fields);assert.equal(b.data,a.data);
 const p=await pattern();assert.equal(p.state,"rejected");assert.equal(p.review_reason,fields.p_reason);
 assert.equal((await request("/rest/v1/teacher_reviews?id=eq."+a.data,service,{decision:"reviewed"},"PATCH")).ok,false);
 assert.equal((await request("/rest/v1/assessment_responses?id=eq."+p.response_ids[0],service,{correct:true},"PATCH")).ok,false);
 });
 await check("P4 correction appends without changing raw evidence",async()=>{
 const result=await rpc("submit_teacher_review",teacher,{...fields,p_key:randomUUID(),p_decision:"corrected",p_corrected:"PERLU_OBSERVASI",p_reason:"Guru menilai respons ini membutuhkan observasi tambahan."});
 assert.equal(result.ok,true,JSON.stringify(result.data));
 const p=await pattern();assert.equal(p.state,"corrected");assert.equal(p.corrected_code,"PERLU_OBSERVASI");assert.equal(p.distinct_items,2);
 });
 await check("P4 teacher review key cannot change payload",async()=>assert.equal((await rpc("submit_teacher_review",teacher,{...fields,p_reason:"Alasan berubah setelah ditinjau."})).ok,false));
 await check("P4 other tenant, guardian and school admin cannot read learning evidence",async()=>{
 for(const actor of [other,parent,admin])assert.equal((await rpc("learning_insights",actor,{p_student:nara})).ok,false);
 });
 await check("P4 unauthorized actors cannot submit review",async()=>{
 for(const actor of [other,parent,admin])assert.equal((await rpc("submit_teacher_review",actor,{...fields,p_key:randomUUID()})).ok,false);
 });
 await check("P4 private model tables and BKT helper are not user-readable",async()=>{
 assert.equal((await request("/rest/v1/model_parameters?select=*",teacher)).ok,false);
 assert.equal((await request("/rest/v1/learning_observations?select=*",teacher)).ok,false);
 assert.equal((await rpc("bkt_step",teacher,{p_prior:.2,p_learn:.1,p_guess:.2,p_slip:.1,p_correct:true})).ok,false);
 });
 await check("P4 parameter and rule edits require new versions",async()=>{
 assert.equal((await request("/rest/v1/model_parameters?kc_id=eq.tens_ones_probe",service,{p_init:.8},"PATCH")).ok,false);
 assert.equal((await request("/rest/v1/item_error_mappings?set_id=eq.pattern-demo",service,{error_code:"FORGED"},"PATCH")).ok,false);
 assert.equal((await request("/rest/v1/model_parameters",service,{kc_id:"tens_ones_probe",version:2,p_init:.7,p_learn:.1,p_guess:.2,p_slip:.1,review_status:"NEEDS_REVIEW"})).ok,true);
 assert.deepEqual((await probe()).timeline.filter(r=>r.kc_id==="tens_ones_probe").map(r=>r.model_version),[1,1]);
 });
 await check("P4 draft or unreviewed remediation never becomes suggestion",async()=>{
 const module=await request("/rest/v1/module_versions",service,{module_id:"PV-01",version:2,domain:"Place Value",title:"Latihan nilai tempat draft",status:"draft",review_status:"NEEDS_REVIEW",public_content:{}});
 assert.equal(module.ok,true,JSON.stringify(module.data));
 assert.equal((await request("/rest/v1/remediation_mappings",service,{kc_id:"tens_ones_probe",error_code:"PLACE_VALUE_COMPOSE",module_id:"PV-01",module_version:2,review_status:"NEEDS_REVIEW"})).ok,true);
 assert.equal((await pattern()).activity,null);
 });
 const second=(await rpc("assign_assessment",teacher,assign())).data,otherBase={p_session:second,p_token:token};
 await check("P4 unmapped answer remains unknown",async()=>{
 await rpc("submit_assessment_response",teacher,{...otherBase,p_response:randomUUID(),p_item:"PATTERN-01",p_version:1,p_answer:"thirtytwo"});
 const d=await probe(),rows=d.timeline.filter(r=>r.kc_id==="tens_ones_probe");assert.equal(rows.at(-1).error_code,null);
 assert.equal((await pattern()).distinct_items,2);
 });
 await check("P4 hinted response is recorded but excluded from mastery and pattern evidence",async()=>{
 await rpc("assessment_hint",teacher,{...otherBase,p_item:"PATTERN-02"});
 await rpc("submit_assessment_response",teacher,{...otherBase,p_response:randomUUID(),p_item:"PATTERN-02",p_version:1,p_answer:"six"});
 const rows=(await probe()).timeline.filter(r=>r.kc_id==="tens_ones_probe"),hinted=rows.at(-1);
 assert.equal(hinted.included,false);assert.equal(hinted.mastery,null);assert.equal((await pattern()).distinct_items,2);
 });
 await check("P4 withdrawal blocks new insight processing and review",async()=>{
 await rpc("record_consent",parent,{p_student:nara,p_status:"withdrawn"});
 assert.equal((await insight()).ok,false);
 assert.equal((await rpc("submit_teacher_review",teacher,{...fields,p_key:randomUUID()})).ok,false);
 await rpc("record_consent",parent,{p_student:nara,p_status:"granted"});
 });
}
