import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const agentRules = read("AGENTS.md");
const integrations = read("docs/technical/integration-contracts.md");
const security = read("docs/technical/security-and-operations.md");
const technicalIndex = read("docs/technical/README.md");

test("AI coding agents fail closed before disclosing X3M-internal information", () => {
  assert.match(agentRules, /MUST\s+NOT disclose any information that is internal to X3M/);
  assert.match(agentRules, /Uncertainty fails closed/);
  assert.match(agentRules, /inspect the complete outbound diff and all attached\/generated material/);
  assert.match(agentRules, /example\.invalid/);
  assert.match(agentRules, /issues, pull requests, review\s+comments, or release notes/);
});

test("security policy protects every public repository surface", () => {
  assert.match(security, /### Public-repository disclosure control/);
  assert.match(security, /An ambiguous value fails closed/);
  assert.match(security, /Before any public Git or GitHub mutation/);
  assert.match(security, /Secrets scanning supplements but does not replace/);
  assert.match(security, /approved private X3M system/);
});

test("Google Docs remains external authoring with immutable Curve checkpoints", () => {
  assert.match(integrations, /## External document authoring and Google Workspace/);
  assert.match(integrations, /Google Docs may remain the human-visible authoring system/);
  assert.match(integrations, /DocumentCheckpoint/);
  assert.match(integrations, /CHANGED_SINCE_SUBMISSION/);
  assert.match(integrations, /ALIGNING[\s\S]*PRD_REVIEW[\s\S]*PLANNING/);
  assert.match(integrations, /Drive version and\s+revision identifiers detect change but are not sufficient approval evidence/);
});

test("public contracts exclude the private X3M deployment profile", () => {
  assert.match(integrations, /### Public and private configuration split/);
  assert.match(integrations, /An approved private X3M deployment profile contains/);
  assert.match(integrations, /must never enter this public repository/);
  assert.match(integrations, /only synthetic public-safe data/);
  assert.match(technicalIndex, /external Google Docs authoring/);
  assert.match(technicalIndex, /public-repository disclosure control/);
});
