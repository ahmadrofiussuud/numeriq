"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { api, actor, rpc } from "../server/supabase";
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

