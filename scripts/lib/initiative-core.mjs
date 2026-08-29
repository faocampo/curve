export const INITIATIVE_GATE_TYPES = Object.freeze([
  "PRD_APPROVAL",
  "PLAN_APPROVAL",
  "CODE_READINESS",
]);

export const INITIATIVE_TERMINAL_STATES = Object.freeze([
  "READY_FOR_REPOSITORY_REVIEW",
  "CANCELLED",
]);

export const M1_01A_REACHABLE_STATES = Object.freeze([
  "DRAFT",
  "ALIGNING",
  "PAUSED",
  "CANCELLED",
]);

const KEYWORD_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{0,49}$/;

const ACTIONS = Object.freeze({
  "CURVE.INITIATIVE.CREATE": { authorities: ["ACTIVE_WORKSPACE_MEMBER"], states: [] },
  "CURVE.INITIATIVE.READ": { authorities: ["ACTIVE_WORKSPACE_MEMBER"], states: M1_01A_REACHABLE_STATES },
  "CURVE.INITIATIVE.UPDATE_DRAFT": { authorities: ["INITIATIVE_CREATOR", "WORKSPACE_ADMINISTRATOR"], states: ["DRAFT"] },
  "CURVE.INITIATIVE.ACCEPT_REFINEMENT": { authorities: ["INITIATIVE_CREATOR"], states: ["DRAFT"] },
  "CURVE.INITIATIVE.PAUSE": { authorities: ["INITIATIVE_CREATOR", "CONFIGURED_APPROVER", "WORKSPACE_ADMINISTRATOR"], states: ["DRAFT", "ALIGNING"] },
  "CURVE.INITIATIVE.RESUME": { authorities: ["INITIATIVE_CREATOR", "CONFIGURED_APPROVER", "WORKSPACE_ADMINISTRATOR"], states: ["PAUSED"] },
  "CURVE.INITIATIVE.CANCEL": { authorities: ["INITIATIVE_CREATOR", "CONFIGURED_APPROVER", "WORKSPACE_ADMINISTRATOR"], states: ["DRAFT", "ALIGNING", "PAUSED"] },
});

function equal(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function canonicalKeyword(value) {
  if (typeof value !== "string" || !KEYWORD_PATTERN.test(value)) {
    throw new Error("INVALID_INITIATIVE_KEYWORD");
  }
  return value.toLocaleLowerCase("en-US");
}

export function validateGateAssignments({ assignments, riskTier }) {
  if (!Array.isArray(assignments) || assignments.length !== 3) {
    throw new Error("THREE_GATE_ASSIGNMENTS_REQUIRED");
  }
  const types = assignments.map((assignment) => assignment.gate_type).sort();
  if (!equal(types, [...INITIATIVE_GATE_TYPES].sort())) {
    throw new Error("EXACT_GATE_TYPES_REQUIRED");
  }
  if (assignments.some((assignment) => assignment.approver?.actor_type !== "HUMAN")) {
    throw new Error("ACTIVE_HUMAN_APPROVER_REQUIRED");
  }
  const approvers = new Set(assignments.map((assignment) => assignment.approver.actor_id));
  if (["STANDARD", "HIGH"].includes(riskTier) && approvers.size !== 3) {
    throw new Error("DISTINCT_APPROVERS_REQUIRED");
  }
  return true;
}

export function validateInitiativeRecord(initiative) {
  canonicalKeyword(initiative?.keyword);
  if (initiative?.mode === "STANDALONE" && initiative.roadmap_item_id !== null) {
    throw new Error("STANDALONE_ROADMAP_ITEM_FORBIDDEN");
  }
  if (initiative?.mode === "ROADMAP") throw new Error("ROADMAP_MODE_NOT_AVAILABLE");
  if (!M1_01A_REACHABLE_STATES.includes(initiative?.state)) {
    throw new Error("INITIATIVE_STATE_NOT_AVAILABLE_IN_M1_01A");
  }
  if (initiative.state === "DRAFT" && initiative.workflow_version_id !== null) {
    throw new Error("DRAFT_WORKFLOW_VERSION_FORBIDDEN");
  }
  if (initiative.state === "ALIGNING" && !initiative.workflow_version_id) {
    throw new Error("ALIGNING_WORKFLOW_VERSION_REQUIRED");
  }
  if (initiative.state === "PAUSED" && !["DRAFT", "ALIGNING"].includes(initiative.paused_from_state)) {
    throw new Error("PAUSED_FROM_STATE_REQUIRED");
  }
  if (initiative.state === "PAUSED" && initiative.paused_from_state === "DRAFT" && initiative.workflow_version_id !== null) {
    throw new Error("PAUSED_DRAFT_WORKFLOW_VERSION_FORBIDDEN");
  }
  if (initiative.state === "PAUSED" && initiative.paused_from_state === "ALIGNING" && !initiative.workflow_version_id) {
    throw new Error("PAUSED_ALIGNING_WORKFLOW_VERSION_REQUIRED");
  }
  if (initiative.state !== "PAUSED" && initiative.paused_from_state !== null) {
    throw new Error("PAUSED_FROM_STATE_FORBIDDEN");
  }
  if (initiative.first_external_resource_at !== null) {
    throw new Error("EXTERNAL_RESOURCE_OUT_OF_SCOPE");
  }
  validateGateAssignments({ assignments: initiative.gate_assignments, riskTier: initiative.risk_tier });
  return true;
}

export function validateInitiativePolicy(policy) {
  if (policy?.schema_version !== "1.0" || policy?.policy_key !== "CURVE_INITIATIVE_POLICY") {
    throw new Error("Initiative policy identity differs");
  }
  if (policy.default_effect !== "DENY" || !equal(policy.enabled_modes, ["STANDALONE"])) {
    throw new Error("Initiative policy must be deny-by-default and standalone-only");
  }
  if (policy.workflow_version_id !== "82000000-0000-4000-8000-000000000001") {
    throw new Error("Initiative policy workflow version differs");
  }
  if (policy.actions?.length !== Object.keys(ACTIONS).length) throw new Error("Initiative policy action count differs");
  for (const action of policy.actions) {
    const expected = ACTIONS[action.action];
    if (!expected) throw new Error(`Unknown Initiative policy action ${action.action}`);
    if (!equal(action.authorities, expected.authorities) || !equal(action.allowed_states, expected.states)) {
      throw new Error(`${action.action} authority or state differs`);
    }
    if (action.requires_active_human !== true || action.external_side_effect !== false) {
      throw new Error(`${action.action} violates the local human-only boundary`);
    }
  }
  return true;
}

export function transitionInitiative({ state, pausedFromState, command }) {
  if (command === "ACCEPT_REFINEMENT" && state === "DRAFT") return { state: "ALIGNING", pausedFromState: null };
  if (command === "PAUSE" && ["DRAFT", "ALIGNING"].includes(state)) return { state: "PAUSED", pausedFromState: state };
  if (command === "RESUME" && state === "PAUSED" && ["DRAFT", "ALIGNING"].includes(pausedFromState)) {
    return { state: pausedFromState, pausedFromState: null };
  }
  if (command === "CANCEL" && ["DRAFT", "ALIGNING", "PAUSED"].includes(state)) {
    return { state: "CANCELLED", pausedFromState: null };
  }
  throw new Error("INVALID_INITIATIVE_TRANSITION");
}

export function assertKeywordMutable(initiative) {
  if (initiative?.state !== "DRAFT" || initiative?.first_external_resource_at !== null) {
    throw new Error("INITIATIVE_KEYWORD_IMMUTABLE");
  }
  return true;
}
