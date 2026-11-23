"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import Link from "next/link";
import type {AssessmentView,SubmitInput} from "../domain/assessment";
export function AssessmentRunner({id}:{id:string}){
 const [view,setView]=useState<AssessmentView|null>(null),[answer,setAnswer]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[hint,setHint]=useState<string|null>(null);
 const pending=useRef<SubmitInput|null>(null);const lock=useRef(false);
 const load=useCallback(async()=>{const r=await fetch("/api/assessments/"+id,{cache:"no-store"});const data=await r.json();if(!r.ok)throw new Error(data.error);setView(data);setAnswer("");setHint(data.item?.hint||null);pending.current=null;},[id]);
 useEffect(()=>{load().catch(e=>setError(e.message));},[load]);
 async function submit(){
 if(lock.current||!view?.item||!answer)return;lock.current=true;setBusy(true);setError("");
 pending.current??={responseId:crypto.randomUUID(),itemId:view.item.id,version:view.item.version,answer};
 try{
 const r=await fetch("/api/assessments/"+id,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pending.current)});const result=await r.json();if(!r.ok)throw new Error(result.error);
 await load();
 }catch(e){setError((e as Error).message||"Koneksi terputus. Coba kirim lagi dengan jawaban yang sama.");}
 finally{lock.current=false;setBusy(false);}
 }
 async function showHint(){if(lock.current||!view?.item)return;lock.current=true;setBusy(true);setError("");try{const r=await fetch("/api/assessments/"+id+"/hint",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemId:view.item.id})});const data=await r.json();if(!r.ok)throw new Error(data.error);setHint(data.hint);}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}}
 async function retryLoad(){if(lock.current)return;lock.current=true;setBusy(true);setError("");try{await load();}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}}
 return <main id="main" className="activity-page"><div className="activity-top"><Link href="/student">← Ruang anak</Link><span className="demo-label">ASESMEN SINTETIS · NEEDS_REVIEW</span></div>{error&&<div className="notice danger" role="alert"><p>{error}</p><p>Jawaban tersimpan hanya setelah diterima server. Memuat ulang akan mengambil jawaban terakhir yang sudah tersimpan.</p><button disabled={busy} onClick={retryLoad}>Muat ulang sesi</button></div>}{!view?<p role="status">Menyiapkan sesi…</p>:<section className="activity-player"><div className="activity-meta"><span>{view.title}</span><span>{view.answered}/{view.total} tersimpan</span></div><progress value={view.answered} max={view.total} aria-label="Jawaban tersimpan"/>{view.status==="completed"?<><h1>Terima kasih sudah mencoba!</h1><p>Semua jawabanmu sudah tersimpan. Pendamping dapat melihat hasilnya.</p><Link className="button" href="/student">Kembali ke ruang anak</Link></>:view.status==="expired"?<><h1>Waktu sesi ini sudah berakhir.</h1><p>Minta pendamping menyiapkan sesi baru. Jawaban sebelumnya tetap tersimpan.</p></>:view.item?<><h1>{view.item.prompt}</h1><fieldset className="choice-field" disabled={busy||pending.current!==null}><legend>Pilih satu jawaban</legend><div className="choice-options">{view.item.options.map(o=><label className={answer===o.id?"choice selected":"choice"} key={o.id}><input type="radio" name="answer" value={o.id} checked={answer===o.id} onChange={()=>setAnswer(o.id)}/><span>{o.label}</span></label>)}</div></fieldset>{hint&&<div className="notice" role="status">{hint}</div>}<div className="player-footer">{view.item.hint_available?<button className="secondary" disabled={busy||pending.current!==null||hint!==null} onClick={showHint}>Lihat petunjuk</button>:<span/>}<button disabled={busy||!answer} onClick={submit}>{busy?"Menyimpan…":pending.current?"Kirim ulang jawaban":"Simpan dan lanjut"}</button></div><p className="fine">Kamu boleh berhenti dan kembali nanti. Jawaban yang sudah diterima server tetap tersimpan.</p></>:<p role="status">Tidak ada soal berikutnya.</p>}</section>}</main>;
}
