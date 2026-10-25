import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateDeclaredProgressChange, validateRoadmapDomainGraph } from "../lib/roadmap-domain.mjs";

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
  graph.items.push({ ...graph.items[0], id: id(1), initiative_id: id(2), milestone_id: graph.milestones[1].id });
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
    g.items.push({ ...g.items[0], id: id(1), initiative_id: id(2) });
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
    approved_prd_revision_id: id(1), version: 2, updated_at: "2025-12-31T00:00:00Z",
  });
  assert.equal(validateRoadmapDomainGraph(graph), true);
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
