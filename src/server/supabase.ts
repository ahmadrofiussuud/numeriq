import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export function configuration() {
 const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_ANON_KEY;
 if(!url || !key) return null;
 const parsed=new URL(url);
 if(!["127.0.0.1","localhost"].includes(parsed.hostname) && !(parsed.protocol==="https:" && parsed.hostname==="mwaipvjzdbypqewzrvfg.supabase.co")) throw new Error("Phase 1 hanya memakai Supabase lokal.");
 return {url,key};
}
export async function api(path:string, token?:string, body?:unknown) {
 const config=configuration();
 if(!config) throw new Error("Supabase lokal belum dikonfigurasi.");
 const response=await fetch(config.url+path,{method:body===undefined?"GET":"POST",headers:{apikey:config.key,...(token?{Authorization:"Bearer "+token}:{}),"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body),cache:"no-store"});
 if(!response.ok) throw new Error("Permintaan ditolak. Periksa akses, persetujuan, atau layanan lokal.");
 if(response.status===204) return null;
 const text=await response.text();
 return text ? JSON.parse(text) : null;
}
export async function actor() {
 const token=(await cookies()).get("numeriq_access")?.value;
 if(!configuration() || !token) return null;
 try {
 const user=await api("/auth/v1/user",token);
 const rows=await api("/rest/v1/profiles?id=eq."+encodeURIComponent(user.id)+"&select=id,role,display_name,institution_id,active",token);
 if(!rows[0]?.active) return null;
 return {...rows[0],token,email:user.email};
 } catch { return null; }
}
export async function requireRole(role:string) {
 if((await cookies()).get("numeriq_child_lock")?.value) redirect("/student");
 const current=await actor();
 if(!current) redirect("/login");
 if(current.role!==role) redirect("/forbidden");
 return current;
}
export async function rpc(name:string, token:string, args:unknown={}) { return api("/rest/v1/rpc/"+name,token,args); }

