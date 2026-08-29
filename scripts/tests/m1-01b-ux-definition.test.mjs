import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const contract = fs.readFileSync(
  new URL("../../docs/technical/ux-m1-01b-initiative-shell.md", import.meta.url),
  "utf8",
);
const readiness = fs.readFileSync(
  new URL("../../docs/technical/m1-alignment-evidence-prd-task-packet.md", import.meta.url),
  "utf8",
);
const prototype = fs.readFileSync(
  new URL("../../docs/design/prototypes/m1-01b-initiative-shell/index.html", import.meta.url),
  "utf8",
);

test("M1-01B records exact-commit UX approval without authorizing Plane implementation", () => {
  const readinessRow = readiness
    .split("\n")
    .find(
      (line) =>
        line.startsWith("| M1-01B (Initiative shell) |") &&
        line.includes("`UX_APPROVED / PACKET_FINALIZATION_REQUIRED`"),
    );

  assert.ok(readinessRow, "M1-01B readiness row must exist");
  assert.match(contract, /status: APPROVED/);
  assert.match(contract, /implementation_authorized: false/);
  assert.match(
    contract,
    /reviewed_curve_commit: 656a196aaba884ad297d48d6ed150ef7f246f194/,
  );
  assert.match(contract, /result: PASS/);
  assert.match(contract, /test_executor: Codex/);
  assert.match(contract, /test_result: PASS/);
  assert.match(readinessRow, /`UX_APPROVED \/ PACKET_FINALIZATION_REQUIRED`/);
  assert.doesNotMatch(readinessRow, /`DONE/);
});

test("M1-01B binds the complete task-based prototype review", () => {
  for (let task = 1; task <= 10; task += 1) {
    assert.match(contract, new RegExp(`\\| T${task} \\|`));
  }
  assert.match(contract, /UX-006-M1-01B/);
  assert.match(contract, /UX-007-M1-01B/);
  assert.match(prototype, /Prototype controls/);
  assert.match(prototype, /Create initiative/);
  assert.match(prototype, /Product Approver/);
  assert.match(prototype, /Technical Approver/);
  assert.match(prototype, /Code Approver/);
  assert.match(prototype, /function validateApprovers/);
  assert.match(prototype, /new Set\(personIds\)\.size !== personIds\.length/);
  assert.match(prototype, /Choose three different people for Product, Technical, and Code approval/);
  assert.match(prototype, /function selectedApprover/);
  assert.match(prototype, /class="identity-copy"/);
  assert.match(prototype, /class="gate-copy"/);
  assert.match(prototype, /\.initiative-row > \.badge \{ min-width: 76px/);
  assert.match(prototype, /aria-label="Help"/);
  assert.match(prototype, /cy="17\.25" r="0\.8"/);
  assert.doesNotMatch(prototype, /\.initiative-row:not\(\.active\)/);
  assert.match(prototype, /function resetCreateForm/);
  assert.match(prototype, /el\["initiative-form"\]\.reset\(\)/);
  assert.match(prototype, /placeholder="e\.g\. Improve experiment rollout confidence"/);
  assert.match(prototype, /class="state-icon \$\{name\}"/);
  assert.match(prototype, /class="state-content state-\$\{name\}"/);
});
