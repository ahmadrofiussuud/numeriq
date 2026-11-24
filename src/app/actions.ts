"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { api, actor, rpc } from "../server/supabase";
import {isUuid} from "../domain/assessment";
export async function assignAssessment(form:FormData){
 await checkOrigin();await requireAdultMode();const current=await actor();
 if(!current||current.role!=="teacher")redirect("/forbidden");
 const student=String(form.get("student")),key=String(form.get("assignmentKey")),set=String(form.get("set")||"numeracy-demo");
 if(!isUuid(student)||!isUuid(key)||!["numeracy-demo","pattern-demo"].includes(set))redirect("/teacher/assessments?error=1");
 let assigned:string;
 try{assigned=await rpc("assign_assessment",current.token,{p_student:student,p_set:set,p_version:1,p_key:key});}catch{redirect("/teacher/assessments?error=1");}
 redirect("/teacher/assessments?assigned="+encodeURIComponent(assigned));
}
async function checkOrigin() {
 const origin=(await headers()).get("origin");
 if(origin!==(process.env.APP_ORIGIN||"http://127.0.0.1:3000")) throw new Error("Origin tidak diizinkan.");
}
async function requireAdultMode() {
 if((await cookies()).get("numeriq_child_lock")?.value) redirect("/student");
}
export async function signIn(form:FormData) {
 await checkOrigin();
 let auth;
 try { auth=await api("/auth/v1/token?grant_type=password",undefined,{email:String(form.get("email")||"").trim(),password:String(form.get("password")||"")}); }
 catch { redirect("/login?error=1"); }
 (await cookies()).set("numeriq_access",auth.access_token,{httpOnly:true,sameSite:"strict",secure:false,path:"/",maxAge:Math.min(auth.expires_in||3600,3600)});
 (await cookies()).delete("numeriq_child");
 (await cookies()).delete("numeriq_child_lock");
 const current=await actor();
 if(!current) { (await cookies()).delete("numeriq_access"); redirect("/login?error=1"); }
 redirect("/"+current.role);
}
export async function signOut() {
 await checkOrigin();
 const current=await actor();
 if(current) { try { await api("/auth/v1/logout",current.token,{}); } catch {} }
 const jar=await cookies();jar.delete("numeriq_access");jar.delete("numeriq_child");jar.delete("numeriq_child_lock");
 redirect("/login");
}
export async function recordConsent(form:FormData) {
 await requireAdultMode();
 await checkOrigin();
 const current=await actor();if(!current || current.role!=="parent") redirect("/forbidden");
 if(form.get("consent")!=="granted" && form.get("consent")!=="withdrawn") throw new Error("Status tidak valid.");
 await rpc("record_consent",current.token,{p_student:String(form.get("student")),p_status:String(form.get("consent"))});
 redirect("/parent?updated=1");
}
export async function claimInvite(form:FormData) {
 await requireAdultMode();
 await checkOrigin();
 const current=await actor();if(!current || current.role!=="parent") redirect("/forbidden");
 try { await rpc("claim_guardian_invite",current.token,{p_token:String(form.get("code")||"")}); }
 catch { redirect("/parent?invite_error=1"); }
 redirect("/parent?updated=1");
}
export async function startChild(form:FormData) {
 await requireAdultMode();
 await checkOrigin();const current=await actor();if(!current) redirect("/login");
 let session;
 try { session=await rpc("start_child_session",current.token,{p_student:String(form.get("student"))}); }
 catch { redirect("/"+current.role+"?blocked=1"); }
 (await cookies()).set("numeriq_child",session,{httpOnly:true,sameSite:"strict",secure:false,path:"/",maxAge:900});
 (await cookies()).set("numeriq_child_lock","1",{httpOnly:true,sameSite:"strict",secure:false,path:"/",maxAge:3600});
 redirect("/student");
}
export async function endChild(form:FormData) {
 await checkOrigin();const current=await actor();if(!current) redirect("/login");
 let verified;
 try { verified=await api("/auth/v1/token?grant_type=password",undefined,{email:current.email,password:String(form.get("password")||"")}); }
 catch { redirect("/student?reauth_error=1"); }
 if(verified.user.id!==current.id) redirect("/student?reauth_error=1");
 const jar=await cookies();const token=jar.get("numeriq_child")?.value;
 if(token) await rpc("end_child_session",current.token,{p_token:token});
 jar.delete("numeriq_child");jar.delete("numeriq_child_lock");
 jar.set("numeriq_access",verified.access_token,{httpOnly:true,sameSite:"strict",secure:false,path:"/",maxAge:3600});
 redirect("/"+current.role);
}


