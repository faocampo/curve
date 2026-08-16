import { isDeepStrictEqual } from "node:util";

export class ProofPolicyError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProofPolicyError";
  }
}

function requirePolicy(condition, message) {
  if (!condition) throw new ProofPolicyError(message);
}

export const P0_06A_READY_PRISTINE_CLAIM = Object.freeze({
  state: "UNCLAIMED",
  ref: "refs/tags/curve-proof-claims/d003-local-p0-06a-2026-08-15-01",
  request_id: null,
  claimed_at: null,
  outcome: null,
  branch_state: "UNCREATED",
  branch_ref: "refs/heads/agent/p0-06a-isolated-temporal-proof-d003-2026-08-15-01",
  reconciliation_branch_state: "UNAVAILABLE",
  reconciliation_branch_ref: "refs/heads/agent/p0-06a-reconciliation-evidence-d003-2026-08-15-01",
  reconciliation_branch_request_id: null,
  ticket_state: "UNISSUED",
  ticket_id: null,
  ticket_digest: null,
  ticket_acknowledged_at: null,
  start_grant_digest: null,
  start_grant_consumed_at: null,
  execution_lease_id: null,
  execution_lease_state: "UNISSUED",
  execution_lease_issued_at: null,
  execution_lease_consumed_at: null,
  execution_lease_expires_at: null,
  execution_operation_evidence_path: "docs/technical/proofs/p0-06a/evidence/execution-operation.json",
  execution_operation_evidence_digest: null,
  reconciliation_lease_id: null,
  reconciliation_lease_state: "UNAVAILABLE",
  reconciliation_lease_issued_at: null,
  reconciliation_lease_consumed_at: null,
  reconciliation_lease_expires_at: null,
  reconciliation_operation_evidence_path: "docs/technical/proofs/p0-06a/evidence/reconciliation-operation.json",
  reconciliation_operation_evidence_digest: null,
});

export const P0_06A_READY_PRISTINE_REVIEW = Object.freeze({
  disposition: "PENDING",
  evidence_revision: null,
  review_url: null,
  reviewed_at: null,
  disposition_lease_state: "UNAVAILABLE",
  disposition_lease_id: null,
  disposition_lease_issued_at: null,
  disposition_lease_consumed_at: null,
  disposition_lease_expires_at: null,
  disposition_controller_principal: null,
  prior_stage_record_digest: null,
  operation_evidence_path: "docs/technical/proofs/p0-06a/evidence/review-disposition-operation.json",
  operation_evidence_digest: null,
  terminal_projection_lease_projected_state: "UNAVAILABLE",
  terminal_projection_lease_id: null,
  terminal_projection_lease_issued_at: null,
  terminal_projection_lease_expires_at: null,
  terminal_projection_controller_principal: null,
  terminal_projection_branch_ref: "refs/heads/agent/p0-06a-terminal-projection-d003-2026-08-15-01",
  terminal_projection_publication_intent_path:
    "docs/technical/proofs/p0-06a/evidence/terminal-projection-publication-intent.json",
  terminal_projection_publication_intent_digest: null,
  terminal_projection_pr_number: null,
});

export function validateP0_06AReadyPristineState(input) {
  requirePolicy(
    isDeepStrictEqual(input?.claim, P0_06A_READY_PRISTINE_CLAIM),
    "P0-06A READY claim state is not the exact pristine state.",
  );
  requirePolicy(
    isDeepStrictEqual(input?.review, P0_06A_READY_PRISTINE_REVIEW),
    "P0-06A READY review state is not the exact pristine state.",
  );
  return true;
}

export function validateSingleApplyRequest(input) {
  const { assignments } = input ?? {};
  requirePolicy(Array.isArray(assignments), "Apply assignments must be an array.");
  requirePolicy(assignments.length === 1, "--apply requires exactly one explicit --status TASK-ID=STATUS assignment.");
  const [assignment] = assignments;
  requirePolicy(
    assignment &&
      typeof assignment === "object" &&
      !Array.isArray(assignment) &&
      Object.keys(assignment).sort().join(",") === "status,taskId" &&
      typeof assignment.taskId === "string" &&
      assignment.taskId.length > 0 &&
      typeof assignment.status === "string" &&
      assignment.status.length > 0,
    "The apply assignment must contain exactly taskId and status strings.",
  );
  return assignment;
}

export function selectUniqueProjectItem(items, taskId) {
  requirePolicy(Array.isArray(items), "GitHub Project items must be an array.");
  requirePolicy(/^(?:P0|M[0-7]|R1)-\d{2}$/.test(taskId), `Invalid work-package ID: ${taskId}.`);
  const title = new RegExp(`^\\[${taskId}\\]`);
  const marker = `<!-- curve-project-sync:v1 id=${taskId} -->`;
  const candidates = items.filter(
    (item) => title.test(item?.title ?? "") || item?.content?.body?.includes(marker),
  );
  requirePolicy(
    candidates.length === 1,
    `${taskId} requires exactly one title-or-marker Project candidate; found ${candidates.length}.`,
  );
  return candidates[0];
}

