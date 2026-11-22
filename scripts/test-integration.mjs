import {execFileSync} from "node:child_process";
import assert from "node:assert/strict";
const npx=process.platform==="win32"?"npx.cmd":"npx";
const config=JSON.parse(execFileSync(npx,["supabase","status","--output","json"],{encoding:"utf8"}));
const url=config.API_URL, anon=config.ANON_KEY, service=config.SERVICE_ROLE_KEY;
if(!url||!anon||!service||!["127.0.0.1","localhost"].includes(new URL(url).hostname))throw new Error("Expected local Supabase credentials.");
const password="Synthetic-only-"+Date.now()+"-Pass!";
execFileSync(process.execPath,["scripts/seed-users.mjs"],{env:{...process.env,SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:service,NUMERIQ_DEMO_PASSWORD:password},stdio:"pipe"});
async function request(path,token=anon,body,method){const r=await fetch(url+path,{method:method||(body===undefined?"GET":"POST"),headers:{apikey:anon,Authorization:"Bearer "+token,"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body)});const text=await r.text();return {ok:r.ok,status:r.status,data:text?JSON.parse(text):null};}
async function login(email){const r=await request("/auth/v1/token?grant_type=password",anon,{email,password});assert.equal(r.ok,true);return r.data.access_token;}
const teacher=await login("guru@numeriq.test"),other=await login("guru-b@numeriq.test"),parent=await login("wali@numeriq.test"),admin=await login("admin@numeriq.test");
const nara="20000000-0000-4000-8000-000000000001",bima="20000000-0000-4000-8000-000000000002",rani="20000000-0000-4000-8000-000000000003";
const rpc=(name,token,args={})=>request("/rest/v1/rpc/"+name,token,args);
let count=0;async function check(name,fn){await fn();console.log("PASS",name);count++;}
await check("teacher reads only assigned tenant",async()=>{const r=await rpc("list_my_children",teacher);assert.equal(r.ok,true);assert.deepEqual(r.data.map(x=>x.id).sort(),[nara,bima].sort());});
await check("other tenant filtered by RLS directly",async()=>{const r=await request("/rest/v1/students?select=id",other);assert.equal(r.ok,true);assert.deepEqual(r.data.map(x=>x.id),[rani]);});
await check("admin has aggregate but no individual student rows",async()=>{const r=await request("/rest/v1/students?select=id",admin);assert.deepEqual(r.data,[]);const s=await rpc("school_summary",admin);assert.equal(s.data.students,2);});
await check("guardian sees verified child only",async()=>{const r=await rpc("list_my_children",parent);assert.deepEqual(r.data.map(x=>x.id),[nara]);});
await check("no consent denies session",async()=>assert.equal((await rpc("start_child_session",teacher,{p_student:nara})).ok,false));
await check("guardian cannot grant consent for unrelated child",async()=>assert.equal((await rpc("record_consent",parent,{p_student:rani,p_status:"granted"})).ok,false));
await check("teacher cannot forge consent",async()=>assert.equal((await rpc("record_consent",teacher,{p_student:nara,p_status:"granted"})).ok,false));
await check("guardian grant enables school-funded child session",async()=>{assert.equal((await rpc("record_consent",parent,{p_student:nara,p_status:"granted"})).ok,true);const r=await rpc("list_my_children",parent);assert.equal(r.data[0].access,"school");assert.equal(r.data[0].consent,true);});
const session=(await rpc("start_child_session",teacher,{p_student:nara})).data;
await check("session is bound to initiating adult",async()=>{assert.equal((await rpc("read_child_session",teacher,{p_token:session})).ok,true);assert.equal((await rpc("read_child_session",parent,{p_token:session})).ok,false);});
await check("withdrawal revokes existing session",async()=>{assert.equal((await rpc("record_consent",parent,{p_student:nara,p_status:"withdrawn"})).ok,true);assert.equal((await rpc("read_child_session",teacher,{p_token:session})).ok,false);});
await check("cannot write learner or entitlement directly",async()=>{assert.equal((await request("/rest/v1/students?id=eq."+nara,teacher,{display_name:"tampered"},"PATCH")).ok,false);assert.equal((await request("/rest/v1/entitlements",parent,{student_id:nara,source:"home",starts_at:new Date().toISOString(),ends_at:new Date(Date.now()+99999).toISOString()})).ok,false);});
await check("private scoring inaccessible",async()=>assert.equal((await request("/rest/v1/item_scoring_versions?select=*",teacher)).ok,false));
console.log(count+" integration checks passed; local synthetic database only.");

