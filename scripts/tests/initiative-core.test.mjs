import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  assertKeywordMutable,
  canonicalKeyword,
  transitionInitiative,
  validateGateAssignments,
  validateInitiativePolicy,
  validateInitiativeRecord,
} from "../lib/initiative-core.mjs";
import { contextPathsFor, digestContextEntries } from "../lib/context-pack.mjs";

const readJson = (path) => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));
const initiative = readJson("contracts/schemas/examples/initiative.valid.json");
const policy = readJson("contracts/policy/initiative-policy-v1.json");

test("Initiative keyword validation is case-preserving and uniqueness is case-insensitive", () => {
  assert.equal(canonicalKeyword("Loomit-SDK-panel"), "loomit-sdk-panel");
  assert.equal(canonicalKeyword("loomit-sdk-panel"), "loomit-sdk-panel");
  assert.throws(() => canonicalKeyword("invalid_keyword"), /INVALID_INITIATIVE_KEYWORD/);
});

test("valid standalone Initiative preserves the M1-01A state and gate invariants", () => {
  assert.equal(validateInitiativeRecord(initiative), true);
});

test("ROADMAP mode remains contract-visible but fails closed until M2", () => {
  const roadmap = { ...initiative, mode: "ROADMAP", roadmap_item_id: "84000000-0000-4000-8000-000000000001" };
  assert.throws(() => validateInitiativeRecord(roadmap), /ROADMAP_MODE_NOT_AVAILABLE/);
});

test("STANDARD and HIGH require three distinct active human gate approvers", () => {
  const duplicate = structuredClone(initiative.gate_assignments);
  duplicate[2].approver.actor_id = duplicate[1].approver.actor_id;
  assert.throws(
    () => validateGateAssignments({ assignments: duplicate, riskTier: "STANDARD" }),
    /DISTINCT_APPROVERS_REQUIRED/,
  );
  assert.equal(validateGateAssignments({ assignments: duplicate, riskTier: "LOW" }), true);
  const agent = structuredClone(initiative.gate_assignments);
  agent[0].approver.actor_type = "AGENT";
  assert.throws(() => validateGateAssignments({ assignments: agent, riskTier: "LOW" }), /HUMAN/);
});

test("exactly the three mandatory gate types are required", () => {
  const duplicate = structuredClone(initiative.gate_assignments);
  duplicate[2].gate_type = "PLAN_APPROVAL";
  assert.throws(() => validateGateAssignments({ assignments: duplicate, riskTier: "LOW" }), /EXACT_GATE_TYPES/);
});

test("M1-01A transitions accept refinement, pause, resume, and cancel deterministically", () => {
  assert.deepEqual(transitionInitiative({ state: "DRAFT", pausedFromState: null, command: "ACCEPT_REFINEMENT" }), { state: "ALIGNING", pausedFromState: null });
  assert.deepEqual(transitionInitiative({ state: "ALIGNING", pausedFromState: null, command: "PAUSE" }), { state: "PAUSED", pausedFromState: "ALIGNING" });
  assert.deepEqual(transitionInitiative({ state: "PAUSED", pausedFromState: "ALIGNING", command: "RESUME" }), { state: "ALIGNING", pausedFromState: null });
  assert.deepEqual(transitionInitiative({ state: "PAUSED", pausedFromState: "DRAFT", command: "CANCEL" }), { state: "CANCELLED", pausedFromState: null });
  assert.throws(() => transitionInitiative({ state: "CANCELLED", pausedFromState: null, command: "RESUME" }), /INVALID/);
});

test("keyword mutation is limited to a draft with no external resource", () => {
  assert.equal(assertKeywordMutable({ state: "DRAFT", first_external_resource_at: null }), true);
  assert.throws(() => assertKeywordMutable({ state: "ALIGNING", first_external_resource_at: null }), /IMMUTABLE/);
  assert.throws(() => assertKeywordMutable({ state: "DRAFT", first_external_resource_at: "2026-08-29T15:00:00Z" }), /IMMUTABLE/);
});

test("Initiative policy preserves the deny-by-default manual standalone boundary", () => {
  assert.equal(validateInitiativePolicy(policy), true);
  const changed = structuredClone(policy);
  changed.enabled_modes.push("ROADMAP");
  assert.throws(() => validateInitiativePolicy(changed), /standalone-only/);
  const external = structuredClone(policy);
  external.actions[0].external_side_effect = true;
  assert.throws(() => validateInitiativePolicy(external), /human-only boundary/);
});

test("M1-01A context pack binds every normative Initiative contract", () => {
  const paths = contextPathsFor("M1-01A");
  const required = [
    "contracts/database/m1-01a-initiative-core-relational-contract.md",
    "contracts/openapi/curve-v1.openapi.yaml",
    "contracts/policy/initiative-policy-v1.json",
    "contracts/schemas/initiative-event-v1.schema.json",
    "contracts/schemas/initiative.schema.json",
    "docs/curve-ai-native-sdlc-prd.md",
    "docs/technical/m1-01a-initiative-core-task-packet.md",
    "scripts/lib/initiative-core.mjs",
    "scripts/tests/initiative-core.test.mjs"
  ];
  for (const path of required) assert.equal(paths.includes(path), true, `missing ${path}`);
  const entries = paths.map((path) => ({ path, contents: readFileSync(new URL(`../../${path}`, import.meta.url)) }));
  assert.match(digestContextEntries(entries), /^sha256:[0-9a-f]{64}$/);
});