export async function reviewEvidence(form:FormData){
 await checkOrigin();await requireAdultMode();const current=await actor();
 if(!current||current.role!=="teacher")redirect("/forbidden");
 const student=String(form.get("student")||""),key=String(form.get("reviewKey")||"");
 const kc=String(form.get("kc")||""),code=String(form.get("code")||""),rule=Number(form.get("rule"));
 const decision=String(form.get("decision")||""),reason=String(form.get("reason")||"").trim();
 const corrected=decision==="corrected"?String(form.get("corrected")||"").trim():null;
 if(!isUuid(student)||!isUuid(key)||!["reviewed","rejected","corrected"].includes(decision)
    ||!Number.isSafeInteger(rule)||rule<1||kc.length>100||code.length>80||reason.length<10||reason.length>500
    ||(corrected!==null&&(corrected.length<2||corrected.length>80||corrected===code)))
    redirect("/teacher/insights/"+encodeURIComponent(student)+"?error=1");
 try{await rpc("submit_teacher_review",current.token,{p_student:student,p_kc:kc,p_code:code,p_rule:rule,p_decision:decision,p_reason:reason,p_corrected:corrected,p_key:key});}
 catch{redirect("/teacher/insights/"+student+"?error=1");}
 redirect("/teacher/insights/"+student+"?updated=1");
}

export async function setSchoolSeat(form:FormData){
 await checkOrigin();await requireAdultMode();const current=await actor();if(!current||current.role!=="school")redirect("/forbidden");
 const student=String(form.get("student")||""),key=String(form.get("eventKey")||""),active=String(form.get("active"))==="true";
 if(!isUuid(student)||!isUuid(key))redirect("/school/people?error=seat");
 try{await rpc("school_set_seat",current.token,{p_student:student,p_active:active,p_key:key});}catch{redirect("/school/people?error=seat");}
 redirect("/school/people?updated=seat");
}
export async function assignTeacher(form:FormData){
 await checkOrigin();await requireAdultMode();const current=await actor();if(!current||current.role!=="school")redirect("/forbidden");
 const student=String(form.get("student")||""),teacher=String(form.get("teacher")||""),assigned=String(form.get("assigned"))==="true";
 if(!isUuid(student)||!isUuid(teacher))redirect("/school/people?error=teacher");
 try{await rpc("school_assign_teacher",current.token,{p_student:student,p_teacher:teacher,p_assigned:assigned});}catch{redirect("/school/people?error=teacher");}
 redirect("/school/people?updated=teacher");
}
export async function requestSeatChange(form:FormData){
 await checkOrigin();await requireAdultMode();const current=await actor();if(!current||current.role!=="school")redirect("/forbidden");
 const capacity=Number(form.get("capacity")),reason=String(form.get("reason")||"").trim();
 if(!Number.isSafeInteger(capacity)||capacity<1||reason.length<10||reason.length>500)redirect("/school/people?error=request");
 try{await rpc("request_seat_change",current.token,{p_capacity:capacity,p_reason:reason});}catch{redirect("/school/people?error=request");}
 redirect("/school/people?updated=request");
}
export async function assignLearningActivity(form:FormData){
 await checkOrigin();await requireAdultMode();const current=await actor();if(!current||current.role!=="teacher")redirect("/forbidden");
 const student=String(form.get("student")||""),module=String(form.get("module")||""),key=String(form.get("assignmentKey")||"");
 if(!isUuid(student)||!isUuid(key)||!/^(NS|PV|AR)-0[1-4]$/.test(module))redirect("/teacher/assessments?error=1");
 try{await rpc("assign_activity",current.token,{p_student:student,p_module:module,p_version:1,p_key:key});}catch{redirect("/teacher/assessments?error=1");}
 redirect("/teacher/insights/"+student+"?assigned=1");
}
export async function completeLearningModule(form:FormData){
 await checkOrigin();const current=await actor();if(!current)redirect("/login");
 const jar=await cookies(),token=jar.get("numeriq_child")?.value,module=String(form.get("module")||""),key=String(form.get("completionKey")||"");
 if(!token||!isUuid(key)||!/^(NS|PV|AR)-0[1-4]$/.test(module))redirect("/student?module_error=1");
 try{await rpc("complete_module",current.token,{p_token:token,p_module:module,p_version:1,p_key:key});}catch{redirect("/student?module_error=1");}
 redirect("/student?completed="+module);
}
