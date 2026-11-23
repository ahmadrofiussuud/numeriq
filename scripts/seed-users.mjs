// Local-only fixture provisioning. Uses built-in Node fetch, no npm dependencies.
import { randomBytes, createHash } from "node:crypto";
const url=process.env.SUPABASE_URL||"http://127.0.0.1:54321";
if(!["127.0.0.1","localhost"].includes(new URL(url).hostname)) throw new Error("Local only.");
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!key) throw new Error("Set local SUPABASE_SERVICE_ROLE_KEY from supabase status; never put it in browser config.");
const password=process.env.NUMERIQ_DEMO_PASSWORD;
if(!password||password.length<12) throw new Error("Set NUMERIQ_DEMO_PASSWORD (12+ characters).");
async function send(path,body){const res=await fetch(url+path,{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(body)});if(!res.ok)throw new Error(path+": "+res.status);const text=await res.text();return text?JSON.parse(text):null;}
const a="10000000-0000-4000-8000-000000000001", b="10000000-0000-4000-8000-000000000002";
const nara="20000000-0000-4000-8000-000000000001", bima="20000000-0000-4000-8000-000000000002", rani="20000000-0000-4000-8000-000000000003";
for(const [email,name,role,institution] of [
 ["admin@numeriq.test","Dina Demo","school",a],["guru@numeriq.test","Raka Demo","teacher",a],["wali@numeriq.test","Sari Demo","parent",null],["guru-b@numeriq.test","Tia Demo","teacher",b]
]){
 const user=await send("/auth/v1/admin/users",{email,password,email_confirm:true});
 await send("/rest/v1/profiles",{id:user.id,display_name:name,role,institution_id:institution});
 if(role==="teacher")await send("/rest/v1/teacher_students",institution===a?[{teacher_id:user.id,student_id:nara},{teacher_id:user.id,student_id:bima}]:[{teacher_id:user.id,student_id:rani}]);
 if(role==="parent"){
  await send("/rest/v1/guardian_students",{guardian_id:user.id,student_id:nara,verified:true,active:true});
  const token=randomBytes(24).toString("hex");
  await send("/rest/v1/guardian_invites",{recipient_id:user.id,student_id:bima,token_hash:createHash("sha256").update(token).digest("hex"),expires_at:new Date(Date.now()+86400000).toISOString()});
  console.log("Synthetic invitation for Bima (one use, 24h):",token);
 }
 console.log("Created synthetic account:",email);
}
console.log("No consent seeded. Use parent account to grant demo consent.");

