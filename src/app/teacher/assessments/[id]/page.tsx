import Link from "next/link";
import {requireRole,rpc} from "../../../../server/supabase";
import {Shell} from "../../../../components/shell";
import {notFound} from "next/navigation";
import {isUuid} from "../../../../domain/assessment";
type Row={response_id:string;item_id:string;item_version:number;kc_id:string;prompt:string;answer:string;correct:boolean;hint_used:boolean;sequence:number;created_at:string};
export default async function Report({params}:{params:Promise<{id:string}>}){const user=await requireRole("teacher");const {id}=await params;if(!isUuid(id))notFound();let report:{status:string;set_version:number;responses:Row[]};try{report=await rpc("assessment_report",user.token,{p_session:id});}catch{notFound();}
 return <Shell role="teacher" name={user.display_name}><Link href="/teacher/assessments">← Daftar asesmen</Link><h1>Respons asesmen</h1><p>Paket versi {report.set_version} · {report.status}</p><div className="notice">Data sintetis NEEDS_REVIEW. Benar/salah dinilai dari kunci versi soal; belum merupakan dugaan miskonsepsi atau estimasi mastery.</div>{report.responses.length===0?<div className="empty">Belum ada jawaban tersimpan.</div>:report.responses.map(r=><article className="panel" key={r.response_id}><small>{r.sequence}. {r.item_id} · versi {r.item_version} · KC {r.kc_id}</small><h3>{r.prompt}</h3><p>Opsi: {r.answer} · {r.correct?"Sesuai kunci":"Belum sesuai kunci"} · {r.hint_used?"Menggunakan petunjuk":"Tanpa petunjuk"}</p><small>{r.created_at}</small></article>)}</Shell>;}
