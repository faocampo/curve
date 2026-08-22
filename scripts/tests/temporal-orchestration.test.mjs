import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateTemporalOrchestrationSemantics } from "../lib/temporal-orchestration.mjs";

const MANIFEST = JSON.parse(
  readFileSync(
    new URL("../../contracts/temporal/m0-orchestration-v1.json", import.meta.url),
    "utf8",
  ),
);

function validate(mutator = () => {}) {
  const manifest = structuredClone(MANIFEST);
  mutator(manifest);
  return validateTemporalOrchestrationSemantics(manifest);
}

test("canonical M0-S6A orchestration manifest passes semantic validation", () => {
  assert.deepEqual(validate(), {
    workflowCount: 2,
    signalCount: 7,
    queryCount: 2,
    acceptanceTestCount: 12,
  });
});

test("authority cannot enable external side effects or provider execution", () => {
  assert.throws(
    () => validate((manifest) => { manifest.authority.external_side_effects_allowed = true; }),
    /authority differs/,
  );
});

test("workflow identity and phases are immutable", () => {
  assert.throws(
    () => validate((manifest) => { manifest.workflow_types[0].workflow_id_template = "forged"; }),
    /PARENT workflow differs/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.workflow_types[1].phase_values.push("RETRYING"); }),
    /CHILD workflow differs/,
  );
});

test("signal and query field sets are exact", () => {
  assert.throws(
    () => validate((manifest) => { manifest.signals[0].fields.pop(); }),
    /signal PARENT.pause fields differs/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.queries[0].fields.push("question_body"); }),
    /query PARENT.state fields differs/,
  );
});

test("history fields and forbidden-fragment policy are immutable", () => {
  assert.throws(
    () => validate((manifest) => {
      manifest.workflow_types[0].input_fields.push("prompt_ref");
    }),
    /PARENT workflow differs/,
  );
  assert.throws(
    () => validate((manifest) => {
      manifest.payload_policy.forbidden_field_fragments = ["workspace"];
    }),
    /payload policy differs/,
  );
});

test("initial runs cannot preload state and must use exact defaults", () => {
  assert.throws(
    () => validate((manifest) => { manifest.initialization.external_preloaded_state_allowed = true; }),
    /initialization and continuation provenance differs/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.initialization.initial_defaults.next_wave_index = 1; }),
    /initialization and continuation provenance differs/,
  );
});

test("continued runs require server provenance and exact monotonic carry-forward", () => {
  assert.throws(
    () => validate((manifest) => { manifest.initialization.continued_run_detection_api = "caller.flag"; }),
    /initialization and continuation provenance differs/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.initialization.continued_run_requirements.pop(); }),
    /initialization and continuation provenance differs/,
  );
});

test("zero-based state has a bounded non-negative primitive", () => {
  assert.throws(
    () => validate((manifest) => {
      manifest.payload_policy.allowed_value_types = manifest.payload_policy.allowed_value_types.filter(
        (value) => value !== "NON_NEGATIVE_INTEGER",
      );
    }),
    /payload policy differs/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.primitive_contracts.non_negative_integer_minimum = 1; }),
    /primitive contracts differs/,
  );
});

test("duplicate starts cannot create a second workflow execution", () => {
  assert.throws(
    () => validate((manifest) => { manifest.scheduling.workflow_id_reuse_policy = "ALLOW_DUPLICATE"; }),
    /scheduling and duplicate-start policy differs/,
  );
});

test("cancellation waits for child terminal state and remains synthetic", () => {
  assert.throws(
    () => validate((manifest) => { manifest.cancellation.wait_for_child_terminal_state = false; }),
    /cancellation policy differs/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.cancellation.synthetic_cleanup_only = false; }),
    /cancellation policy differs/,
  );
});

test("continue-as-new remains at the zero-child handler-safe barrier", () => {
  assert.throws(
    () => validate((manifest) => { manifest.continue_as_new.required_barrier = "ANY_TIME"; }),
    /continue-as-new policy differs/,
  );
  assert.throws(
    () => validate((manifest) => { manifest.continue_as_new.carry_forward.pop(); }),
    /continue-as-new policy differs/,
  );
});

test("the acceptance-test set is complete and ordered", () => {
  assert.throws(
    () => validate((manifest) => { manifest.acceptance_tests.reverse(); }),
    /acceptance-test set differs/,
  );
});
