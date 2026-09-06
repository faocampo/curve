import assert from "node:assert/strict";
import test from "node:test";
import { contentDigest } from "../lib/google-docs-checkpoint.mjs";
import { PRD_READINESS_PROFILE, evaluateSyntheticPrdReadiness, requireCurrentPrdReadiness } from "../lib/prd-readiness.mjs";
import { readinessFixture } from "./helpers/prd-readiness-fixture.mjs";

const body = (f, kind = "prd") => f[kind].content.tabs[0].documentTab.body.content;
const paragraph = (text, style) => ({ paragraph: { ...(style ? { paragraphStyle: { namedStyleType: style } } : {}), elements: [{ textRun: { content: text } }] } });
const refreshInventory = (f) => { f.inventory.prd_digest = contentDigest(f.prd.content); f.inventory.idea_brief_digest = contentDigest(f.idea_brief.content); };
const expected = (report) => Object.fromEntries(Object.entries(report).filter(([key]) => !["schema_version", "profile_digest", "status", "reasons"].includes(key)));

test("profile retains every section required by the manual definition contract", () => {
  assert.equal(PRD_READINESS_PROFILE.declaration_format, "PARAGRAPH_ID_COLON_TEXT");
  assert.deepEqual(PRD_READINESS_PROFILE.requirement_prefixes, ["FR", "REQ"]);
  assert.equal(PRD_READINESS_PROFILE.acceptance_prefix, "AC");
  assert.equal(PRD_READINESS_PROFILE.require_acceptance_coverage, true);
  assert.deepEqual(Object.keys(PRD_READINESS_PROFILE.idea_brief_sections), ["problem", "affected_users", "desired_outcomes", "non_goals", "constraints", "assumptions", "contradictions", "blockers", "unknowns"]);
  assert.deepEqual(Object.keys(PRD_READINESS_PROFILE.prd_sections), ["executive_summary", "problem_context", "goals", "non_goals", "personas", "workflow", "requirements", "gates", "integrations", "data_security", "quality", "rollout", "kpis", "acceptance", "risks", "assumptions", "open_questions"]);
});

for (const [section, text, reason] of [
  ["Requirements", "Some description", "PRD_REQUIREMENT_ID_REQUIRED"],
  ["Requirements", "FR-1: TBD", "PRD_REQUIREMENT_EMPTY"],
  ["Requirements", "FR-1: First\nFR-1: Duplicate", "PRD_REQUIREMENT_DUPLICATE"],
  ["Requirements", "FR-1: First\nFR-2: Uncovered", "PRD_REQUIREMENT_UNCOVERED"],
  ["Acceptance", "Some criterion", "PRD_ACCEPTANCE_ID_REQUIRED"],
  ["Acceptance", "AC-1: TBD", "PRD_ACCEPTANCE_EMPTY"],
  ["Acceptance", "AC-1: First FR-1\nAC-1: Duplicate FR-1", "PRD_ACCEPTANCE_DUPLICATE"],
  ["Acceptance", "AC-1: No linked requirement", "PRD_ACCEPTANCE_TRACE_REQUIRED"],
  ["Acceptance", "AC-1: Unknown FR-2", "PRD_ACCEPTANCE_UNKNOWN_REQUIREMENT"],
]) {
  test(`traceability rejects ${reason}`, () => {
    const f = readinessFixture(), nodes = body(f);
    const index = nodes.findIndex((node) => node.paragraph?.elements?.[0]?.textRun?.content?.trim() === section);
    nodes[index + 1] = paragraph(text); refreshInventory(f);
    assert.ok(evaluateSyntheticPrdReadiness(f).reasons.includes(reason));
  });
}

test("each normalized document must match its own file and workspace/Initiative identity", () => {
  for (const kind of ["prd", "idea_brief"]) for (const field of ["workspace_id", "initiative_id", "provider_file_id"]) {
    const f = readinessFixture(); f[kind][field] = "another-resource";
    assert.throws(() => evaluateSyntheticPrdReadiness(f), /READINESS_SOURCE_MISMATCH/);
  }
});

