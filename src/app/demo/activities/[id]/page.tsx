import Link from "next/link";
import {notFound} from "next/navigation";
import {modules} from "../../../../content/modules";
import {publicModule} from "../../../../domain/content";
import {ActivityPlayer} from "../../../../components/activities/player";
export default async function Demo({params}:{params:Promise<{id:string}>}){const {id}=await params;const source=modules.find(m=>m.id===id);if(!source)notFound();return <main id="main" className="activity-page"><div className="activity-top"><Link href="/demo/activities">← Semua eksplorasi</Link><span className="demo-label">DRAFT · NEEDS_REVIEW</span></div><ActivityPlayer module={publicModule(source,"demo")}/><p className="fine">Demo lokal · Tidak ada penilaian otomatis</p></main>}