export function extractNormativeSourceRevision(body) {
  requirePolicy(typeof body === "string", "Project item body must be a string.");
  const matches = [...body.matchAll(/^- Normative source revision: `([0-9a-f]{40})`$/gm)];
  requirePolicy(matches.length === 1, "Project item body must contain exactly one normative source revision.");
  return matches[0][1];
}

export function extractLegacyProjectedStatus(body) {
  requirePolicy(typeof body === "string", "Project item body must be a string.");
  const matches = [...body.matchAll(/^- Curve status: (Backlog|Ready|In progress|In review|Done)$/gm)];
  requirePolicy(matches.length === 1, "Legacy Project item body must contain exactly one Curve status.");
  return matches[0][1];
}

export function validateExistingItemPreflight(input) {
  const expectedKeys = [
    "currentSourceRevision",
    "itemBody",
    "itemStatus",
    "itemTitle",
    "priorBody",
    "priorIsAncestor",
    "priorSourceRevision",
    "priorStatus",
    "priorTitle",
    "targetBody",
    "targetStatus",
    "targetTitle",
    "taskId",
  ];
  requirePolicy(
    input &&
      typeof input === "object" &&
      !Array.isArray(input) &&
      isDeepStrictEqual(Object.keys(input).sort(), expectedKeys),
    "Existing-item preflight received a missing or unexpected field.",
  );
  requirePolicy(/^(?:P0|M[0-7]|R1)-\d{2}$/.test(input.taskId), "Existing-item preflight has an invalid task ID.");
  requirePolicy(/^[0-9a-f]{40}$/.test(input.currentSourceRevision), "Current source revision is not a commit SHA.");
  requirePolicy(
    input.targetTitle.startsWith(`[${input.taskId}] `) &&
      input.targetBody.includes(`<!-- curve-project-sync:v1 id=${input.taskId} -->`) &&
      extractNormativeSourceRevision(input.targetBody) === input.currentSourceRevision,
    "Target projection is not bound to the current source and task.",
  );

  if (
    input.itemTitle === input.targetTitle &&
    input.itemBody === input.targetBody &&
    input.itemStatus === input.targetStatus
  ) {
    return "COMPLETE_EXACT";
  }
  if (
    input.itemTitle === input.targetTitle &&
    input.itemBody === input.targetBody &&
    input.itemStatus !== input.targetStatus
  ) {
    return "BODY_ONLY_EXACT";
  }

  requirePolicy(/^[0-9a-f]{40}$/.test(input.priorSourceRevision), "Prior source revision is not a commit SHA.");
  requirePolicy(input.priorIsAncestor === true, "Prior source revision is not an ancestor of current merged source.");
  requirePolicy(
    input.priorTitle?.startsWith(`[${input.taskId}] `) &&
      input.priorBody?.includes(`<!-- curve-project-sync:v1 id=${input.taskId} -->`) &&
      extractNormativeSourceRevision(input.priorBody) === input.priorSourceRevision,
    "Prior projection is not bound to its source and task.",
  );
  requirePolicy(
    input.itemTitle === input.priorTitle &&
      input.itemBody === input.priorBody &&
      input.itemStatus === input.priorStatus,
    "Existing Project item is not an exact canonical initial or complete projection.",
  );
  return "INITIAL_EXACT";
}

function requireObservedState(actual, allowed, label) {
  requirePolicy(allowed.includes(actual), `${label}: unexpected state ${actual}.`);
}

export function executeSingleExistingItemStatusUpdate(io) {
  let state = io.refresh();
  let reconciled = false;
  requireObservedState(state, ["INITIAL_EXACT", "BODY_ONLY_EXACT", "COMPLETE_EXACT"], "Single-item preflight");
  if (state === "COMPLETE_EXACT") return { receipt: "EXACT_COMPLETION", reconciled: true };

  if (state === "INITIAL_EXACT") {
    try {
      io.writeBody();
    } catch (error) {
      state = io.refresh();
      reconciled = true;
      requireObservedState(state, ["BODY_ONLY_EXACT", "COMPLETE_EXACT"], `Body write ambiguity (${error.message})`);
    }
    state = io.refresh();
    requireObservedState(state, ["BODY_ONLY_EXACT", "COMPLETE_EXACT"], "Body write postcondition");
  }

  if (state !== "COMPLETE_EXACT") {
    try {
      io.writeStatus();
    } catch (error) {
      state = io.refresh();
      reconciled = true;
      requireObservedState(state, ["COMPLETE_EXACT"], `Status write ambiguity (${error.message})`);
    }
    state = io.refresh();
    requireObservedState(state, ["COMPLETE_EXACT"], "Status write postcondition");
  }

  state = io.refresh();
  requireObservedState(state, ["COMPLETE_EXACT"], "Single-item final receipt");
  return { receipt: "EXACT_COMPLETION", reconciled };
}

export function executeValidatedSingleExistingItemStatusUpdate(input) {
  validateExistingItemPreflight(input?.initial);
  return executeSingleExistingItemStatusUpdate(input?.io);
}
