"use client";
import {useId,useState} from "react";
import type {Activity,Module} from "../../domain/content";
import {moveOnLine,regroup} from "../../domain/content";
type Props={activity:Activity;onChange:()=>void};
export function TenFrameActivity({activity,onChange}:Props){
 const [dots,setDots]=useState(()=>Array.from({length:10},(_,i)=>i<activity.config.initial));
 return <div><div className="interactive-ten" role="group" aria-label={activity.accessibilityText}>{dots.map((filled,i)=><button type="button" key={i} aria-label={"Kotak "+(i+1)+(filled?", berisi titik":", kosong")} aria-pressed={filled} onClick={()=>{setDots(dots.map((v,j)=>j===i?!v:v));onChange();}}><span className={filled?"dot filled":"dot"}/></button>)}</div><p className="activity-count" aria-live="polite"><strong>{dots.filter(Boolean).length}</strong> titik di bingkai</p></div>;
}
export function NumberLineActivity({activity,onChange}:Props){
 const {min,max,step,initial}=activity.config;const [value,setValue]=useState(initial);const id=useId();
 function change(next:number){setValue(next);onChange();}
 const ticks=Array.from({length:(max-min)/step+1},(_,i)=>min+i*step);
 return <div className="number-line"><label htmlFor={id}>{activity.accessibilityText}</label><output htmlFor={id} className="line-number" aria-live="polite">{value}</output><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e=>change(Number(e.target.value))} aria-valuetext={"Bilangan "+value}/><div className="line-ticks" aria-hidden="true">{ticks.filter((_,i)=>ticks.length<=12||i%Math.ceil(ticks.length/10)===0||i===ticks.length-1).map(t=><span key={t}>{t}</span>)}</div><div className="activity-buttons"><button type="button" className="secondary" disabled={value===min} onClick={()=>change(moveOnLine(value,-1,min,max,step))}>← Mundur {step}</button><button type="button" className="secondary" disabled={value===max} onClick={()=>change(moveOnLine(value,1,min,max,step))}>Maju {step} →</button></div></div>;
}
export function BaseTenBlocksActivity({activity,onChange}:Props){
 const [blocks,setBlocks]=useState({tens:Math.floor(activity.config.initial/10),ones:activity.config.initial%10});const total=blocks.tens*10+blocks.ones;
 function change(next:typeof blocks){if(next.tens<0||next.ones<0||next.tens*10+next.ones>activity.config.max)return;setBlocks(next);onChange();}
 return <div aria-label={activity.accessibilityText}><div className="block-columns"><section><h3>Puluhan <span>{blocks.tens}</span></h3><div className="blocks-visual" aria-hidden="true">{Array.from({length:blocks.tens},(_,i)=><div className="ten-rod" key={i}>{Array.from({length:10},(_,j)=><span key={j}/>)}</div>)}</div><div className="block-controls"><button type="button" aria-label="Kurangi satu puluhan" disabled={blocks.tens===0} onClick={()=>change({...blocks,tens:blocks.tens-1})}>−</button><button type="button" aria-label="Tambah satu puluhan" disabled={total+10>activity.config.max} onClick={()=>change({...blocks,tens:blocks.tens+1})}>+</button></div></section><section><h3>Satuan <span>{blocks.ones}</span></h3><div className="blocks-visual" aria-hidden="true">{Array.from({length:blocks.ones},(_,i)=><span className="unit-block" key={i}/>)}</div><div className="block-controls"><button type="button" aria-label="Kurangi satu satuan" disabled={blocks.ones===0} onClick={()=>change({...blocks,ones:blocks.ones-1})}>−</button><button type="button" aria-label="Tambah satu satuan" disabled={total+1>activity.config.max} onClick={()=>change({...blocks,ones:blocks.ones+1})}>+</button></div></section></div><div className="activity-buttons"><button type="button" className="secondary" disabled={blocks.tens===0} onClick={()=>change(regroup(blocks.tens,blocks.ones,"unbundle"))}>1 puluhan → 10 satuan</button><button type="button" className="secondary" disabled={blocks.ones<10} onClick={()=>change(regroup(blocks.tens,blocks.ones,"bundle"))}>10 satuan → 1 puluhan</button></div><p className="activity-count" aria-live="polite">Jumlah: <strong>{total}</strong></p></div>;
}
export function ResponseChoiceActivity({activity,onChange}:Props){
 const id=useId();const [selected,setSelected]=useState("");
 return <fieldset className="choice-field"><legend>{activity.accessibilityText}</legend><div className="choice-options">{activity.config.options?.map(option=><label key={option.id} className={selected===option.id?"choice selected":"choice"}><input type="radio" name={id} value={option.id} checked={selected===option.id} onChange={()=>{setSelected(option.id);onChange();}}/><span>{option.label}</span></label>)}</div></fieldset>;
}
const renderers={"ten-frame":TenFrameActivity,"number-line":NumberLineActivity,"base-ten":BaseTenBlocksActivity,choice:ResponseChoiceActivity};
export function ActivityPlayer({module}:{module:Module}){
 const [index,setIndex]=useState(0);const [attempt,setAttempt]=useState(0);const [touched,setTouched]=useState(false);const [sent,setSent]=useState(false);
 const activity=module.activities[index];const Component=renderers[activity.component];
 function reset(){setAttempt(x=>x+1);setTouched(false);setSent(false);}
 return <div className="activity-player"><div className="activity-meta"><span>{module.id} / VERSI {module.version}</span><span>Eksplorasi {index+1} dari {module.activities.length}</span></div><h1>{activity.prompt}</h1><p className="activity-instruction">{activity.instructions}</p><Component key={activity.id+"-"+attempt} activity={activity} onChange={()=>{setTouched(true);setSent(false);}}/><div className="player-footer"><button type="button" className="secondary" onClick={reset}>Mulai ulang</button><button type="button" disabled={!touched} onClick={()=>setSent(true)}>Selesai mencoba ✓</button></div>{sent&&<div className="notice" role="status"><strong>Terima kasih sudah mencoba!</strong><p>Ini pratinjau interaksi. Jawaban belum dinilai dan progres tidak disimpan.</p>{index<module.activities.length-1&&<button onClick={()=>{setIndex(index+1);reset();}}>Eksplorasi berikutnya</button>}</div>}<details className="content-note"><summary>Catatan untuk pendamping</summary><p>{module.objective}</p><p>NEEDS_REVIEW · Konten sintetis belum disetujui ahli. Bukan asesmen atau rekomendasi individual.</p></details></div>;
}

