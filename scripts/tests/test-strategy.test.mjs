import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  extractDevelopmentPlanPackageTrace,
  validateTestStrategyMatrixSemantics,
} from "../lib/test-strategy.mjs";

const MATRIX_V1_BYTES = readFileSync(
  new URL("../../contracts/testing/ac-test-matrix-v1.json", import.meta.url),
);
const MATRIX_V1 = JSON.parse(MATRIX_V1_BYTES);
const MATRIX = JSON.parse(
  readFileSync(
    new URL("../../contracts/testing/ac-test-matrix-v2.json", import.meta.url),
    "utf8",
  ),
);
const SCHEMA_V1_BYTES = readFileSync(
  new URL("../../contracts/schemas/test-strategy-matrix.schema.json", import.meta.url),
);
const PRD_TEXT = readFileSync(
  new URL("../../docs/curve-ai-native-sdlc-prd.md", import.meta.url),
  "utf8",
);
const DEVELOPMENT_PLAN_TEXT = readFileSync(
  new URL("../../docs/technical/development-plan.md", import.meta.url),
  "utf8",
);
const STRATEGY_TEXT = readFileSync(
  new URL("../../docs/technical/m0-test-strategy.md", import.meta.url),
  "utf8",
);
const READINESS_TEXT = readFileSync(
  new URL("../../docs/technical/m0-readiness-board.md", import.meta.url),
  "utf8",
);

function validate(matrix = structuredClone(MATRIX), prdText = PRD_TEXT, planText = DEVELOPMENT_PLAN_TEXT) {
  return validateTestStrategyMatrixSemantics({
    matrix,
    prdText,
    developmentPlanText: planText,
  });
}

function criterion(matrix, acId) {
  return matrix.acceptance_criteria.find((entry) => entry.ac_id === acId);
}

test("both test-strategy versions bind all 60 PRD criteria by exact source digest", () => {
  for (const matrix of [MATRIX_V1, MATRIX]) {
    const result = validate(matrix);
    assert.equal(result.acceptanceCriteriaCount, 60);
    assert.equal(result.acceptanceCriteriaDigest, matrix.source.acceptance_criteria_digest);
  }
});

test("accepted v1 bytes remain immutable", () => {
  assert.equal(MATRIX_V1.status, "IN_REVIEW");
  assert.equal(MATRIX_V1.source.prd_version, "0.12");
  assert.equal(
    createHash("sha256").update(MATRIX_V1_BYTES).digest("hex"),
    "bad1a5a710ca16b3de399e1b0ff4b265d0c8ce64c203521f20e0d3f5ab2d3e3a",
  );
  assert.equal(
    createHash("sha256").update(SCHEMA_V1_BYTES).digest("hex"),
    "64fb3ce685c0d05ea5c5821b36843a76552361f0ad482397aa5d3bdadc5e7d16",
  );
});

test("v2 successor uses the current PRD and remains unapproved", () => {
  assert.equal(MATRIX.schema_version, "curve.test-strategy-matrix/v2");
  assert.equal(MATRIX.matrix_version, 2);
  assert.equal(MATRIX.status, "IN_REVIEW");
  assert.equal(MATRIX.source.prd_version, "0.13");
});

test("parenthetical package titles preserve canonical development-plan identifiers", () => {
  const packageTrace = extractDevelopmentPlanPackageTrace(DEVELOPMENT_PLAN_TEXT);
  assert.ok(packageTrace.has("M0-09"));
  assert.ok(packageTrace.has("M1-00A"));
  assert.ok(packageTrace.has("M1-01"));
  assert.equal(
    [...packageTrace.keys()].some((id) => id.includes("(")),
    false,
  );
});

