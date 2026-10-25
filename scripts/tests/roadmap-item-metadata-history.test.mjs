import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateRoadmapItemChange, validateRoadmapItemMetadataChange } from "../lib/roadmap-domain.mjs";

const fixture = JSON.parse(readFileSync(new URL(
  "../../contracts/candidates/roadmap-domain-v1/graph.valid.json", import.meta.url,
), "utf8"));
const otherId = "93000000-0000-4000-8000-000000000099";
const changes = {
  PRIORITY_CHANGED: { priority: "CRITICAL" },
  HEALTH_CHANGED: { health: "OFF_TRACK" },
  CONFIDENCE_CHANGED: { confidence: "HIGH" },
  SCHEDULE_CHANGED: { planned_start: "2026-02-01", planned_end: "2026-02-28" },
};
function example(kind) {
  const before = structuredClone(fixture);
  const after = structuredClone(before);
  const old = before.items[0]; const item = after.items[0];
  Object.assign(item, changes[kind], { version: 2, updated_at: "2026-01-02T00:00:00Z" });
  const fields = Object.keys(changes[kind]);
  return { before, after, previousSequence: 0, history: {
    schema_version: "1.0", id: otherId, workspace_id: before.workspace_id, product_id: before.product_id,
    roadmap_item_id: item.id, sequence: 1, before_version: 1, after_version: 2,
    recorded_at: item.updated_at, recorded_by: structuredClone(item.updated_by), change_type: kind,
    before: Object.fromEntries(fields.map((field) => [field, old[field]])),
    after: Object.fromEntries(fields.map((field) => [field, item[field]])), rationale: "Updated planning evidence",
  } };
}
for (const kind of Object.keys(changes)) {
  test(`${kind} records exact metadata without mutating input or changing the legacy history contract`, () => {
    const input = example(kind); const original = structuredClone(input);
    assert.equal(validateRoadmapItemMetadataChange(input), true);
    assert.deepEqual(input, original);
    assert.throws(() => validateRoadmapItemChange(input), /Invalid item history shape/);
  });
  for (const [label, mutate, error] of [
    ["missing rationale", (c) => { delete c.history.rationale; }, /history shape/],
    ["blank rationale", (c) => { c.history.rationale = " \n "; }, /requires rationale/],
    ["oversized rationale", (c) => { c.history.rationale = "x".repeat(10001); }, /history shape/],
    ["extra history content", (c) => { c.history.authorized = true; }, /history shape/],
    ["extra delta field", (c) => { c.history.after.approved = true; }, /history shape/],
    ["missing delta field", (c) => { delete c.history.before[Object.keys(changes[kind])[0]]; }, /history shape/],
    ["mismatched old value", (c) => { c.history.before = structuredClone(c.history.after); }, /differs from the item delta/],
    ["mismatched new value", (c) => { c.history.after = structuredClone(c.history.before); }, /differs from the item delta/],
    ["foreign workspace", (c) => { c.history.workspace_id = otherId; }, /scope mismatch/],
    ["foreign Product", (c) => { c.history.product_id = otherId; }, /scope mismatch/],
    ["wrong item", (c) => { c.history.roadmap_item_id = otherId; }, /target must exist/],
    ["wrong owner", (c) => { c.history.recorded_by.actor_id = otherId; }, /owner attribution/],
    ["wrong updater", (c) => { c.after.items[0].updated_by.actor_id = otherId; }, /owner attribution/],
    ["stale version", (c) => { c.history.before_version = 2; }, /version must advance/],
    ["double version", (c) => { c.history.after_version = 3; c.after.items[0].version = 3; }, /version must advance/],
    ["reused sequence", (c) => { c.previousSequence = 1; }, /sequence must advance/],
    ["fractional sequence", (c) => { c.history.sequence = 1.5; }, /history shape/],
    ["changed creation time", (c) => { c.after.items[0].created_at = c.after.items[0].updated_at; }, /unrelated fields/],
    ["changed scope", (c) => { c.after.items[0].scope_body.size_bytes += 1; }, /unrelated fields/],
    ["changed progress", (c) => { c.after.items[0].declared_progress = 10; }, /unrelated fields/],
    ["changed approval", (c) => { c.after.items[0].approved_prd_version_id = otherId; }, /unrelated fields/],
    ["changed other aggregate", (c) => { c.after.features[0].name = "Different"; }, /unrelated fields/],
  ]) {
    test(`${kind} rejects ${label}`, () => {
      const input = example(kind); mutate(input);
      assert.throws(() => validateRoadmapItemMetadataChange(input), error);
    });
  }
  test(`${kind} preserves version order under clock rollback`, () => {
    const input = example(kind);
    input.history.recorded_at = input.after.items[0].updated_at = "2025-12-01T00:00:00Z";
    assert.equal(validateRoadmapItemMetadataChange(input), true);
  });
}
for (const kind of ["PRIORITY_CHANGED", "HEALTH_CHANGED", "CONFIDENCE_CHANGED"]) {
  test(`${kind} rejects unsupported enum values`, () => {
    const input = example(kind); input.history.after[Object.keys(changes[kind])[0]] = "UNSUPPORTED";
    assert.throws(() => validateRoadmapItemMetadataChange(input), /history shape/);
  });
}
for (const [label, dates] of [
  ["half schedule", { planned_start: null, planned_end: "2026-02-28" }],
  ["reversed schedule", { planned_start: "2026-03-01", planned_end: "2026-02-28" }],
  ["invalid date", { planned_start: "2026-02-30", planned_end: "2026-03-01" }],
]) {
  test(`schedule history rejects ${label}`, () => {
    const input = example("SCHEDULE_CHANGED"); Object.assign(input.after.items[0], dates);
    input.history.after = dates;
    assert.throws(() => validateRoadmapItemMetadataChange(input), /schedule|domain shape/);
  });
}
test("a proposed item may remove its entire schedule with exact history", () => {
  const input = example("SCHEDULE_CHANGED");
  Object.assign(input.before.items[0], input.history.after);
  input.history.before = structuredClone(input.history.after);
  input.history.after = { planned_start: null, planned_end: null };
  Object.assign(input.after.items[0], input.history.after);
  assert.equal(validateRoadmapItemMetadataChange(input), true);
  input.before.items[0].status = input.after.items[0].status = "IN_PROGRESS";
  assert.throws(() => validateRoadmapItemMetadataChange(input), /PROPOSED/);
});
