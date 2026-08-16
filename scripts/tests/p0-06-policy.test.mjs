import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  P0_06A_READY_PRISTINE_CLAIM,
  P0_06A_READY_PRISTINE_REVIEW,
  ProofPolicyError,
  executeSingleExistingItemStatusUpdate,
  executeValidatedSingleExistingItemStatusUpdate,
  extractLegacyProjectedStatus,
  selectUniqueProjectItem,
  validateP0_06AReadyPristineState,
  validateSingleApplyRequest,
} from "../lib/p0-06-policy.mjs";

const STAGE_RECORD = JSON.parse(
  readFileSync(new URL("../../docs/technical/proofs/p0-06-stage-record.json", import.meta.url), "utf8"),
);
const STAGE_A = STAGE_RECORD.stages["P0-06A"];
const SYNCHRONIZER_PATH = fileURLToPath(new URL("../sync-github-project.mjs", import.meta.url));

test("pristine claim and review contracts exactly match the current P0-06A projection", () => {
  assert.deepEqual(STAGE_A.claim, P0_06A_READY_PRISTINE_CLAIM);
  assert.deepEqual(STAGE_A.review, P0_06A_READY_PRISTINE_REVIEW);
  assert.equal(
    validateP0_06AReadyPristineState({
      claim: structuredClone(STAGE_A.claim),
      review: structuredClone(STAGE_A.review),
    }),
    true,
  );
});

test("stage readiness carries the pending broker and publication-attestation contract fields", () => {
  const readiness = STAGE_A.readiness;
  const expected = {
    broker_conformance_report_path: "docs/technical/proofs/p0-06a/authorization/broker-conformance-report.json",
    broker_conformance_report_digest: null,
    broker_claim_ruleset_recheck_policy_path:
      "docs/technical/proofs/p0-06a/authorization/broker-claim-ruleset-recheck-policy.json",
    broker_claim_ruleset_recheck_policy_digest: null,
    publication_attestation_schema_path:
      "docs/technical/proofs/p0-06a/authorization/publication-attestation.schema.json",
    publication_attestation_schema_digest: null,
    publication_attestation_verification_key_path:
      "docs/technical/proofs/p0-06a/authorization/publication-attestation-verification-key.pem",
    publication_attestation_verification_key_digest: null,
    publication_attestation_key_id: null,
    publication_attestation_store_uri_template: null,
  };
  for (const [field, value] of Object.entries(expected)) assert.equal(readiness[field], value, field);
});

function changed(value) {
  if (value === null) return "unexpected";
  if (typeof value === "boolean") return !value;
  if (typeof value === "number") return value + 1;
  return `${value}-changed`;
}

for (const [name, template, otherName, otherTemplate] of [
  ["claim", P0_06A_READY_PRISTINE_CLAIM, "review", P0_06A_READY_PRISTINE_REVIEW],
  ["review", P0_06A_READY_PRISTINE_REVIEW, "claim", P0_06A_READY_PRISTINE_CLAIM],
]) {
  test(`every pristine ${name} field rejects mutation, deletion, and extras`, () => {
    for (const field of Object.keys(template)) {
      for (const operation of ["mutate", "delete"]) {
        const target = structuredClone(template);
        if (operation === "delete") delete target[field];
        else target[field] = changed(target[field]);
        assert.throws(
          () => validateP0_06AReadyPristineState({
            [name]: target,
            [otherName]: structuredClone(otherTemplate),
          }),
          ProofPolicyError,
          `${name}.${field}.${operation}`,
        );
      }
    }
    const target = structuredClone(template);
    target.unapproved = null;
    assert.throws(
      () => validateP0_06AReadyPristineState({
        [name]: target,
        [otherName]: structuredClone(otherTemplate),
      }),
      ProofPolicyError,
    );
  });
}

test("single-item apply policy requires one explicit assignment", () => {
  assert.deepEqual(
    validateSingleApplyRequest({
      assignments: [{ taskId: "P0-05", status: "Ready" }],
    }),
    { taskId: "P0-05", status: "Ready" },
  );
  for (const assignments of [
    [],
    [{ taskId: "P0-05", status: "Ready" }, { taskId: "P0-07", status: "Backlog" }],
    [{ taskId: "P0-05", status: "Ready", extra: true }],
  ]) {
    assert.throws(
      () => validateSingleApplyRequest({ assignments }),
      ProofPolicyError,
    );
  }
  assert.deepEqual(
    validateSingleApplyRequest({ assignments: [{ taskId: "P0-06", status: "Ready" }] }),
    { taskId: "P0-06", status: "Ready" },
  );
});

