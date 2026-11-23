import Link from "next/link";
import {randomUUID} from "node:crypto";
import {requireRole,rpc} from "../../../server/supabase";
import {Shell} from "../../../components/shell";
import {assignAssessment} from "../../actions";
import type {AssignmentSummary} from "../../../domain/assessment";
import {isUuid} from "../../../domain/assessment";
export default async function Assessments({searchParams}:{searchParams:Promise<{error?:string;assigned?:string}>}){
 const user=await requireRole("teacher");const query=await searchParams;
 const children:{id:string;display_name:string;consent:boolean;access:string|null}[]=await rpc("list_my_children",user.token);
 const groups=await Promise.all(children.map(async(child)=>({child,sessions:await rpc("list_assessments",user.token,{p_student:child.id}) as AssignmentSummary[]})));
 return <Shell role="teacher" name={user.display_name}><span className="eyebrow">PENUGASAN & JAWABAN</span><h1>Asesmen numerasi</h1><div className="notice">Dua paket uji sintetis. NEEDS_REVIEW — belum untuk siswa nyata. Bukti pola dan estimasi BKT dapat ditinjau guru, dengan parameter yang belum disahkan ahli.</div>{query.assigned&&isUuid(query.assigned)&&<div className="notice" role="status">Tugas baru berhasil dibuat. <Link href={"/teacher/assessments/"+query.assigned}>Buka sesi yang baru ditugaskan →</Link></div>}{query.error&&<div className="notice danger" role="alert">Penugasan belum berhasil. Pastikan izin, persetujuan, lisensi, dan konfigurasi demo berlaku.</div>}<section id="children">{groups.length===0?<div className="empty">Belum ada siswa ditugaskan.</div>:groups.map(({child,sessions})=><article className="panel" key={child.id}><h2>{child.display_name}</h2><Link href={"/teacher/insights/"+child.id}>Lihat bukti belajar dan estimasi →</Link><form action={assignAssessment}><input type="hidden" name="student" value={child.id}/><input type="hidden" name="assignmentKey" value={randomUUID()}/><label>Paket sintetis<select name="set"><option value="numeracy-demo">Eksplorasi numerasi (3 soal)</option><option value="pattern-demo">Pola nilai tempat (2 soal)</option></select></label><button disabled={!child.consent||!child.access}>Tugaskan paket demo</button></form>{!child.consent&&<p>Persetujuan wali diperlukan.</p>}<ul>{sessions.map(s=><li key={s.id}><Link href={"/teacher/assessments/"+s.id}>{s.title} · {s.status} · {s.answered}/{s.total} jawaban →</Link></li>)}</ul></article>)}</section><section id="access"><p>Jawaban asli tidak dapat ditimpa. Setiap sesi menyimpan versi soal dan petunjuk yang digunakan.</p></section></Shell>;
}
