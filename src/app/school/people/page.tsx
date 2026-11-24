import {randomUUID} from "node:crypto";
import {requireRole,rpc} from "../../../server/supabase";
import {Shell} from "../../../components/shell";
import {assignTeacher,requestSeatChange,setSchoolSeat} from "../../actions";
type Teacher={id:string;name:string;active:boolean};
type Student={id:string;name:string;seat_active:boolean;teacher_ids:string[]};
export default async function People({searchParams}:{searchParams:Promise<{updated?:string;error?:string}>}){
 const user=await requireRole("school"),query=await searchParams;
 const data:{capacity:number;teachers:Teacher[];students:Student[]}=await rpc("school_people",user.token);
 const used=data.students.filter(s=>s.seat_active).length;
 return <Shell role="school" name={user.display_name}><span className="eyebrow">ADMIN SEKOLAH · P0</span><h1>Orang dan kursi</h1><p>Kelola lisensi dan penugasan hanya untuk institusi aktifmu.</p>
 {query.updated&&<div className="notice" role="status">Perubahan berhasil disimpan dan dicatat.</div>}{query.error&&<div className="notice danger" role="alert">Perubahan ditolak. Periksa kuota, institusi, dan data formulir.</div>}
 <div className="stats"><article><small>Kursi aktif</small><strong>{used}</strong></article><article><small>Sisa</small><strong>{Math.max(0,data.capacity-used)}</strong></article><article><small>Kapasitas paket</small><strong>{data.capacity}</strong></article></div>
 <section id="children"><div className="section-heading"><h2>Siswa</h2><span className="pill">{data.students.length} profil</span></div><div className="child-grid">{data.students.map(student=><article className="child-card" key={student.id}><h3>{student.name}</h3><p><span className={student.seat_active?"good":"pending"}>{student.seat_active?"Kursi sekolah aktif":"Kursi belum aktif"}</span></p><form action={setSchoolSeat}><input type="hidden" name="student" value={student.id}/><input type="hidden" name="eventKey" value={randomUUID()}/><input type="hidden" name="active" value={String(!student.seat_active)}/><button className={student.seat_active?"quiet":"secondary"}>{student.seat_active?"Nonaktifkan kursi":"Aktifkan kursi"}</button></form><hr/><h4>Guru pendamping</h4>{data.teachers.length===0?<p>Belum ada guru aktif.</p>:data.teachers.map(teacher=>{const assigned=student.teacher_ids.includes(teacher.id);return <form action={assignTeacher} key={teacher.id}><input type="hidden" name="student" value={student.id}/><input type="hidden" name="teacher" value={teacher.id}/><input type="hidden" name="assigned" value={String(!assigned)}/><button className="quiet">{assigned?"✓ ":"+ "}{teacher.name}</button></form>})}</article>)}</div></section>
 <section id="access" className="panel"><h2>Minta perubahan kapasitas</h2><p>Permintaan tidak langsung menambah kursi dan menunggu persetujuan operasional pada Phase 6.</p><form action={requestSeatChange}><label>Kapasitas yang diminta<input name="capacity" type="number" min={1} defaultValue={data.capacity+5} required/></label><label>Alasan<textarea name="reason" minLength={10} maxLength={500} required/></label><button>Kirim permintaan</button></form></section></Shell>;
}
