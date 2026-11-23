import Link from "next/link";
import {rpc} from "../server/supabase";
import type {AssignmentSummary} from "../domain/assessment";
export async function ChildAssessments({student,token,childToken}:{student:string;token:string;childToken:string}){
 const list:AssignmentSummary[]=await rpc("list_assessments",token,{p_student:student,p_token:childToken});
 return <section className="panel"><h2>Tugas belajarmu</h2>{list.length===0?<p>Belum ada asesmen ditugaskan. Pendamping dapat menyiapkannya dari ruang guru.</p>:<ul className="assessment-list">{list.map(s=><li key={s.id}><Link href={"/student/assessments/"+s.id}>{s.title}<br/><small>{s.answered}/{s.total} tersimpan · {s.status==="completed"?"Selesai":s.status==="expired"?"Berakhir":"Mulai / lanjutkan"} →</small></Link></li>)}</ul>}</section>;
}