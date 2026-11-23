import {test} from "node:test";import assert from "node:assert/strict";
import {bktStep,replayBkt} from "../src/domain/bkt.ts";
const parameters={p_init:0.2,p_learn:0.1,p_guess:0.2,p_slip:0.1};
function close(actual:number,expected:number){assert.ok(Math.abs(actual-expected)<1e-12,actual+" differs from "+expected);}
test("correct response reference posterior and learning transition",()=>{const result=bktStep(.2,true,parameters);close(result.posterior,.18/(.18+.16));close(result.nextMastery,.18/.34+(1-.18/.34)*.1);});
test("incorrect response reference posterior and transition",()=>{const result=bktStep(.2,false,parameters);close(result.posterior,.02/(.02+.64));close(result.nextMastery,.02/.66+(1-.02/.66)*.1);});
test("zero denominator remains finite and carries prior",()=>{const r=bktStep(0,true,{...parameters,p_guess:0});assert.equal(r.posterior,0);assert.equal(r.nextMastery,.1);});
test("reference replay skips hinted evidence and repeated response IDs",()=>{const rows=replayBkt(parameters,[{id:"a",correct:false,hintUsed:false},{id:"a",correct:false,hintUsed:false},{id:"b",correct:true,hintUsed:true},{id:"c",correct:true,hintUsed:false}]);assert.equal(rows.length,3);assert.equal(rows[1].included,false);assert.equal(rows[1].nextMastery,null);close(rows[2].prior!,rows[0].nextMastery!);});
test("parameters outside probability domain are rejected",()=>{assert.throws(()=>bktStep(.2,true,{...parameters,p_guess:1.1}));assert.throws(()=>replayBkt({...parameters,p_init:NaN},[]));});
