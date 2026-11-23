import {cookies} from "next/headers";
import {redirect,notFound} from "next/navigation";
import {actor} from "../../../../server/supabase";
import {isUuid} from "../../../../domain/assessment";
import {AssessmentRunner} from "../../../../components/assessment-runner";
export default async function Assessment({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!isUuid(id))notFound();if(!await actor()||!(await cookies()).get("numeriq_child")?.value)redirect("/student");return <AssessmentRunner id={id}/>;}
