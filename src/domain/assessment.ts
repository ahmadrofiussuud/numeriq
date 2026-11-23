export type SubmitInput={responseId:string;itemId:string;version:number;answer:string};
export const isUuid=(x:unknown):x is string=>typeof x==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
export function parseSubmission(raw:unknown):SubmitInput {
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw new Error("Jawaban tidak valid.");
 const v=raw as Record<string,unknown>;
 if(Object.keys(v).some(k=>!["responseId","itemId","version","answer"].includes(k)))throw new Error("Field tidak diizinkan.");
 if(!isUuid(v.responseId)||typeof v.itemId!=="string"||!v.itemId||v.itemId.length>100||!Number.isSafeInteger(v.version)||(v.version as number)<1||typeof v.answer!=="string"||!v.answer||v.answer.length>100)throw new Error("Jawaban tidak valid.");
 return v as SubmitInput;
}
export type AssessmentView={id:string;title:string;status:"created"|"in_progress"|"completed"|"expired";answered:number;total:number;synthetic:boolean;item:null|{id:string;version:number;prompt:string;options:{id:string;label:string}[];hint_available:boolean;hint_used:boolean;hint:string|null}};
export type AssignmentSummary={id:string;title:string;status:string;answered:number;total:number;synthetic:boolean;created_at:string};
