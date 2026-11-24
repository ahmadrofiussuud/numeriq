import test from "node:test";import assert from "node:assert/strict";
import {parseSandboxEvent,signSandboxPayload,verifySandboxSignature} from "../src/domain/sandbox-payment.ts";
const secret="synthetic-local-secret-123456789";
test("signed sandbox payload verifies",()=>{const raw=JSON.stringify({event_id:"evt_demo_1",order_id:crypto.randomUUID(),status:"paid",amount:69000,currency:"IDR"});const signature=signSandboxPayload(raw,secret);assert.equal(verifySandboxSignature(raw,signature,secret),true);assert.equal(verifySandboxSignature(raw+" ",signature,secret),false);});
test("invalid and failed events are handled deterministically",()=>{assert.equal(parseSandboxEvent({event_id:"evt_demo_2",order_id:crypto.randomUUID(),status:"failed",amount:690000,currency:"IDR"}).status,"failed");assert.throws(()=>parseSandboxEvent({event_id:"x",status:"paid",amount:-1,currency:"USD"}));});
