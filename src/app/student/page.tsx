import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { actor, rpc } from "../../server/supabase";
import { endChild } from "../actions";
import {ChildAssessments} from "../../components/child-assessments";
import { Brand } from "../../components/shell";
type LearningModule={id:string;version:number;title:string;domain:string;review_status:string;assigned:boolean;completed_at:string|null};
export default async function Student({searchParams}:{searchParams:Promise<{reauth_error?:string;completed?:string;module_error?:string}>}){
 const user=await actor();if(!user)redirect("/login");
 const jar=await cookies();const token=jar.get("numeriq_child")?.value;
 if(!token&&!jar.get("numeriq_child_lock")?.value)redirect("/"+user.role);
 let child:null|{id:string;display_name:string}=null;
 if(token){try{child=await rpc("read_child_session",user.token,{p_token:token});}catch{}}
 const query=await searchParams;let learning:{access_source:string;modules:LearningModule[]}={access_source:"",modules:[]};
 if(child){try{learning=await rpc("list_child_learning",user.token,{p_token:token});}catch{}}
 return <><div className="public-nav"><Brand/><span className="demo-label">RUANG ANAK · DEMO</span></div><main id="main" className="student-main"><div className="student-sun" aria-hidden="true">✳</div><h1>{child?"Halo, "+child.display_name+"!":"Sesi belajar sudah berakhir."}</h1>{query.completed&&<div className="notice" role="status">Progres {query.completed} sudah tersimpan.</div>}{query.module_error&&<div className="notice danger" role="alert">Progres belum tersimpan. Minta pendamping memeriksa akses.</div>}{child?<><p className="lead">Mari kenali angka dengan cara yang menyenangkan.</p><p className="fine">Akses: {learning.access_source==="school"?"dibiayai sekolah, termasuk belajar di rumah":"Home Plan"}.</p><ChildAssessments student={child.id} token={user.token} childToken={token!}/><section><h2>Jelajah 12 modul</h2><div className="child-grid">{learning.modules.map(module=><article className="child-card" key={module.id}><span className="eyebrow">{module.id} · {module.domain}</span><h3>{module.title}</h3><p>{module.completed_at?"✓ Sudah selesai":module.assigned?"Ditugaskan guru":"Bisa dijelajahi"}</p><Link className="button secondary" href={"/student/modules/"+module.id}>Buka modul →</Link></article>)}</div></section></>:<p>Minta pendampingmu masuk kembali untuk melanjutkan.</p>}<details className="adult-return"><summary>Kembali ke ruang pendamping</summary><form action={endChild}><label htmlFor="adult-password">Kata sandi pendamping</label><input id="adult-password" name="password" type="password" autoComplete="current-password" required/><button>Verifikasi dan kembali</button></form></details>{query.reauth_error&&<div className="notice danger" role="alert">Kata sandi belum sesuai. Minta bantuan pendamping.</div>}<p className="fine">Sesi didampingi · Maksimal 15 menit</p></main></>}

