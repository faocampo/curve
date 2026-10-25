import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateDeclaredProgressChange, validateRoadmapDomainGraph, validateRoadmapItemChange } from "../lib/roadmap-domain.mjs";

const fixture = JSON.parse(readFileSync(new URL(
  "../../contracts/candidates/roadmap-domain-v1/graph.valid.json", import.meta.url,
), "utf8"));
const id = (n) => `93000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const fresh = () => structuredClone(fixture);

test("roadmap conformance accepts a proposed unscheduled item without mutating inputs", () => {
  const graph = fresh();
  assert.equal(validateRoadmapDomainGraph(graph), true);
  assert.deepEqual(graph, fixture);
});

test("one Feature may occur in multiple Milestones through distinct Initiatives", () => {
  const graph = fresh();
  graph.items.push({ ...graph.items[0], id: id(1), defining_initiative_id: id(2), milestone_id: graph.milestones[1].id });
  assert.equal(validateRoadmapDomainGraph(graph), true);
});

for (const [label, mutate, error] of [
  ["workspace isolation", (g) => { g.features[0].workspace_id = id(1); }, /workspace mismatch/],
  ["Product isolation", (g) => { g.milestones[0].product_id = id(1); }, /Product mismatch/],
  ["duplicate identity", (g) => { g.features.push({ ...g.features[0] }); }, /Duplicate aggregate/],
  ["missing roadmap", (g) => { g.roadmaps = []; }, /Missing Milestone Roadmap/],
  ["missing feature", (g) => { g.features = []; }, /Missing item Feature/],
  ["missing milestone", (g) => { g.items[0].milestone_id = id(1); }, /Milestone\/Roadmap mismatch/],
  ["cross-roadmap milestone", (g) => {
    g.roadmaps.push({ ...g.roadmaps[0], id: id(1) }); g.items[0].roadmap_id = id(1);
  }, /Milestone\/Roadmap mismatch/],
  ["duplicate position", (g) => { g.milestones[1].position = 0; }, /Duplicate Milestone position/],
  ["duplicate feature placement", (g) => {
    g.items.push({ ...g.items[0], id: id(1), defining_initiative_id: id(2) });
  }, /Feature occurs twice/],
  ["duplicate defining initiative", (g) => {
    g.items.push({ ...g.items[0], id: id(1), milestone_id: g.milestones[1].id });
  }, /Initiative defines more than one/],
  ["partial schedule", (g) => { g.items[0].planned_start = "2026-01-01"; }, /Incomplete item schedule/],
  ["reversed schedule", (g) => {
    Object.assign(g.items[0], { planned_start: "2026-02-02", planned_end: "2026-02-01" });
  }, /ends before/],
  ["impossible calendar date", (g) => {
    Object.assign(g.items[0], { planned_start: "2026-02-30", planned_end: "2026-03-01" });
  }, /Invalid roadmap domain shape/],
  ["missing approved revision", (g) => {
    Object.assign(g.items[0], { status: "COMMITTED", planned_start: "2026-01-01", planned_end: "2026-01-01" });
  }, /requires exact PRD/],
  ["unknown format edition", (g) => { g.items[0].schema_version = "2.0"; }, /Invalid roadmap domain shape/],
  ["caller extension", (g) => { g.items[0].extra_authority = true; }, /Invalid roadmap domain shape/],
  ["non-UTC timestamp", (g) => { g.items[0].updated_at = "2026-01-01T03:00:00+03:00"; }, /Invalid roadmap domain shape/],
  ["incorrect item owner", (g) => { g.items[0].owner.actor_id = id(1); }, /Roadmap owner/],
  ["reversed horizon", (g) => {
    Object.assign(g.roadmaps[0], { horizon_start: "2026-03-01", horizon_end: "2026-02-01" });
  }, /horizon ends before/],
  ["reversed milestone target", (g) => {
    Object.assign(g.milestones[0], { target_start: "2026-03-01", target_end: "2026-02-01" });
  }, /target ends before/],
  ["unattributed tombstone", (g) => { g.items[0].tombstoned_at = "2026-01-02T00:00:00Z"; }, /requires actor/],
  ["orphan tombstone reason", (g) => { g.items[0].tombstone_reason = "Reason"; }, /Unexpected tombstone/],
  ["raw scope body", (g) => { g.items[0].scope_body = "Protected prose"; }, /Invalid roadmap domain shape/],
  ["missing actor attribution", (g) => { delete g.items[0].created_by; }, /Invalid roadmap domain shape/],
  ["abbreviated milestone type", (g) => { g.milestones[0].type = "RELEASE"; }, /Invalid roadmap domain shape/],
]) {
  test(`roadmap conformance rejects ${label}`, () => {
    const graph = fresh(); mutate(graph);
    assert.throws(() => validateRoadmapDomainGraph(graph), error);
  });
}

for (const status of ["COMMITTED", "IN_PROGRESS", "PAUSED", "DELIVERED", "CANCELLED"]) {
  test(`${status} requires a complete schedule`, () => {
    const graph = fresh(); graph.items[0].status = status;
    assert.throws(() => validateRoadmapDomainGraph(graph), /Only PROPOSED/);
  });
}

test("inclusive one-day schedules and UTC clock rollback remain valid", () => {
  const graph = fresh();
  Object.assign(graph.items[0], {
    status: "COMMITTED", planned_start: "2026-02-28", planned_end: "2026-02-28",
    approved_prd_version_id: id(1), version: 2, updated_at: "2025-12-31T00:00:00Z",
  });
  assert.equal(validateRoadmapDomainGraph(graph), true);
});

test("optional planning horizons and milestone targets may have one date", () => {
  const graph = fresh();
  graph.roadmaps[0].horizon_start = "2026-01-01";
  graph.milestones[0].target_end = "2026-06-30";
  assert.equal(validateRoadmapDomainGraph(graph), true);
});

test("all canonical milestone types and attributed tombstones are retained", () => {
  for (const type of ["RELEASE_VERSION", "CALENDAR_PERIOD", "PRODUCT_OUTCOME", "INTERNAL_DEVELOPMENT_PHASE"]) {
    const graph = fresh(); graph.milestones[0].type = type;
    Object.assign(graph.items[0], { tombstoned_at: "2026-01-02T00:00:00Z",
      tombstoned_by: graph.items[0].owner, tombstone_reason: "Retired with history retained" });
    assert.equal(validateRoadmapDomainGraph(graph), true);
  }
});

const progress = (before, after, note = "", actorId = "owner") =>
  validateDeclaredProgressChange({ before, after, note, actorId, roadmapOwnerId: "owner" });

test("progress increases below 20 points may have an empty note", () => {
  assert.equal(progress(10, 29), true);
  assert.equal(progress(100, 100), true);
});
for (const [before, after] of [[10, 30], [10, 31], [10, 9], [100, 0]]) {
  test(`progress ${before} to ${after} requires meaningful rationale`, () => {
    assert.throws(() => progress(before, after, " \n "), /requires a note/);
    assert.equal(progress(before, after, "Scope estimate revised"), true);
  });
}
for (const value of [-1, 101, 1.5, "10", null, NaN]) {
  test(`progress rejects invalid percentage ${String(value)}`, () => {
    assert.throws(() => progress(0, value, "Reason"), /integer/);
    assert.throws(() => progress(value, 0, "Reason"), /integer/);
  });
}
test("another member cannot substitute for the Roadmap owner", () => {
  assert.throws(() => progress(10, 20, "Reason", "another-member"), /Roadmap owner/);
  assert.throws(() => validateDeclaredProgressChange({ before: 0, after: 10, note: "" }), /Roadmap owner/);
});

function change(kind = "PROGRESS_CHANGED") {
  const before = fresh(); const after = fresh();
  const oldItem = before.items[0]; const item = after.items[0];
  item.version = 2;
  item.updated_at = "2026-01-02T00:00:00Z";
  const history = { schema_version: "1.0", id: id(80), workspace_id: before.workspace_id,
    product_id: before.product_id, roadmap_item_id: item.id, sequence: 1, before_version: 1, after_version: 2,
    recorded_at: "2026-01-02T00:00:01Z", recorded_by: item.owner, change_type: kind };
  if (kind === "PROGRESS_CHANGED") {
    item.declared_progress = 25; item.progress_note = "Initial scope completed";
    history.before = { declared_progress: oldItem.declared_progress, progress_note: oldItem.progress_note };
    history.after = { declared_progress: item.declared_progress, progress_note: item.progress_note };
  } else {
    item.milestone_id = after.milestones[1].id;
    Object.assign(history, { before: { milestone_id: oldItem.milestone_id }, after: { milestone_id: item.milestone_id },
      rationale: "Scope rescheduled", expected_schedule_impact: "Moves to the later planning window" });
  }
  return { before, after, history, previousSequence: 0 };
}

for (const kind of ["PROGRESS_CHANGED", "MILESTONE_MOVED"]) {
  test(`${kind} binds exact state and immutable-history content without mutating inputs`, () => {
    const input = change(kind); const original = structuredClone(input);
    assert.equal(validateRoadmapItemChange(input), true);
    assert.deepEqual(input, original);
  });
  for (const [label, mutate, error] of [
    ["stale expected version", (c) => { c.history.before_version = 2; }, /version must advance/],
    ["double increment", (c) => { c.after.items[0].version = 3; c.history.after_version = 3; }, /version must advance/],
    ["sequence reuse", (c) => { c.previousSequence = 1; }, /sequence must advance/],
    ["foreign workspace", (c) => { c.history.workspace_id = id(3); }, /History scope mismatch/],
    ["foreign Product", (c) => { c.history.product_id = id(3); }, /History scope mismatch/],
    ["wrong actor", (c) => { c.history.recorded_by = { actor_type: "HUMAN", actor_id: id(3) }; }, /owner attribution/],
    ["unrelated field change", (c) => { c.after.items[0].priority = "HIGH"; }, /unrelated fields/],
    ["changed creation time", (c) => { c.after.items[0].created_at = "2026-01-02T00:00:00Z"; }, /unrelated fields/],
    ["unrelated aggregate change", (c) => { c.after.features[0].name = "Unexpected"; }, /unrelated fields/],
    ["history target substitution", (c) => { c.history.roadmap_item_id = id(7); }, /target must exist/],
  ]) {
    test(`${kind} rejects ${label}`, () => {
      const input = change(kind); mutate(input);
      assert.throws(() => validateRoadmapItemChange(input), error);
    });
  }
}
test("progress history cannot substitute a different value or note", () => {
  for (const field of ["declared_progress", "progress_note"]) {
    const input = change(); input.history.after[field] = field === "declared_progress" ? 30 : "Different";
    assert.throws(() => validateRoadmapItemChange(input), /differs from the item delta/);
  }
});
test("movement requires meaningful rationale and schedule impact", () => {
  for (const field of ["rationale", "expected_schedule_impact"]) {
    const input = change("MILESTONE_MOVED"); input.history[field] = " \n ";
    assert.throws(() => validateRoadmapItemChange(input), /requires rationale/);
  }
});
test("movement history must name the actual previous and next Milestones", () => {
  const input = change("MILESTONE_MOVED"); input.history.before.milestone_id = id(3);
  assert.throws(() => validateRoadmapItemChange(input), /differs from the item delta/);
});
test("history accepts clock rollback while requiring incremented versions", () => {
  const input = change(); input.after.items[0].updated_at = "2025-12-31T00:00:00Z";
  input.history.recorded_at = "2025-12-31T00:00:01Z";
  assert.equal(validateRoadmapItemChange(input), true);
});
