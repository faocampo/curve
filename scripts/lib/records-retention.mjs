// Candidate conformance seam. Every context field must come from current,
// trusted server-side reads. Never expose this input as a client request.
// No storage, deletion, policy approval or database transaction occurs here.
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const read = (name) => JSON.parse(readFileSync(new URL(`../../contracts/schemas/${name}`, import.meta.url), "utf8"));
const ajv = new Ajv2020({ strict: false, allErrors: false });
addFormats(ajv);
ajv.addSchema(read("common.schema.json"));
const validate = ajv.compile(read("records-retention-v1.schema.json"));
const sameScope = (value, record) => value.workspace_id === record.workspace_id && value.record_set_id === record.id;

function immutable(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(immutable);
    Object.freeze(value);
  }
  return value;
}

export function evaluateRecordsRetention(input) {
  if (!validate(input)) throw new Error("RETENTION_INPUT_INVALID");
  const { record, inventory, actor, authorization, policy, hold, now, expected_version, action } = input;
  const instants = [now, inventory.checked_at, hold.checked_at, policy.effective_at, policy.expires_at, authorization.evaluated_at, authorization.expires_at];
  if (record.closure) instants.push(record.closure.closed_at);
  if (input.schedule) instants.push(input.schedule.eligible_at, input.schedule.calculated_at);
  // JSON Schema date-time can admit leap seconds that Date.parse cannot handle.
  // Reject noncanonical/unrepresentable instants before any ordering comparison.
  if (instants.some((value) => !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value)) throw new Error("RETENTION_INPUT_INVALID");
  const result = (reason_code) => immutable({ effect: reason_code === "RETENTION_CHECKS_PASSED" ? "ALLOW" : "DENY", reason_code, record_set_id: record.id, workspace_id: record.workspace_id, record_version: record.version, inventory_version: inventory.version, policy_version_id: policy.id, evaluated_at: now });
  if ([inventory, policy, hold, authorization].some((item) => !sameScope(item, record)) || actor.workspace_id !== record.workspace_id) return result("RETENTION_SCOPE_MISMATCH");
  if (!actor.active || !actor.object_access) return result("RECORD_ACCESS_DENIED");
  if (action === "CLOSE_RECORDS" && (actor.actor_type !== "HUMAN" || actor.id !== record.owner_actor_id)) return result("RECORDS_OWNER_REQUIRED");
  if (record.version !== expected_version || record.version === Number.MAX_SAFE_INTEGER) return result("RECORD_VERSION_CONFLICT");
  if (record.state === "ERASED") return result("RECORDS_ALREADY_ERASED");
  if ((record.state === "OPEN") !== (record.closure === null)) return result("RECORD_STATE_INVALID");
  const time = Date.parse(now);
  if (policy.state !== "APPROVED" || Date.parse(policy.effective_at) > time || Date.parse(policy.expires_at) <= time) return result("RETENTION_POLICY_UNAVAILABLE");
  if (authorization.effect !== "ALLOW" || authorization.actor_id !== actor.id || authorization.action !== action || authorization.policy_version_id !== policy.id || authorization.evaluated_at !== now || Date.parse(authorization.expires_at) <= time) return result("RETENTION_AUTHORIZATION_REQUIRED");
  if (inventory.checked_at !== now || !inventory.complete || hold.checked_at !== now) return result("RETENTION_OBSERVATION_REQUIRED");
  if (inventory.uses.some((use) => use.workspace_id !== record.workspace_id) || new Set(inventory.uses.map((use) => `${use.kind}:${use.id}`)).size !== inventory.uses.length) return result("USE_INVENTORY_INVALID");
  if (inventory.uses.some((use) => use.state === "ACTIVE")) return result("ACTIVE_USE_REMAINS");
  // Closing records preserves any hold. Erasure must prove the hold is clear.
  if (action === "EVALUATE_ERASURE" && hold.state !== "CLEAR") return result("RETENTION_HOLD_BLOCKS");
  if (record.closure && Date.parse(record.closure.closed_at) > time) return result("CLOSURE_TIME_INVALID");
  if (action === "CLOSE_RECORDS") {
    if (record.closure && (record.closure.id === input.closure_id || record.closure.inventory_version >= inventory.version)) return result("NEW_CLOSURE_NOT_REQUIRED");
    return result("RETENTION_CHECKS_PASSED");
  }
  const { schedule } = input;
  if (!sameScope(schedule, record)) return result("RETENTION_SCOPE_MISMATCH");
  if (record.state !== "CLOSED" || !record.closure) return result("RECORDS_CLOSURE_REQUIRED");
  if (record.closure.inventory_version !== inventory.version) return result("RECORDS_RECLOSURE_REQUIRED");
  if (record.closure.policy_version_id !== policy.id || record.closure.policy_digest !== policy.content_digest || schedule.policy_version_id !== policy.id || schedule.policy_digest !== policy.content_digest) return result("RETENTION_POLICY_CHANGED");
  if (schedule.closure_id !== record.closure.id || schedule.calculated_at !== now) return result("RETENTION_SCHEDULE_STALE");
  if (Date.parse(schedule.eligible_at) < Date.parse(record.closure.closed_at)) return result("RETENTION_SCHEDULE_INVALID");
  if (Date.parse(schedule.eligible_at) > time) return result("RETENTION_NOT_EXPIRED");
  return result("RETENTION_CHECKS_PASSED");
}

export function closeRecordsForRetention(input) {
  const decision = evaluateRecordsRetention(input);
  if (input.action !== "CLOSE_RECORDS") throw new Error("CLOSURE_COMMAND_REQUIRED");
  if (decision.effect !== "ALLOW") return immutable({ decision, record: structuredClone(input.record), event: null });
  const closure = { id: input.closure_id, closed_at: input.now, inventory_version: input.inventory.version, policy_version_id: input.policy.id, policy_digest: input.policy.content_digest, actor_id: input.actor.id };
  return immutable({ decision, record: { ...structuredClone(input.record), state: "CLOSED", version: input.record.version + 1, closure }, event: { type: "records.closed", workspace_id: input.record.workspace_id, record_set_id: input.record.id, record_version: input.record.version + 1, authorization_id: input.authorization.id, closure } });
}
