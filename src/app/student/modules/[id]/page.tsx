import {notFound,redirect} from "next/navigation";
import {cookies} from "next/headers";
import {randomUUID} from "node:crypto";
import Link from "next/link";
import {actor,rpc} from "../../../../server/supabase";
import {completeLearningModule} from "../../../actions";
import {modules} from "../../../../content/modules";
import {publicModule} from "../../../../domain/content";
import {ActivityPlayer} from "../../../../components/activities/player";
export default async function LearningModule({params}:{params:Promise<{id:string}>}){
 const {id}=await params,source=modules.find(m=>m.id===id);if(!source)notFound();
 const user=await actor();if(!user)redirect("/login");const token=(await cookies()).get("numeriq_child")?.value;if(!token)redirect("/student");
 const learning=await rpc("list_child_learning",user.token,{p_token:token});if(!learning.modules.some((m:{id:string})=>m.id===id))notFound();
 return <main id="main" className="activity-page"><div className="activity-top"><Link href="/student">← Kembali ke ruang belajar</Link><span className="demo-label">DRAFT · NEEDS_REVIEW</span></div><ActivityPlayer module={publicModule(source,"demo")}/><form action={completeLearningModule}><input type="hidden" name="module" value={id}/><input type="hidden" name="completionKey" value={randomUUID()}/><button>Simpan sebagai selesai</button></form><p className="fine">Progres tersimpan untuk akun sintetis ini. Konten belum disahkan ahli.</p></main>;
}