test("P0-05 governance records the same accepted lifecycle and exact merge evidence", () => {
  assert.match(STRATEGY_TEXT, /\| Status \| `ACCEPTED \/ DONE` \|/);
  assert.match(STRATEGY_TEXT, /7d2794bad87a6e2e733ee8a53a650d8ea7658d22/);
  assert.match(STRATEGY_TEXT, /fdae85b33a235cd494dd36565698b2b5033a3389/);
  assert.match(STRATEGY_TEXT, /32619264292/);
  assert.match(READINESS_TEXT, /\| P0-05 test strategy \| DONE \|/);
  assert.doesNotMatch(STRATEGY_TEXT, /\| Status \| `IN_REVIEW` \|/);
  assert.match(STRATEGY_TEXT, /v2 successor[\s\S]*remains `IN_REVIEW`/);
  assert.match(STRATEGY_TEXT, /grants no package-readiness or implementation\s+authority/);
});

test("PRD criterion wording drift invalidates the source digest", () => {
  const changedPrd = PRD_TEXT.replace(
    "Curve requires the three assignments",
    "Curve requires only two assignments",
  );
  assert.throws(() => validate(structuredClone(MATRIX), changedPrd), /digest mismatch/);
});

test("a forged matrix source digest is rejected", () => {
  const matrix = structuredClone(MATRIX);
  matrix.source.acceptance_criteria_digest = `sha256:${"0".repeat(64)}`;
  assert.throws(() => validate(matrix), /digest mismatch/);
});

test("owning package must trace the assigned criterion in the development plan", () => {
  const matrix = structuredClone(MATRIX);
  criterion(matrix, "AC-01").owning_package = "M1-02";
  assert.throws(() => validate(matrix), /AC-01 is absent from development-plan trace/);
});

test("suite repository declarations cover every owned command", () => {
  const matrix = structuredClone(MATRIX);
  matrix.suites.find((suite) => suite.id === "S-CONTRACT").repositories = ["CURVE"];
  assert.throws(() => validate(matrix), /belongs to undeclared repository PLANE/);
});

test("criterion commands must be owned by a referenced suite", () => {
  const matrix = structuredClone(MATRIX);
  criterion(matrix, "AC-01").command_ids.push("CMD-LOAD");
  assert.throws(() => validate(matrix), /CMD-LOAD is not owned by a referenced suite/);
});

test("environment-blocked coverage cannot target an available environment", () => {
  const matrix = structuredClone(MATRIX);
  criterion(matrix, "AC-06").environment = "E-PLANE-TEST-CI";
  assert.throws(() => validate(matrix), /claims an environment block in available/);
});

test("partial coverage requires at least one available evidence command", () => {
  const matrix = structuredClone(MATRIX);
  criterion(matrix, "AC-34").command_ids = ["CMD-BROWSER-E2E"];
  assert.throws(() => validate(matrix), /partial coverage without an available evidence command/);
});

test("implemented-passing coverage rejects planned suites or commands", () => {
  const matrix = structuredClone(MATRIX);
  criterion(matrix, "AC-01").coverage_state = "IMPLEMENTED_PASSING";
  assert.throws(() => validate(matrix), /claims passing coverage with planned evidence/);
});

test("read-only Onyx and MCP retrieval does not inherit the model destination decision", () => {
  const matrix = structuredClone(MATRIX);
  criterion(matrix, "AC-04").blocking_decisions.push("D-005");
  assert.throws(
    () => validate(matrix),
    /AC-04 read-only retrieval must be gated by D-002 and D-007 only/,
  );
});

test("duplicate catalog identifiers are rejected", () => {
  const matrix = structuredClone(MATRIX);
  matrix.suites.push(structuredClone(matrix.suites[0]));
  assert.throws(() => validate(matrix), /duplicate suite identifiers/);
});

test("reordered criteria are rejected", () => {
  const matrix = structuredClone(MATRIX);
  [matrix.acceptance_criteria[0], matrix.acceptance_criteria[1]] = [
    matrix.acceptance_criteria[1],
    matrix.acceptance_criteria[0],
  ];
  assert.throws(() => validate(matrix), /ordered AC-01 through AC-60/);
});
