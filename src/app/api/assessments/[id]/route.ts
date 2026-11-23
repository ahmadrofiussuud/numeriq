import {cookies,headers} from "next/headers";
import {actor,rpc} from "../../../../server/supabase";
import {isUuid,parseSubmission} from "../../../../domain/assessment";
async function context(){const user=await actor();const token=(await cookies()).get("numeriq_child")?.value;return user&&token?{user,token}:null;}
const failure=()=>Response.json({error:"Sesi belum dapat diakses. Periksa koneksi, masa sesi, dan persetujuan bersama pendamping."},{status:403});
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!isUuid(id))return Response.json({error:"ID tidak valid."},{status:400});
 const ctx=await context();if(!ctx)return failure();
 try{return Response.json(await rpc("read_assessment",ctx.user.token,{p_session:id,p_token:ctx.token}),{headers:{"Cache-Control":"no-store"}});}catch{return failure();}
}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if((await headers()).get("origin")!==(process.env.APP_ORIGIN||"http://127.0.0.1:3000"))return Response.json({error:"Origin tidak diizinkan."},{status:403});
 const {id}=await params;if(!isUuid(id))return Response.json({error:"ID tidak valid."},{status:400});
 const ctx=await context();if(!ctx)return failure();
 let input;try{if(Number(request.headers.get("content-length")||0)>2048)throw new Error();const body=await request.text();if(body.length>2048)throw new Error();input=parseSubmission(JSON.parse(body));}catch{return Response.json({error:"Format jawaban tidak valid."},{status:400});}
 try{return Response.json(await rpc("submit_assessment_response",ctx.user.token,{p_session:id,p_token:ctx.token,p_response:input.responseId,p_item:input.itemId,p_version:input.version,p_answer:input.answer}));}catch{return failure();}
}
