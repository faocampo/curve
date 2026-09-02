import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) =>
  fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const grant = read("docs/technical/m1-01b-human-execution-grant.md");
const decision = read("docs/technical/m1-01b-execution-grant-decision.md");
const packet = read("docs/technical/m1-01b-initiative-shell-implementation-task-packet.md");
const index = read("docs/technical/README.md");
const development = read("docs/technical/development-plan.md");
const m1Plan = read("docs/technical/m1-alignment-evidence-prd-task-packet.md");

test("M1-01B binds one exact human-operated frontend attempt", () => {
  for (const value of [
    "HUMAN_OPERATED_OUTSIDE_CURVE_DISPATCH",
    "git@github.com:faocampo/plane.git",
    "c516a612a29751b0d24bcbd32bfcba1bd73fe3af",
    "curve/m1-01b-initiative-shell",
    "PVTI_lAHOBNjuQc4BgZzOzg4vNto",
    "sha256:f73da68a96dc75206967ec60b82c2e252c3ea0651fc5af33b0c1005ccfb19377",
    "US$0",
    "CURVE_ENABLED=0",
  ]) {
    assert.match(grant, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(grant, /B-CODING-TOOLS-01[\s\S]*`DEFERRED_TO_M4`/);
  assert.match(grant, /three distinct active human IDs/);
  assert.match(grant, /Every matching loaded Initiative must remain[\s\S]*visible on mobile/);
  assert.match(grant, /create form must reset on every new opening/);
  assert.match(grant, /manual UX\/UI[\s\S]*before merge/i);
  assert.match(grant, /zero open Critical or High finding/);
  assert.match(grant, /no protected body, credential, secret/);
  assert.match(grant, /incomplete offline store after downloading zero packages/);
  assert.match(grant, /package\.json[\s\S]*pnpm-lock\.yaml[\s\S]*pnpm-workspace\.yaml/);
  assert.match(grant, /copy-on-write clones every ignored `node_modules`/);
  assert.match(grant, /verifies that no tracked file changed/);
  assert.match(packet, /copy-on-write reuse every ignored `node_modules` directory/);
});

test("M1-01B keeps machine and production dispatch fail closed", () => {
  assert.match(decision, /DECIDED \/ HUMAN_OPERATED_OUTSIDE_CURVE_DISPATCH \/ MACHINE_DISPATCH_BLOCKED/);
  assert.match(decision, /implementation_authority_granted: false/);
  assert.match(decision, /curve_machine_dispatch_status: BLOCKED/);
  assert.match(decision, /production_dispatch_status: BLOCKED/);
  assert.match(packet, /HUMAN_EXECUTION_GRANTED \/ MACHINE_DISPATCH_BLOCKED \/ UX_ACCEPTANCE_REQUIRED_BEFORE_MERGE/);
});

test("M1-01B planning surfaces agree on the active human path and UX gate", () => {
  for (const surface of [index, development, m1Plan]) {
    assert.match(surface, /m1-01b-human-execution-grant\.md/);
    assert.match(surface, /human-operated/i);
    assert.match(surface, /manual UX acceptance/i);
  }
});
