import assert from "node:assert/strict";
import test from "node:test";
import { closeRecordsForRetention, evaluateRecordsRetention } from "../lib/records-retention.mjs";

// Fabricated identities and instants exercise boundaries, not retention periods.
const id = (n) => `92000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const now = "2026-01-10T12:00:00.000Z";
const earlier = "2026-01-10T11:00:00.000Z";
const later = "2026-01-10T13:00:00.000Z";
const digest = `sha256:${"c".repeat(64)}`;
function fixture() {
  const scope = { workspace_id: id(1), record_set_id: id(2) };
  return {
    schema_version: "curve.records-retention/v1-candidate", action: "CLOSE_RECORDS", now, expected_version: 1, closure_id: id(7),
    record: { id: id(2), workspace_id: id(1), version: 1, owner_actor_id: id(3), state: "OPEN", closure: null },
    inventory: { ...scope, version: 1, complete: true, checked_at: now, uses: [{ id: id(4), workspace_id: id(1), kind: "PRODUCT", state: "ENDED" }] },
    actor: { id: id(3), workspace_id: id(1), actor_type: "HUMAN", active: true, object_access: true },
    authorization: { ...scope, id: id(8), actor_id: id(3), action: "CLOSE_RECORDS", effect: "ALLOW", policy_version_id: id(5), evaluated_at: now, expires_at: later },
    policy: { ...scope, id: id(5), content_digest: digest, state: "APPROVED", effective_at: earlier, expires_at: later },
    hold: { ...scope, state: "CLEAR", checked_at: now },
  };
}
function erasure() {
  const f = fixture();
  f.record = structuredClone(closeRecordsForRetention(f).record);
  delete f.closure_id;
  f.action = "EVALUATE_ERASURE"; f.authorization.action = f.action; f.expected_version = f.record.version;
  f.actor.actor_type = "SERVICE"; f.actor.id = id(9); f.authorization.actor_id = f.actor.id;
  f.schedule = { workspace_id: id(1), record_set_id: id(2), closure_id: id(7), policy_version_id: id(5), policy_digest: digest, eligible_at: now, calculated_at: now };
  return f;
}

test("owner closure returns a new immutable version and attributed event without mutating input", () => {
  const f = fixture(), original = structuredClone(f), result = closeRecordsForRetention(f);
  assert.equal(result.decision.effect, "ALLOW");
  assert.equal(result.record.version, 2);
  assert.equal(result.record.state, "CLOSED");
  assert.equal(result.record.closure.inventory_version, f.inventory.version);
  assert.equal(result.record.closure.policy_digest, digest);
  assert.equal(result.event.type, "records.closed");
  assert.equal(result.event.authorization_id, f.authorization.id);
  assert.deepEqual(f, original);
  assert.throws(() => { result.record.closure.actor_id = id(99); }, TypeError);
});

test("closure preserves a hold while the hold prevents erasure", () => {
  const f = fixture(); f.hold.state = "HELD";
  assert.equal(closeRecordsForRetention(f).decision.effect, "ALLOW");
  assert.equal(f.hold.state, "HELD");
  const e = erasure(); e.hold.state = "HELD";
  assert.equal(evaluateRecordsRetention(e).reason_code, "RETENTION_HOLD_BLOCKS");
});

test("authorized worker can evaluate expiry but cannot close records as a human owner", () => {
  assert.equal(evaluateRecordsRetention(erasure()).effect, "ALLOW");
  const f = fixture(); f.actor.actor_type = "SERVICE";
  assert.equal(evaluateRecordsRetention(f).reason_code, "RECORDS_OWNER_REQUIRED");
});

for (const [label, mutate, reason] of [
  ["active Product", (f) => { f.inventory.uses[0].state = "ACTIVE"; }, "ACTIVE_USE_REMAINS"],
  ["active Feature", (f) => { f.inventory.uses[0].kind = "FEATURE"; f.inventory.uses[0].state = "ACTIVE"; }, "ACTIVE_USE_REMAINS"],
  ["incomplete inventory", (f) => { f.inventory.complete = false; }, "RETENTION_OBSERVATION_REQUIRED"],
  ["stale inventory", (f) => { f.inventory.checked_at = earlier; }, "RETENTION_OBSERVATION_REQUIRED"],
  ["stale holds", (f) => { f.hold.checked_at = earlier; }, "RETENTION_OBSERVATION_REQUIRED"],
  ["cross-tenant use", (f) => { f.inventory.uses[0].workspace_id = id(99); }, "USE_INVENTORY_INVALID"],
  ["duplicate use", (f) => { f.inventory.uses.push(structuredClone(f.inventory.uses[0])); }, "USE_INVENTORY_INVALID"],
  ["inactive actor", (f) => { f.actor.active = false; }, "RECORD_ACCESS_DENIED"],
  ["lost object access", (f) => { f.actor.object_access = false; }, "RECORD_ACCESS_DENIED"],
  ["stale aggregate", (f) => { f.expected_version = 99; }, "RECORD_VERSION_CONFLICT"],
  ["version overflow", (f) => { f.record.version = f.expected_version = Number.MAX_SAFE_INTEGER; }, "RECORD_VERSION_CONFLICT"],
  ["unapproved policy", (f) => { f.policy.state = "PROPOSED"; }, "RETENTION_POLICY_UNAVAILABLE"],
  ["revoked policy", (f) => { f.policy.state = "REVOKED"; }, "RETENTION_POLICY_UNAVAILABLE"],
  ["future policy", (f) => { f.policy.effective_at = later; }, "RETENTION_POLICY_UNAVAILABLE"],
  ["expired policy", (f) => { f.policy.expires_at = now; }, "RETENTION_POLICY_UNAVAILABLE"],
  ["denied authorization", (f) => { f.authorization.effect = "DENY"; }, "RETENTION_AUTHORIZATION_REQUIRED"],
  ["different authorized actor", (f) => { f.authorization.actor_id = id(99); }, "RETENTION_AUTHORIZATION_REQUIRED"],
  ["stale authorization", (f) => { f.authorization.evaluated_at = earlier; }, "RETENTION_AUTHORIZATION_REQUIRED"],
  ["expired authorization", (f) => { f.authorization.expires_at = now; }, "RETENTION_AUTHORIZATION_REQUIRED"],
  ["substituted authorization policy", (f) => { f.authorization.policy_version_id = id(99); }, "RETENTION_AUTHORIZATION_REQUIRED"],
  ["erased records", (f) => { f.record.state = "ERASED"; }, "RECORDS_ALREADY_ERASED"],
]) {
  test(`closure and erasure reject ${label}`, () => {
    for (const f of [fixture(), erasure()]) {
      mutate(f); const original = structuredClone(f);
      assert.equal(evaluateRecordsRetention(f).reason_code, reason);
      assert.deepEqual(f, original);
      if (f.action === "CLOSE_RECORDS") {
        const result = closeRecordsForRetention(f);
        assert.equal(result.event, null); assert.deepEqual(result.record, f.record);
      }
    }
  });
}

for (const block of ["inventory", "hold", "policy", "authorization"]) {
  for (const field of ["workspace_id", "record_set_id"]) {
    test(`both commands reject ${block}.${field} substitution`, () => {
      for (const f of [fixture(), erasure()]) {
        f[block][field] = id(99);
        assert.equal(evaluateRecordsRetention(f).reason_code, "RETENTION_SCOPE_MISMATCH");
      }
    });
  }
}

for (const [label, mutate, reason] of [
  ["unknown hold", (f) => { f.hold.state = "UNKNOWN"; }, "RETENTION_HOLD_BLOCKS"],
  ["closure absent", (f) => { f.record.state = "OPEN"; f.record.closure = null; }, "RECORDS_CLOSURE_REQUIRED"],
  ["use history changed", (f) => { f.inventory.version++; }, "RECORDS_RECLOSURE_REQUIRED"],
  ["policy digest changed", (f) => { f.policy.content_digest = `sha256:${"d".repeat(64)}`; }, "RETENTION_POLICY_CHANGED"],
  ["scheduled policy changed", (f) => { f.schedule.policy_version_id = id(99); }, "RETENTION_POLICY_CHANGED"],
  ["schedule for another closure", (f) => { f.schedule.closure_id = id(99); }, "RETENTION_SCHEDULE_STALE"],
  ["old schedule evaluation", (f) => { f.schedule.calculated_at = earlier; }, "RETENTION_SCHEDULE_STALE"],
  ["expiry before closure", (f) => { f.schedule.eligible_at = earlier; }, "RETENTION_SCHEDULE_INVALID"],
  ["future expiry", (f) => { f.schedule.eligible_at = later; }, "RETENTION_NOT_EXPIRED"],
  ["cross-tenant schedule", (f) => { f.schedule.workspace_id = id(99); }, "RETENTION_SCOPE_MISMATCH"],
  ["wrong command authorization", (f) => { f.authorization.action = "CLOSE_RECORDS"; }, "RETENTION_AUTHORIZATION_REQUIRED"],
  ["future closure", (f) => { f.record.closure.closed_at = later; }, "CLOSURE_TIME_INVALID"],
]) {
  test(`erasure rejects ${label}`, () => {
    const f = erasure(); mutate(f);
    assert.equal(evaluateRecordsRetention(f).reason_code, reason);
  });
}

test("new active use and its eventual end require a new closure and schedule", () => {
  const f = erasure(); f.inventory.version = 2; f.inventory.uses[0].state = "ACTIVE";
  assert.equal(evaluateRecordsRetention(f).reason_code, "ACTIVE_USE_REMAINS");
  f.inventory.version = 3; f.inventory.uses[0].state = "ENDED";
  assert.equal(evaluateRecordsRetention(f).reason_code, "RECORDS_RECLOSURE_REQUIRED");
  const close = fixture(); close.record = structuredClone(f.record); close.expected_version = f.record.version;
  close.inventory = structuredClone(f.inventory); close.closure_id = id(10);
  const successor = closeRecordsForRetention(close);
  assert.equal(successor.record.closure.id, id(10));
  assert.equal(successor.record.closure.inventory_version, 3);
  f.record = structuredClone(successor.record); f.expected_version = f.record.version;
  assert.equal(evaluateRecordsRetention(f).reason_code, "RETENTION_SCHEDULE_STALE");
  f.schedule.closure_id = id(10);
  assert.equal(evaluateRecordsRetention(f).effect, "ALLOW");
});

test("duplicate closure cannot silently extend retention or reuse a prior closure identity", () => {
  const f = fixture(); f.record = structuredClone(closeRecordsForRetention(f).record); f.expected_version++;
  assert.equal(evaluateRecordsRetention(f).reason_code, "NEW_CLOSURE_NOT_REQUIRED");
  f.closure_id = id(10);
  assert.equal(evaluateRecordsRetention(f).reason_code, "NEW_CLOSURE_NOT_REQUIRED");
  f.inventory.version++;
  assert.equal(evaluateRecordsRetention(f).effect, "ALLOW");
});

test("closed schemas reject unbounded, malformed or injected input", () => {
  for (const mutate of [
    (f) => { f.raw_body = "synthetic body"; },
    (f) => { f.actor.access_token = "synthetic-token"; },
    (f) => { f.now = "2026-02-30T12:00:00.000Z"; },
    (f) => { f.now = "invalid"; },
    (f) => { f.expected_version = 1.5; },
    (f) => { delete f.hold; },
    (f) => { f.policy.retention_days = 1; },
    (f) => { f.inventory.uses = Array(10001).fill(f.inventory.uses[0]); },
  ]) {
    const f = fixture(); mutate(f);
    assert.throws(() => evaluateRecordsRetention(f), /RETENTION_INPUT_INVALID/);
  }
  assert.throws(() => closeRecordsForRetention(erasure()), /CLOSURE_COMMAND_REQUIRED/);
});

test("every required root field is enforced for both commands", () => {
  for (const f of [fixture(), erasure()]) {
    for (const field of Object.keys(f)) {
      const missing = structuredClone(f); delete missing[field];
      assert.throws(() => evaluateRecordsRetention(missing), /RETENTION_INPUT_INVALID/, field);
    }
  }
});

test("leap seconds cannot bypass policy, authorization, closure or schedule comparisons", () => {
  for (const path of [["now"], ["inventory", "checked_at"], ["hold", "checked_at"], ["policy", "effective_at"], ["policy", "expires_at"], ["authorization", "evaluated_at"], ["authorization", "expires_at"], ["record", "closure", "closed_at"], ["schedule", "eligible_at"], ["schedule", "calculated_at"]]) {
    const f = erasure(); let parent = f;
    for (const key of path.slice(0, -1)) parent = parent[key];
    parent[path.at(-1)] = "2026-01-10T11:59:60.000Z";
    assert.throws(() => evaluateRecordsRetention(f), /RETENTION_INPUT_INVALID/, path.join("."));
  }
});