test("complete normalized definitions produce an immutable content-free readiness report", () => {
  const f = readinessFixture(), original = structuredClone(f), report = evaluateSyntheticPrdReadiness(f);
  assert.equal(report.status, "READY"); assert.deepEqual(report.reasons, []);
  assert.equal(requireCurrentPrdReadiness(report, expected(report)), true);
  assert.deepEqual(f, original);
  assert.equal(JSON.stringify(report).includes("fictional onboarding"), false);
  assert.throws(() => { report.reasons.push("forged"); }, TypeError);
});

for (const kind of ["prd", "idea_brief"]) {
  for (const mode of ["missing", "empty", "placeholder", "punctuated placeholder", "duplicate"]) {
    test(`${kind} ${mode} section blocks readiness`, () => {
      const f = readinessFixture(), nodes = body(f, kind);
      if (mode === "missing") nodes.splice(0, 2);
      if (mode === "empty") nodes[1] = paragraph("  \n");
      if (mode === "placeholder") nodes[1] = paragraph("TBD\n");
      if (mode === "punctuated placeholder") nodes[1] = paragraph("TBD.\n");
      if (mode === "duplicate") nodes.push(structuredClone(nodes[0]), paragraph("Another version"));
      refreshInventory(f);
      const report = evaluateSyntheticPrdReadiness(f);
      assert.equal(report.status, "BLOCKED");
      assert.ok(report.reasons.some((reason) => reason.startsWith(`${kind.toUpperCase()}_SECTION_`)));
      assert.throws(() => requireCurrentPrdReadiness(report, expected(report)), /PRD_READINESS_REQUIRED/);
    });
  }
}

test("deeper subsection body text satisfies its enclosing required section", () => {
  const f = readinessFixture(); body(f).splice(1, 0, paragraph("Supporting details", "HEADING_2"));
  refreshInventory(f); assert.equal(evaluateSyntheticPrdReadiness(f).status, "READY");
});
test("table cells and section-titled tabs with child content are supported", () => {
  const f = readinessFixture(), nodes = body(f);
  nodes[1] = { table: { tableRows: [{ tableCells: [{ content: [paragraph("Synthetic result")] }] }] } };
  const first = nodes.splice(0, 2);
  f.prd.content.tabs.push({ tabProperties: { tabId: "summary", title: "Executive summary" }, documentTab: { body: { content: [] } }, childTabs: [{ tabProperties: { tabId: "details", title: "Details" }, documentTab: { body: { content: [first[1]] } } }] });
  refreshInventory(f); assert.equal(evaluateSyntheticPrdReadiness(f).status, "READY");
});
test("a table of contents and footnotes cannot substitute for a missing body section", () => {
  const f = readinessFixture(), removed = body(f).splice(0, 2);
  body(f).push({ tableOfContents: { content: removed } });
  f.prd.content.tabs[0].documentTab.footnotes = { note: { content: removed } };
  refreshInventory(f); assert.ok(evaluateSyntheticPrdReadiness(f).reasons.includes("PRD_SECTION_MISSING:executive_summary"));
});

