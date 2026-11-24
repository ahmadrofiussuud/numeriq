import {createHmac,timingSafeEqual} from "node:crypto";
export type SandboxEvent={event_id:string;order_id:string;status:"paid"|"failed";amount:number;currency:"IDR"};
export function signSandboxPayload(raw:string,secret:string){
 if(secret.length<24)throw new Error("Sandbox webhook secret must be at least 24 characters.");
 return createHmac("sha256",secret).update(raw).digest("hex");
}
export function verifySandboxSignature(raw:string,signature:string|null,secret:string){
 if(!signature||!/^[a-f0-9]{64}$/.test(signature))return false;
 const expected=signSandboxPayload(raw,secret),given=Buffer.from(signature,"hex");
 return given.length===32&&timingSafeEqual(Buffer.from(expected,"hex"),given);
}
export function parseSandboxEvent(value:unknown):SandboxEvent{
 if(!value||typeof value!=="object")throw new Error("Invalid event.");
 const e=value as Record<string,unknown>;
 if(typeof e.event_id!=="string"||e.event_id.length<8||typeof e.order_id!=="string"||
   !["paid","failed"].includes(String(e.status))||!Number.isSafeInteger(Number(e.amount))||Number(e.amount)<0||e.currency!=="IDR")throw new Error("Invalid event.");
 return e as unknown as SandboxEvent;
}
