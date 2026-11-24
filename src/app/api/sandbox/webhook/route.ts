import {createHash} from "node:crypto";
import {NextResponse} from "next/server";
import {parseSandboxEvent,verifySandboxSignature} from "../../../../domain/sandbox-payment";
export async function POST(request:Request){
 const url=process.env.SUPABASE_URL,service=process.env.SUPABASE_SERVICE_ROLE_KEY,secret=process.env.SANDBOX_WEBHOOK_SECRET;
 if(!url||!service||!secret||!["127.0.0.1","localhost"].includes(new URL(url).hostname))return NextResponse.json({error:"Sandbox unavailable"},{status:503});
 const raw=await request.text();
 if(!verifySandboxSignature(raw,request.headers.get("x-numeriq-signature"),secret))return NextResponse.json({error:"Invalid signature"},{status:401});
 let event;try{event=parseSandboxEvent(JSON.parse(raw));}catch{return NextResponse.json({error:"Invalid event"},{status:400});}
 const response=await fetch(url+"/rest/v1/rpc/apply_sandbox_payment_event",{method:"POST",headers:{apikey:service,Authorization:"Bearer "+service,"Content-Type":"application/json"},body:JSON.stringify({p_event_id:event.event_id,p_order:event.order_id,p_status:event.status,p_amount:event.amount,p_currency:event.currency,p_payload_hash:createHash("sha256").update(raw).digest("hex")})});
 const body=await response.text();return new NextResponse(body,{status:response.status,headers:{"Content-Type":"application/json"}});
}
