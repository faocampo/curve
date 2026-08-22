import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateTestStrategyMatrixSemantics } from "../lib/test-strategy.mjs";

const MATRIX = JSON.parse(
  readFileSync(
    new URL("../../contracts/testing/ac-test-matrix-v1.json", import.meta.url),
    "utf8",
  ),
);
const PRD_TEXT = readFileSync(
  new URL("../../docs/curve-ai-native-sdlc-prd.md", import.meta.url),
  "utf8",
);
const DEVELOPMENT_PLAN_TEXT = readFileSync(
  new URL("../../docs/technical/development-plan.md", import.meta.url),
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

test("canonical test strategy binds all 60 PRD criteria by exact source digest", () => {
  const result = validate();
  assert.equal(result.acceptanceCriteriaCount, 60);
  assert.equal(result.acceptanceCriteriaDigest, MATRIX.source.acceptance_criteria_digest);
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
