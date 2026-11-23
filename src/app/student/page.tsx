import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { actor, rpc } from "../../server/supabase";
import { endChild } from "../actions";
import {ChildAssessments} from "../../components/child-assessments";
import { Brand } from "../../components/shell";
export default async function Student({searchParams}:{searchParams:Promise<{reauth_error?:string}>}){
 const user=await actor();if(!user)redirect("/login");
 const jar=await cookies();const token=jar.get("numeriq_child")?.value;
 if(!token&&!jar.get("numeriq_child_lock")?.value)redirect("/"+user.role);
 let child:null|{id:string;display_name:string}=null;
 if(token){try{child=await rpc("read_child_session",user.token,{p_token:token});}catch{}}
 const query=await searchParams;
 return <><div className="public-nav"><Brand/><span className="demo-label">RUANG ANAK · DEMO</span></div><main id="main" className="student-main"><div className="student-sun" aria-hidden="true">✳</div><h1>{child?"Halo, "+child.display_name+"!":"Sesi belajar sudah berakhir."}</h1>{child?<><p className="lead">Mari kenali angka dengan cara yang menyenangkan.</p><ChildAssessments student={child.id} token={user.token} childToken={token!}/><Link className="button" href="/demo/activities">Coba eksplorasi demo ↗</Link><p className="fine">Eksplorasi demo tidak menyimpan progres. Jawaban tugas asesmen disimpan terpisah.</p></>:<p>Minta pendampingmu masuk kembali untuk melanjutkan.</p>}<details className="adult-return"><summary>Kembali ke ruang pendamping</summary><form action={endChild}><label htmlFor="adult-password">Kata sandi pendamping</label><input id="adult-password" name="password" type="password" autoComplete="current-password" required/><button>Verifikasi dan kembali</button></form></details>{query.reauth_error&&<div className="notice danger" role="alert">Kata sandi belum sesuai. Minta bantuan pendamping.</div>}<p className="fine">Sesi didampingi · Maksimal 15 menit</p></main></>}

