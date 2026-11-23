import {cookies,headers} from "next/headers";
import {actor,rpc} from "../../../../../server/supabase";
import {isUuid} from "../../../../../domain/assessment";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if((await headers()).get("origin")!==(process.env.APP_ORIGIN||"http://127.0.0.1:3000"))return Response.json({error:"Origin tidak diizinkan."},{status:403});
 const {id}=await params;const user=await actor();const token=(await cookies()).get("numeriq_child")?.value;
 if(!user||!token||!isUuid(id))return Response.json({error:"Sesi tidak tersedia."},{status:403});
 try{const raw=await request.text();if(raw.length>256)throw new Error();const body=JSON.parse(raw);if(typeof body.itemId!=="string"||body.itemId.length>100||Object.keys(body).length!==1)throw new Error();
 const hint=await rpc("assessment_hint",user.token,{p_session:id,p_token:token,p_item:body.itemId});return Response.json({hint});}catch{return Response.json({error:"Petunjuk belum tersedia. Muat ulang sesi atau minta bantuan pendamping."},{status:403});}
}
