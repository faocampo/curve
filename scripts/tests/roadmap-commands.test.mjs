import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateRoadmapCommand } from "../lib/roadmap-domain.mjs";

const original = JSON.parse(readFileSync(new URL(
  "../../contracts/candidates/roadmap-domain-v1/graph.valid.json", import.meta.url,
), "utf8"));
const id = (n) => `94000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const payloads = {
  CREATE_ROADMAP_ITEM_INITIATIVE: {
    initiative: { keyword: "example-roadmap-work", title: "Example roadmap work",
      description: { schema_version: "1.0", format: "MARKDOWN", body: "Synthetic description" },
      risk_tier: "STANDARD", business_intent: null,
      gate_assignments: [{ gate_type: "PRD_APPROVAL", approver_user_id: id(50) },
        { gate_type: "PLAN_APPROVAL", approver_user_id: id(51) }] },
    milestone_id: original.milestones[1].id, feature_id: original.features[0].id,
    scope_body: original.items[0].scope_body, priority: "MEDIUM", confidence: "MEDIUM", health: "UNKNOWN",
    planned_start: null, planned_end: null,
  },
  CREATE_ROADMAP: { name: "Planning horizon", horizon_start: null, horizon_end: null },
  UPDATE_ROADMAP: { name: "Planning horizon", horizon_start: "2026-01-01", horizon_end: null },
  CREATE_MILESTONE: { name: "Next phase", type: "INTERNAL_DEVELOPMENT_PHASE", position: 2, target_start: null, target_end: null },
  UPDATE_MILESTONE: { name: "Release", type: "RELEASE_VERSION", target_start: null, target_end: "2026-02-01" },
  REORDER_MILESTONES: { milestone_ids: original.milestones.map((record) => record.id).reverse() },
  CREATE_FEATURE: { name: "Capability", description: null },
  UPDATE_FEATURE: { name: "Capability", description: null },
  RECORD_PROGRESS: { declared_progress: 20, progress_note: "First part completed" },
  MOVE_ITEM: { milestone_id: original.milestones[1].id, rationale: "Scope reprioritized", expected_schedule_impact: "Later planning window" },
  UPDATE_ITEM_SCHEDULE: { planned_start: "2026-02-01", planned_end: "2026-02-01", rationale: "One-day scope" },
  UPDATE_ITEM_SCOPE: { scope_body: original.items[0].scope_body, rationale: "Clarified scope" },
  UPDATE_ITEM_PRIORITY: { priority: "HIGH", rationale: "Priority revised" },
  UPDATE_ITEM_HEALTH: { health: "AT_RISK", rationale: "Dependency delayed" },
  UPDATE_ITEM_CONFIDENCE: { confidence: "LOW", rationale: "More discovery required" },
  SET_ITEM_STATUS: { status: "PROPOSED", approved_prd_version_id: null, rationale: "Recorded proposal" },
};
function command(action) {
  const productTarget = ["CREATE_ROADMAP", "CREATE_FEATURE"].includes(action);
  const target = productTarget ? original.product_id
    : ["UPDATE_ROADMAP", "CREATE_MILESTONE", "REORDER_MILESTONES", "CREATE_ROADMAP_ITEM_INITIATIVE"].includes(action) ? original.roadmaps[0].id
      : action === "UPDATE_MILESTONE" ? original.milestones[0].id
        : action === "UPDATE_FEATURE" ? original.features[0].id : original.items[0].id;
  return { schema_version: "curve.roadmap-command/v1-candidate", action,
    workspace_id: original.workspace_id, product_id: original.product_id, target_id: target,
    expected_version: productTarget ? null : 1, payload: structuredClone(payloads[action]) };
}
for (const action of Object.keys(payloads)) {
  test(`${action} validates its closed normalized input without modifying records`, () => {
    const input = command(action); const graph = structuredClone(original);
    assert.equal(validateRoadmapCommand(input, graph), true);
    assert.deepEqual(graph, original);
    assert.deepEqual(input, command(action));
  });
}
for (const field of ["actor", "roles", "policy_receipt", "created_at", "updated_at", "schema_version", "idempotency_key", "approved_by"]) {
  test(`caller cannot inject ${field} into mutation payload`, () => {
    const input = command("RECORD_PROGRESS"); input.payload[field] = "untrusted";
    assert.throws(() => validateRoadmapCommand(input, original), /Invalid roadmap command shape/);
  });
}
for (const [label, action, mutate, error] of [
  ["stale version", "RECORD_PROGRESS", (c) => { c.expected_version = 2; }, /expected version is stale/],
  ["foreign workspace", "RECORD_PROGRESS", (c) => { c.workspace_id = id(1); }, /scope mismatch/],
  ["foreign Product", "CREATE_FEATURE", (c) => { c.product_id = id(1); }, /scope mismatch/],
  ["wrong Product target", "CREATE_ROADMAP", (c) => { c.target_id = id(1); }, /scoped Product/],
  ["missing target", "UPDATE_FEATURE", (c) => { c.target_id = id(1); }, /target unavailable/],
  ["missing reorder member", "REORDER_MILESTONES", (c) => { c.payload.milestone_ids.pop(); }, /every active Milestone/],
  ["unknown reorder member", "REORDER_MILESTONES", (c) => { c.payload.milestone_ids[0] = id(1); }, /every active Milestone/],
  ["duplicate reorder member", "REORDER_MILESTONES", (c) => { c.payload.milestone_ids[0] = c.payload.milestone_ids[1]; }, /Invalid roadmap command shape/],
  ["occupied position", "CREATE_MILESTONE", (c) => { c.payload.position = 0; }, /position already exists/],
  ["empty progress rationale", "RECORD_PROGRESS", (c) => { c.payload.progress_note = " "; }, /requires a note/],
  ["same Milestone", "MOVE_ITEM", (c) => { c.payload.milestone_id = original.items[0].milestone_id; }, /must change Milestone/],
  ["unknown destination", "MOVE_ITEM", (c) => { c.payload.milestone_id = id(1); }, /destination unavailable/],
  ["empty movement rationale", "MOVE_ITEM", (c) => { c.payload.rationale = " "; }, /text cannot be blank/],
  ["partial item schedule", "UPDATE_ITEM_SCHEDULE", (c) => { c.payload.planned_end = null; }, /Incomplete item schedule/],
  ["reversed item schedule", "UPDATE_ITEM_SCHEDULE", (c) => { c.payload.planned_end = "2026-01-31"; }, /date window is reversed/],
  ["unscheduled commitment", "SET_ITEM_STATUS", (c) => { c.payload.status = "COMMITTED"; }, /complete schedule/],
]) {
  test(`command rejects ${label}`, () => {
    const input = command(action); mutate(input);
    assert.throws(() => validateRoadmapCommand(input, original), error);
  });
}
test("movement rejects a destination already containing the same Feature", () => {
  const graph = structuredClone(original);
  graph.items.push({ ...structuredClone(graph.items[0]), id: id(1), defining_initiative_id: id(2), milestone_id: graph.milestones[1].id });
  assert.throws(() => validateRoadmapCommand(command("MOVE_ITEM"), graph), /already contains this Feature/);
});
test("commitment still needs an exact revision when dates exist", () => {
  const graph = structuredClone(original);
  Object.assign(graph.items[0], { planned_start: "2026-01-01", planned_end: "2026-01-02" });
  const input = command("SET_ITEM_STATUS"); input.payload.status = "COMMITTED";
  assert.throws(() => validateRoadmapCommand(input, graph), /exact PRD reference/);
  input.payload.approved_prd_version_id = id(1);
  assert.equal(validateRoadmapCommand(input, graph), true);
  // The runtime must independently prove this reference is currently approved.
});

for (const [label, mutate, error] of [
  ["third reviewer", (p) => { p.initiative.gate_assignments.push({ gate_type: "CODE_READINESS", approver_user_id: id(52) }); }, /Invalid roadmap command shape/],
  ["Code reviewer substitution", (p) => { p.initiative.gate_assignments[1].gate_type = "CODE_READINESS"; }, /Invalid roadmap command shape/],
  ["duplicate Product assignment", (p) => { p.initiative.gate_assignments[1].gate_type = "PRD_APPROVAL"; }, /Invalid roadmap command shape/],
  ["missing Technical assignment", (p) => { p.initiative.gate_assignments.pop(); }, /Invalid roadmap command shape/],
  ["same reviewer at standard risk", (p) => { p.initiative.gate_assignments[1].approver_user_id = id(50); }, /distinct Product and Technical/],
  ["same reviewer at high risk", (p) => { p.initiative.risk_tier = "HIGH"; p.initiative.gate_assignments[1].approver_user_id = id(50); }, /distinct Product and Technical/],
  ["caller-provided Initiative identity", (p) => { p.initiative.id = id(70); }, /Invalid roadmap command shape/],
  ["caller-provided reciprocal link", (p) => { p.initiative.roadmap_item_id = id(71); }, /Invalid roadmap command shape/],
  ["caller-provided item identity", (p) => { p.id = id(71); }, /Invalid roadmap command shape/],
  ["pre-approved status", (p) => { p.status = "COMMITTED"; }, /Invalid roadmap command shape/],
  ["occupied Feature placement", (p) => { p.milestone_id = original.milestones[0].id; }, /already contains this Feature/],
  ["foreign Feature", (p) => { p.feature_id = id(70); }, /Feature unavailable/],
  ["foreign Milestone", (p) => { p.milestone_id = id(70); }, /Milestone unavailable/],
  ["partial schedule", (p) => { p.planned_start = "2026-01-01"; }, /Incomplete item schedule/],
]) {
  test(`joint creation rejects ${label}`, () => {
    const input = command("CREATE_ROADMAP_ITEM_INITIATIVE"); mutate(input.payload);
    assert.throws(() => validateRoadmapCommand(input, original), error);
  });
}
test("joint creation preserves the existing low-risk same-human reviewer rule", () => {
  const input = command("CREATE_ROADMAP_ITEM_INITIATIVE");
  input.payload.initiative.risk_tier = "LOW";
  input.payload.initiative.gate_assignments[1].approver_user_id = id(50);
  assert.equal(validateRoadmapCommand(input, original), true);
});
test("reviewer assignment order does not change the two required responsibilities", () => {
  const input = command("CREATE_ROADMAP_ITEM_INITIATIVE"); input.payload.initiative.gate_assignments.reverse();
  assert.equal(validateRoadmapCommand(input, original), true);
});
