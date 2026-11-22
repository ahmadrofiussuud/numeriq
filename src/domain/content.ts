export type ModuleId = `${"NS"|"PV"|"AR"}-0${1|2|3|4}`;
export type Component = "ten-frame"|"number-line"|"base-ten"|"choice";
export type Activity={id:string;moduleId:ModuleId;kcId:string;version:number;component:Component;prompt:string;instructions:string;accessibilityText:string;config:{min:number;max:number;step:number;initial:number;options?:{id:string;label:string}[]}};
export type Module={id:ModuleId;title:string;domain:"Number Sense"|"Place Value"|"Arithmetic";status:"draft"|"reviewed"|"published";reviewStatus:"NEEDS_REVIEW"|"APPROVED";version:number;review?:{reviewer:string;reviewedAt:string;version:number};objective:string;activities:Activity[]};
export function validateModule(value:unknown):Module{
 if(!value||typeof value!=="object")throw new Error("Modul harus objek.");
 const m=value as Module;
 if(!/^(NS|PV|AR)-0[1-4]$/.test(m.id))throw new Error("ID tidak valid.");
 const domains:Record<string,string>={NS:"Number Sense",PV:"Place Value",AR:"Arithmetic"};
 if(m.domain!==domains[m.id.slice(0,2)]||!Number.isSafeInteger(m.version)||m.version<1||!m.title?.trim()||!m.objective?.trim())throw new Error("Metadata tidak lengkap.");
 if(!["draft","reviewed","published"].includes(m.status)||!["NEEDS_REVIEW","APPROVED"].includes(m.reviewStatus))throw new Error("Status tidak valid.");
 if(m.status!=="draft"&&(m.reviewStatus!=="APPROVED"||!m.review?.reviewer?.trim()||!Number.isFinite(Date.parse(m.review.reviewedAt))||m.review.version!==m.version))throw new Error("Approval versi belum tersedia.");
 if(!Array.isArray(m.activities)||!m.activities.length)throw new Error("Aktivitas diperlukan.");
 const ids=new Set<string>();
 for(const a of m.activities){
 if(!a.id||ids.has(a.id)||a.moduleId!==m.id||a.version!==m.version||!a.kcId?.trim()||!a.prompt?.trim()||!a.instructions?.trim()||!a.accessibilityText?.trim())throw new Error("Aktivitas tidak valid.");ids.add(a.id);
 if(!["ten-frame","number-line","base-ten","choice"].includes(a.component))throw new Error("Komponen tidak dikenal.");
 const c=a.config;
 if(!c||![c.min,c.max,c.step,c.initial].every(Number.isSafeInteger)||c.min<0||c.max<=c.min||c.max>100||c.step<1||c.initial<c.min||c.initial>c.max||(c.max-c.min)%c.step!==0||(c.initial-c.min)%c.step!==0)throw new Error("Rentang tidak valid.");
 if(a.component==="ten-frame"&&(c.min!==0||c.max!==10||c.step!==1))throw new Error("Ten frame harus 0–10.");
 if(a.component==="base-ten"&&(c.step!==1||c.max>99))throw new Error("Base ten harus 0–99.");
 if(a.component==="choice"&&(!c.options||c.options.length<2||c.options.length>6||new Set(c.options.map(o=>o.id)).size!==c.options.length||c.options.some(o=>!o.id||!o.label?.trim())))throw new Error("Pilihan tidak valid.");
 }return m;
}
export function publicModule(input:unknown,mode:"demo"|"pilot"):Module{
 const m=validateModule(input);if(mode==="pilot"&&(m.status!=="published"||m.reviewStatus!=="APPROVED"))throw new Error("Konten belum diterbitkan.");
 return {id:m.id,title:m.title,domain:m.domain,status:m.status,reviewStatus:m.reviewStatus,version:m.version,objective:m.objective,
 activities:m.activities.map(a=>({id:a.id,moduleId:a.moduleId,kcId:a.kcId,version:a.version,component:a.component,prompt:a.prompt,instructions:a.instructions,accessibilityText:a.accessibilityText,config:{min:a.config.min,max:a.config.max,step:a.config.step,initial:a.config.initial,options:a.config.options?.map(o=>({id:o.id,label:o.label}))}}))};
}
export function reviseModule(input:Module):Module{const m=validateModule(input);const version=m.version+1;return {...m,version,status:"draft",reviewStatus:"NEEDS_REVIEW",review:undefined,activities:m.activities.map(a=>({...a,version,config:{...a.config,options:a.config.options?.map(o=>({...o}))}}))};}
export function moveOnLine(value:number,delta:number,min:number,max:number,step:number){return Math.min(max,Math.max(min,value+delta*step));}
export function regroup(tens:number,ones:number,direction:"bundle"|"unbundle"){if(!Number.isInteger(tens)||!Number.isInteger(ones)||tens<0||ones<0)throw new Error("Blok tidak valid.");return direction==="bundle"?(ones>=10?{tens:tens+1,ones:ones-10}:{tens,ones}):(tens>=1?{tens:tens-1,ones:ones+10}:{tens,ones});}