test("title-or-marker candidate selection fences a drifted duplicate before mutation", () => {
  const marker = "<!-- curve-project-sync:v1 id=P0-05 -->";
  const items = [
    { title: "[P0-05] Canonical", content: { body: marker } },
    { title: "Drifted title", content: { body: marker } },
  ];
  let writes = 0;
  assert.throws(() => {
    selectUniqueProjectItem(items, "P0-05");
    writes += 1;
  }, ProofPolicyError);
  assert.equal(writes, 0);
});

test("legacy body status is parsed only from one supported status line", () => {
  assert.equal(extractLegacyProjectedStatus("- Curve status: In review\n"), "In review");
  assert.throws(() => extractLegacyProjectedStatus("- Curve status: Unknown\n"), ProofPolicyError);
  assert.throws(
    () => extractLegacyProjectedStatus("- Curve status: Ready\n- Curve status: Done\n"),
    ProofPolicyError,
  );
});

test("proof-package status validation is informational and read-only", () => {
  const result = spawnSync(process.execPath, [SYNCHRONIZER_PATH, "--validate-status", "P0-06=Ready"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    mode: "validate-status",
    taskId: "P0-06",
    status: "Ready",
    valid: true,
    projectStatusAuthority: "informational-only",
  });
});

function singleItemIo(options = {}) {
  let state = options.initial ?? "INITIAL_EXACT";
  const calls = [];
  let refreshCount = 0;
  return {
    calls,
    get state() {
      return state;
    },
    refresh() {
      refreshCount += 1;
      calls.push(`refresh:${refreshCount}`);
      if (options.refreshRaceAt === refreshCount) return "UNEXPECTED";
      return state;
    },
    writeBody() {
      calls.push("writeBody");
      if (options.bodyFailure === "before") throw new Error("body write failed");
      state = "BODY_ONLY_EXACT";
      if (options.bodyFailure === "after") throw new Error("body response lost");
    },
    writeStatus() {
      calls.push("writeStatus");
      if (options.statusFailure === "before") throw new Error("status write failed");
      state = "COMPLETE_EXACT";
      if (options.statusFailure === "after") throw new Error("status response lost");
    },
  };
}

function canonicalInitialFixture() {
  const priorSourceRevision = "a".repeat(40);
  const currentSourceRevision = "b".repeat(40);
  const priorBody = [
    "<!-- curve-project-sync:v1 id=P0-05 -->",
    "## Curve work package",
    "",
    `- Normative source revision: \`${priorSourceRevision}\``,
    "",
  ].join("\n");
  const targetBody = [
    "<!-- curve-project-sync:v1 id=P0-05 -->",
    "## Curve work package",
    "",
    `- Normative source revision: \`${currentSourceRevision}\``,
    "",
  ].join("\n");
  return {
    taskId: "P0-05",
    currentSourceRevision,
    priorSourceRevision,
    priorIsAncestor: true,
    priorTitle: "[P0-05] Canonical prior",
    priorBody,
    priorStatus: "Ready",
    itemTitle: "[P0-05] Canonical prior",
    itemBody: priorBody,
    itemStatus: "Ready",
    targetTitle: "[P0-05] Canonical current",
    targetBody,
    targetStatus: "In progress",
  };
}

function targetBodyNonTargetStatusFixture() {
  const initial = canonicalInitialFixture();
  initial.itemTitle = initial.targetTitle;
  initial.itemBody = initial.targetBody;
  initial.priorSourceRevision = null;
  initial.priorIsAncestor = null;
  initial.priorTitle = null;
  initial.priorBody = null;
  initial.priorStatus = null;
  return initial;
}

for (const [name, mutate] of [
  ["tampered title", (initial) => { initial.itemTitle = "[P0-05] Tampered"; }],
  ["tampered body", (initial) => { initial.itemBody += "tampered\n"; }],
  ["unmerged prior source", (initial) => { initial.priorIsAncestor = false; }],
]) {
  test(`validated single-item update rejects ${name} with zero adapter calls`, () => {
    const initial = canonicalInitialFixture();
    mutate(initial);
    const io = singleItemIo();
    assert.throws(
      () => executeValidatedSingleExistingItemStatusUpdate({ initial, io }),
      ProofPolicyError,
    );
    assert.deepEqual(io.calls, []);
  });
}

test("validated single-item update accepts an exact canonical prior projection", () => {
  const io = singleItemIo();
  assert.equal(
    executeValidatedSingleExistingItemStatusUpdate({ initial: canonicalInitialFixture(), io }).receipt,
    "EXACT_COMPLETION",
  );
  assert.equal(io.calls.filter((call) => call === "writeBody").length, 1);
  assert.equal(io.calls.filter((call) => call === "writeStatus").length, 1);
});