for (const [label, mutate, code] of [
  ["incomplete inventory", (f) => { f.inventory.complete = false; }, "READINESS_INVENTORY_STALE"],
  ["cross-workspace inventory", (f) => { f.inventory.workspace_id = "other-workspace"; }, "READINESS_INVENTORY_STALE"],
  ["cross-Initiative inventory", (f) => { f.inventory.initiative_id = "other-initiative"; }, "READINESS_INVENTORY_STALE"],
  ["changed PRD", (f) => { body(f)[1] = paragraph("Changed outcome"); }, "READINESS_INVENTORY_STALE"],
  ["changed Idea Brief", (f) => { body(f, "idea_brief")[1] = paragraph("Changed problem"); }, "READINESS_INVENTORY_STALE"],
  ["stale inventory", (f) => { f.inventory.checked_at = "2026-09-04T12:00:00Z"; }, "READINESS_INVENTORY_STALE"],
  ["open blocker", (f) => { f.inventory.blockers = [{ id: "blocker-example", state: "OPEN", resolution_ref: null }]; }, "BLOCKERS_UNRESOLVED"],
  ["resolution missing", (f) => { f.inventory.blockers = [{ id: "blocker-example", state: "RESOLVED", resolution_ref: "" }]; }, "BLOCKERS_UNRESOLVED"],
  ["inactive assumption owner", (f) => { f.inventory.assumptions = [{ id: "assumption-example", owner_actor_id: "inactive-person", validation_plan_ref: "plan-example", due_stage: "PLANNING" }]; }, "ASSUMPTION_PLAN_REQUIRED"],
  ["assumption plan missing", (f) => { f.inventory.assumptions = [{ id: "assumption-example", owner_actor_id: "author-example", validation_plan_ref: "", due_stage: "PLANNING" }]; }, "ASSUMPTION_PLAN_REQUIRED"],
  ["assumption stage missing", (f) => { f.inventory.assumptions = [{ id: "assumption-example", owner_actor_id: "author-example", validation_plan_ref: "plan-example", due_stage: "" }]; }, "ASSUMPTION_PLAN_REQUIRED"],
]) {
  test(`readiness blocks ${label}`, () => {
    const f = readinessFixture(); mutate(f); const original = structuredClone(f);
    assert.ok(evaluateSyntheticPrdReadiness(f).reasons.includes(code));
    assert.deepEqual(f, original);
  });
}

test("resolved blockers and owned assumptions with validation plans permit structural readiness", () => {
  const f = readinessFixture();
  f.inventory.blockers = [{ id: "blocker-example", state: "RESOLVED", resolution_ref: "resolution-example" }];
  f.inventory.assumptions = [{ id: "assumption-example", owner_actor_id: "author-example", validation_plan_ref: "plan-example", due_stage: "PLANNING" }];
  assert.equal(evaluateSyntheticPrdReadiness(f).status, "READY");
  f.inventory.assumptions[0].id = "blocker-example";
  assert.ok(evaluateSyntheticPrdReadiness(f).reasons.includes("READINESS_INVENTORY_INVALID"));
});

test("every exact subject field is required and stale reports cannot be reused", () => {
  const report = evaluateSyntheticPrdReadiness(readinessFixture()), subject = expected(report);
  for (const field of Object.keys(subject)) {
    const stale = { ...subject, [field]: field === "initiative_version" ? 99 : "different" };
    assert.throws(() => requireCurrentPrdReadiness(report, stale), /PRD_READINESS_STALE/, field);
    const missing = { ...subject }; delete missing[field];
    assert.throws(() => requireCurrentPrdReadiness(report, missing), /PRD_READINESS_REQUIRED/, field);
  }
  assert.throws(() => requireCurrentPrdReadiness({ ...report, raw_body: "synthetic" }, subject), /PRD_READINESS_REQUIRED/);
  assert.throws(() => requireCurrentPrdReadiness({ ...report, profile_digest: "unknown-profile" }, subject), /PRD_READINESS_REQUIRED/);
});

test("live use, malformed inventory and unsupported capture fail closed", () => {
  for (const [mutate, code] of [
    [(f) => { f.synthetic = false; }, "SYNTHETIC_ONLY"],
    [(f) => { f.prd.content.complete = false; }, "READINESS_CAPTURE_REQUIRED"],
    [(f) => { f.inventory.raw_body = "synthetic"; }, "READINESS_INVENTORY_INVALID"],
    [(f) => { f.inventory.blockers = [null]; }, "READINESS_INVENTORY_INVALID"],
    [(f) => { f.checked_at = "2026-09-05T11:59:60Z"; }, "READINESS_CONTEXT_INVALID"],
  ]) {
    const f = readinessFixture(); mutate(f);
    assert.throws(() => evaluateSyntheticPrdReadiness(f), new RegExp(code));
  }
});
