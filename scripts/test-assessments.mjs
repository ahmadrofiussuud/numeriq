import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
export async function runAssessmentChecks({rpc,request,check,parent,teacher,other,admin,service,nara,rani}){
 const assignment=()=>({p_student:nara,p_set:"numeracy-demo",p_version:1,p_key:randomUUID()});
 await check("P3 no consent blocks assignment",async()=>assert.equal((await rpc("assign_assessment",teacher,assignment())).ok,false));
 await rpc("record_consent",parent,{p_student:nara,p_status:"granted"});
 await check("P3 cross-tenant assignment denied",async()=>assert.equal((await rpc("assign_assessment",other,assignment())).ok,false));
 await check("P3 school parent cannot impersonate teacher assignment",async()=>assert.equal((await rpc("assign_assessment",parent,assignment())).ok,false));
 await check("P3 unreviewed content gated outside synthetic mode",async()=>{
 assert.equal((await request("/rest/v1/assessment_config?id=eq.true",service,{allow_synthetic:false},"PATCH")).ok,true);
 assert.equal((await rpc("assign_assessment",teacher,assignment())).ok,false);
 await request("/rest/v1/assessment_config?id=eq.true",service,{allow_synthetic:true},"PATCH");
 });
 const args=assignment();const created=await rpc("assign_assessment",teacher,args);assert.equal(created.ok,true,JSON.stringify(created.data));const id=created.data;
 await check("P3 repeated assignment key returns same session",async()=>assert.equal((await rpc("assign_assessment",teacher,args)).data,id));
 const token=(await rpc("start_child_session",teacher,{p_student:nara})).data;
 const base={p_session:id,p_token:token};const response=randomUUID();
 await check("P3 internal session helper cannot be called directly",async()=>assert.equal((await rpc("guard_assessment",teacher,base)).ok,false));
 const first={...base,p_response:response,p_item:"DEMO-01",p_version:1,p_answer:"three"};
 await check("P3 read pins version and hides keys",async()=>{const r=await rpc("read_assessment",teacher,base);assert.equal(r.ok,true,JSON.stringify(r.data));assert.equal(r.data.item.version,1);assert.equal(r.data.answered,0);assert.equal(JSON.stringify(r.data).includes("correct_option"),false);});
 await check("P3 wrong child token denied",async()=>assert.equal((await rpc("read_assessment",teacher,{...base,p_token:"invalid"})).ok,false));
 await check("P3 cannot skip ahead",async()=>assert.equal((await rpc("submit_assessment_response",teacher,{...first,p_item:"DEMO-02",p_answer:"twentythree"})).ok,false));
 await check("P3 stale item version rejected",async()=>assert.equal((await rpc("submit_assessment_response",teacher,{...first,p_version:2})).ok,false));
 await check("P3 unknown option does not create response",async()=>{assert.equal((await rpc("submit_assessment_response",teacher,{...first,p_answer:"bogus"})).ok,false);assert.equal((await rpc("read_assessment",teacher,base)).data.answered,0);});
 await check("P3 hint recorded server-side",async()=>{const r=await rpc("assessment_hint",teacher,{...base,p_item:"DEMO-01"});assert.equal(r.ok,true);assert.equal((await rpc("read_assessment",teacher,base)).data.item.hint_used,true);});
 await check("P3 concurrent retry creates one immutable response",async()=>{
 const results=await Promise.all([rpc("submit_assessment_response",teacher,first),rpc("submit_assessment_response",teacher,first)]);
 results.forEach(r=>assert.equal(r.ok,true,JSON.stringify(r.data)));
 assert.equal(results.filter(r=>r.data.duplicate===false).length,1);
 assert.equal((await rpc("read_assessment",teacher,base)).data.answered,1);
 });
 await check("P3 same key with changed payload rejected",async()=>assert.equal((await rpc("submit_assessment_response",teacher,{...first,p_answer:"two"})).ok,false));
 await check("P3 fresh key cannot duplicate same item",async()=>{const r=await rpc("submit_assessment_response",teacher,{...first,p_response:randomUUID()});assert.equal(r.data.response_id,response);assert.equal(r.data.duplicate,true);});
 await check("P3 resume retrieves next unanswered item",async()=>{const r=await rpc("read_assessment",teacher,base);assert.equal(r.data.status,"in_progress");assert.equal(r.data.item.id,"DEMO-02");assert.equal(r.data.answered,1);});
 await check("P3 private scoring and direct response writes denied",async()=>{
 assert.equal((await request("/rest/v1/assessment_items?select=correct_option",teacher)).ok,false);
 assert.equal((await request("/rest/v1/assessment_responses?id=eq."+response,teacher,{correct:false},"PATCH")).ok,false);
 assert.equal((await request("/rest/v1/assessment_responses?id=eq."+response,service,{correct:false},"PATCH")).ok,false);
 });
 await check("P3 changed item version cannot rewrite history",async()=>{
 assert.equal((await request("/rest/v1/assessment_items?item_id=eq.DEMO-01",service,{correct_option:"two"},"PATCH")).ok,false);
 assert.equal((await request("/rest/v1/assessment_sets",service,{id:"numeracy-demo",version:2,title:"Revised synthetic set",review_status:"NEEDS_REVIEW",synthetic:true})).ok,true);
 assert.equal((await request("/rest/v1/assessment_items",service,{set_id:"numeracy-demo",set_version:2,item_id:"DEMO-01",item_version:2,position:1,kc_id:"quantity_symbol",prompt:"New version",options:[{id:"two",label:"2"},{id:"three",label:"3"}],correct_option:"two"})).ok,true);
 assert.equal((await rpc("assessment_report",teacher,{p_session:id})).data.responses[0].item_version,1);
 });
 await check("P3 completion and scoring remain server owned",async()=>{
 await rpc("submit_assessment_response",teacher,{...base,p_response:randomUUID(),p_item:"DEMO-02",p_version:1,p_answer:"five"});
 await rpc("submit_assessment_response",teacher,{...base,p_response:randomUUID(),p_item:"DEMO-03",p_version:1,p_answer:"five"});
 const view=await rpc("read_assessment",teacher,base);assert.equal(view.data.status,"completed");assert.equal(view.data.answered,3);assert.equal(view.data.item,null);
 const report=await rpc("assessment_report",teacher,{p_session:id});assert.equal(report.ok,true,JSON.stringify(report.data));assert.deepEqual(report.data.responses.map(r=>r.correct),[true,false,true]);assert.equal(report.data.responses[0].hint_used,true);assert.deepEqual(report.data.responses.map(r=>r.sequence),[1,2,3]);
 });
 await check("P3 replay after completion is idempotent",async()=>assert.equal((await rpc("submit_assessment_response",teacher,first)).data.duplicate,true));
 await check("P3 report denies other tenant parent and admin",async()=>{for(const actor of [other,parent,admin])assert.equal((await rpc("assessment_report",actor,{p_session:id})).ok,false);});
 const nextId=(await rpc("assign_assessment",teacher,assignment())).data;
 const next={...first,p_session:nextId};
 await check("P3 global response key cannot be reused in another session",async()=>assert.equal((await rpc("submit_assessment_response",teacher,next)).ok,false));
 await check("P3 expiry closes session without deleting history",async()=>{
 await request("/rest/v1/assessment_sessions?id=eq."+nextId,service,{expires_at:"2020-01-01T00:00:00Z"},"PATCH");
 assert.equal((await rpc("read_assessment",teacher,{...base,p_session:nextId})).data.status,"expired");
 const r=await rpc("submit_assessment_response",teacher,{...next,p_response:randomUUID()});assert.equal(r.data.accepted,false);
 });
 const third=(await rpc("assign_assessment",teacher,assignment())).data;
 await check("P3 withdrawal blocks mid-session read and write",async()=>{
 await rpc("record_consent",parent,{p_student:nara,p_status:"withdrawn"});
 assert.equal((await rpc("read_assessment",teacher,{...base,p_session:third})).ok,false);
 assert.equal((await rpc("submit_assessment_response",teacher,{...first,p_session:third,p_response:randomUUID()})).ok,false);
 });
 await rpc("record_consent",parent,{p_student:nara,p_status:"granted"});
 await check("P3 inactive entitlement blocks new assignments",async()=>{
 await request("/rest/v1/entitlements?student_id=eq."+nara,service,{active:false},"PATCH");
 assert.equal((await rpc("assign_assessment",teacher,assignment())).ok,false);
 await request("/rest/v1/entitlements?student_id=eq."+nara,service,{active:true},"PATCH");
 });
}
