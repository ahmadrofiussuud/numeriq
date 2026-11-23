import Link from "next/link";
import {randomUUID} from "node:crypto";
import {notFound} from "next/navigation";
import {requireRole,rpc} from "../../../../server/supabase";
import {isUuid} from "../../../../domain/assessment";
import {Shell} from "../../../../components/shell";
import {reviewEvidence} from "../../../actions";
type Pattern={kc_id:string;error_code:string;rule_version:number;distinct_items:number;response_ids:string[];state:"insufficient_evidence"|"needs_review"|"reviewed"|"rejected"|"corrected";corrected_code:string|null;review_reason:string|null;rule_review:string;activity:{id:string;title:string;version:number}|null};
type Entry={response_id:string;kc_id:string;item_id:string;error_code:string|null;rule_version:number|null;model_version:number;included:boolean;prior:number|null;posterior:number|null;mastery:number|null;observed_at:string;parameter_review:string};
export default async function Insights({params,searchParams}:{params:Promise<{student:string}>;searchParams:Promise<{updated?:string;error?:string}>}){
 const user=await requireRole("teacher"),{student}=await params,query=await searchParams;if(!isUuid(student))notFound();
 let result:{patterns:Pattern[];timeline:Entry[]};
 try{result=await rpc("learning_insights",user.token,{p_student:student});}catch{notFound();}
 const labels:Record<Pattern["state"],string>={insufficient_evidence:"Bukti belum cukup",needs_review:"Perlu ditinjau guru",reviewed:"Sudah ditinjau guru",rejected:"Ditolak guru",corrected:"Dikoreksi guru"};
 return <Shell role="teacher" name={user.display_name}><Link href="/teacher/assessments">← Daftar asesmen</Link><h1>Bukti belajar</h1><p className="notice">DEMO SINTETIS · NEEDS_REVIEW. Ini dugaan pola respons dan estimasi penguasaan konsep, bukan diagnosis. Parameter serta aturan belum disahkan ahli.</p>
 {query.updated&&<p className="notice" role="status">Tinjauan guru tersimpan sebagai catatan baru.</p>}
 {query.error&&<p className="notice danger" role="alert">Tinjauan gagal disimpan. Periksa alasan dan akses siswa.</p>}
 <h2>Pola respons</h2>{result.patterns.length===0?<p className="empty">Belum ada pola berlabel yang dapat ditinjau.</p>:result.patterns.map(pattern=><article className="panel" key={pattern.kc_id+pattern.error_code+pattern.rule_version}>
 <h3>{pattern.kc_id} · {pattern.error_code}</h3><p><strong>{labels[pattern.state]}</strong> · {pattern.distinct_items} soal berbeda · Aturan v{pattern.rule_version} ({pattern.rule_review})</p>
 <p>Bukti respons: {pattern.response_ids.length} jawaban tersimpan. {pattern.state==="insufficient_evidence"?"Butuh bukti dari soal berbeda sebelum menyimpulkan pola.":"Guru dapat mencatat keputusan berdasarkan bukti yang tersedia."}</p>
 {pattern.review_reason&&<p>Alasan tinjauan: {pattern.review_reason}{pattern.corrected_code?" · Koreksi: "+pattern.corrected_code:""}</p>}
 <p>{pattern.activity?<Link href={"/demo/activities/"+pattern.activity.id}>Aktivitas disetujui: {pattern.activity.title} →</Link>:"Aktivitas remediasi belum disahkan ahli; belum ada saran otomatis."}</p>
 {pattern.distinct_items>=2&&<form action={reviewEvidence}><input type="hidden" name="student" value={student}/><input type="hidden" name="kc" value={pattern.kc_id}/><input type="hidden" name="code" value={pattern.error_code}/><input type="hidden" name="rule" value={pattern.rule_version}/><input type="hidden" name="reviewKey" value={randomUUID()}/>
 <label>Keputusan guru<select name="decision" required><option value="reviewed">Catat sebagai ditinjau</option><option value="rejected">Tolak dugaan pola</option><option value="corrected">Koreksi kode pola</option></select></label>
 <label>Kode koreksi (isi hanya saat memilih Koreksi)<input name="corrected" maxLength={80} placeholder="Contoh: PERLU_OBSERVASI"/></label>
 <label>Alasan berdasarkan bukti<textarea name="reason" minLength={10} maxLength={500} required placeholder="Tuliskan pertimbangan profesional secara ringkas."/></label><button>Simpan tinjauan</button></form>}
 </article>)}
 <h2>Jejak estimasi penguasaan konsep</h2>{result.timeline.length===0?<p className="empty">Belum ada respons yang tercatat.</p>:result.timeline.map(row=><article className="panel" key={row.response_id}><h3>{row.kc_id} · {row.item_id}</h3><p>{row.included?<>Estimasi setelah respons: <strong>{Math.round((row.mastery||0)*100)}%</strong></>:"Jawaban dengan petunjuk: tidak digunakan sebagai observasi BKT."} · Model v{row.model_version} ({row.parameter_review})</p><small>{new Date(row.observed_at).toLocaleString("id-ID",{timeZone:"Asia/Jakarta"})} · ID respons {row.response_id}</small></article>)}
 </Shell>;
}
