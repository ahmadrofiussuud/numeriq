export type BktParameters={p_init:number;p_learn:number;p_guess:number;p_slip:number};
export type Observation={id:string;correct:boolean;hintUsed:boolean};
function probability(value:number){if(!Number.isFinite(value)||value<0||value>1)throw new Error("Parameter BKT harus dalam [0,1].");return value;}
export function bktStep(prior:number,correct:boolean,parameters:BktParameters){
 const p=probability(prior),learn=probability(parameters.p_learn),guess=probability(parameters.p_guess),slip=probability(parameters.p_slip);
 const mastered=correct?1-slip:slip,unmastered=correct?guess:1-guess;
 const denominator=p*mastered+(1-p)*unmastered;
 const posterior=denominator===0?p:Math.min(1,Math.max(0,p*mastered/denominator));
 return {posterior,nextMastery:Math.min(1,Math.max(0,posterior+(1-posterior)*learn))};
}
/** Input is already ordered by server response time; IDs suppress repeated delivery. */
export function replayBkt(parameters:BktParameters,events:Observation[]){
 let prior=probability(parameters.p_init);
 const seen=new Set<string>();
 const snapshots:{id:string;included:boolean;prior:number|null;posterior:number|null;nextMastery:number|null}[]=[];
 for(const event of events){
  if(!event.id||seen.has(event.id))continue;seen.add(event.id);
  if(event.hintUsed){snapshots.push({id:event.id,included:false,prior:null,posterior:null,nextMastery:null});continue;}
  const step=bktStep(prior,event.correct,parameters);
  snapshots.push({id:event.id,included:true,prior,posterior:step.posterior,nextMastery:step.nextMastery});
  prior=step.nextMastery;
 }
 return snapshots;
}