test("historical canonical projection may predate context and proof-stage fields", () => {
  const initial = canonicalInitialFixture();
  assert.doesNotMatch(initial.priorBody, /Context digest|Proof stage record/);
  assert.match(initial.targetBody, /Normative source revision/);
  const io = singleItemIo();
  assert.equal(
    executeValidatedSingleExistingItemStatusUpdate({ initial, io }).receipt,
    "EXACT_COMPLETION",
  );
});

for (const interveningStatus of ["Ready", "Done"]) {
  test(`validated single-item update completes a target body with ${interveningStatus} status`, () => {
    const initial = targetBodyNonTargetStatusFixture();
    initial.itemStatus = interveningStatus;
    const io = singleItemIo({ initial: "BODY_ONLY_EXACT" });
    assert.equal(
      executeValidatedSingleExistingItemStatusUpdate({ initial, io }).receipt,
      "EXACT_COMPLETION",
    );
    assert.equal(io.calls.filter((call) => call === "writeBody").length, 0);
    assert.equal(io.calls.filter((call) => call === "writeStatus").length, 1);
  });
}

test("validated single-item update accepts exact idempotent completion", () => {
  const initial = targetBodyNonTargetStatusFixture();
  initial.itemStatus = initial.targetStatus;
  const io = singleItemIo({ initial: "COMPLETE_EXACT" });
  assert.deepEqual(
    executeValidatedSingleExistingItemStatusUpdate({ initial, io }),
    { receipt: "EXACT_COMPLETION", reconciled: true },
  );
  assert.equal(io.calls.some((call) => call.startsWith("write")), false);
});

test("validated single-item update rejects a tampered near-target body with zero adapter calls", () => {
  const initial = targetBodyNonTargetStatusFixture();
  initial.itemBody += " ";
  const io = singleItemIo({ initial: "BODY_ONLY_EXACT" });
  assert.throws(
    () => executeValidatedSingleExistingItemStatusUpdate({ initial, io }),
    ProofPolicyError,
  );
  assert.deepEqual(io.calls, []);
});

test("validated single-item update preserves same-process lost-body-response reconciliation", () => {
  const io = singleItemIo({ bodyFailure: "after" });
  assert.deepEqual(
    executeValidatedSingleExistingItemStatusUpdate({
      initial: canonicalInitialFixture(),
      io,
    }),
    { receipt: "EXACT_COMPLETION", reconciled: true },
  );
  assert.equal(io.calls.filter((call) => call === "writeBody").length, 1);
  assert.equal(io.calls.filter((call) => call === "writeStatus").length, 1);
});

test("single-item update performs body-first exact writes and returns a receipt", () => {
  const io = singleItemIo();
  assert.deepEqual(executeSingleExistingItemStatusUpdate(io), {
    receipt: "EXACT_COMPLETION",
    reconciled: false,
  });
  assert.equal(io.state, "COMPLETE_EXACT");
  assert.equal(io.calls.filter((call) => call === "writeBody").length, 1);
  assert.equal(io.calls.filter((call) => call === "writeStatus").length, 1);
});

for (const [name, options] of [
  ["lost body response", { bodyFailure: "after" }],
  ["lost status response", { statusFailure: "after" }],
]) {
  test(`single-item update reconciles ${name}`, () => {
    const io = singleItemIo(options);
    assert.deepEqual(executeSingleExistingItemStatusUpdate(io), {
      receipt: "EXACT_COMPLETION",
      reconciled: true,
    });
    assert.equal(io.state, "COMPLETE_EXACT");
  });
}

test("exact completion is idempotent and performs no mutation", () => {
  const io = singleItemIo({ initial: "COMPLETE_EXACT" });
  assert.deepEqual(executeSingleExistingItemStatusUpdate(io), {
    receipt: "EXACT_COMPLETION",
    reconciled: true,
  });
  assert.equal(io.calls.some((call) => call.startsWith("write")), false);
});

test("same-process body-only state completes without a duplicate body write", () => {
  const io = singleItemIo({ initial: "BODY_ONLY_EXACT" });
  assert.equal(executeSingleExistingItemStatusUpdate(io).receipt, "EXACT_COMPLETION");
  assert.equal(io.calls.includes("writeBody"), false);
  assert.equal(io.calls.filter((call) => call === "writeStatus").length, 1);
});

for (const [name, options, partialState] of [
  ["item or main race", { refreshRaceAt: 2 }, "BODY_ONLY_EXACT"],
  ["true body-write failure", { bodyFailure: "before" }, "INITIAL_EXACT"],
  ["true status-write failure", { statusFailure: "before" }, "BODY_ONLY_EXACT"],
]) {
  test(`single-item update returns no receipt and fences ${name}`, () => {
    const io = singleItemIo(options);
    let receipt = null;
    assert.throws(() => {
      receipt = executeSingleExistingItemStatusUpdate(io);
    }, ProofPolicyError);
    assert.equal(receipt, null);
    assert.equal(io.state, partialState);
  });
}
