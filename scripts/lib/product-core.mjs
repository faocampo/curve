const PRODUCT_KEY_PATTERN = "^[a-z0-9][a-z0-9-]{0,49}$";

export const PRODUCT_TERMINAL_INITIATIVE_STATES = Object.freeze([
  "READY_FOR_REPOSITORY_REVIEW",
  "CANCELLED",
]);

const PRODUCT_ACTIONS = Object.freeze({
  "CURVE.PRODUCT.CREATE": {
    authorities: ["WORKSPACE_ADMINISTRATOR"],
    states: [],
    preconditions: ["WORKSPACE_KEY_UNIQUE", "IANA_TIMEZONE_VALID"],
  },
  "CURVE.PRODUCT.READ": {
    authorities: ["ACTIVE_WORKSPACE_MEMBER"],
    states: ["ACTIVE", "ARCHIVED"],
    preconditions: [],
  },
  "CURVE.PRODUCT.UPDATE_METADATA": {
    authorities: ["PRODUCT_OWNER", "WORKSPACE_ADMINISTRATOR"],
    states: ["ACTIVE", "ARCHIVED"],
    preconditions: ["EXPECTED_VERSION_MATCHES", "IANA_TIMEZONE_VALID"],
  },
  "CURVE.PRODUCT.ARCHIVE": {
    authorities: ["WORKSPACE_ADMINISTRATOR"],
    states: ["ACTIVE"],
    preconditions: ["EXPECTED_VERSION_MATCHES", "NO_NON_TERMINAL_INITIATIVE"],
  },
  "CURVE.PRODUCT.RESTORE": {
    authorities: ["WORKSPACE_ADMINISTRATOR"],
    states: ["ARCHIVED"],
    preconditions: ["EXPECTED_VERSION_MATCHES"],
  },
  "CURVE.PRODUCT.REASSIGN_OWNER": {
    authorities: ["WORKSPACE_ADMINISTRATOR"],
    states: ["ACTIVE", "ARCHIVED"],
    preconditions: ["EXPECTED_VERSION_MATCHES", "TARGET_OWNER_ACTIVE_IN_WORKSPACE"],
  },
});

function equal(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function requireEqual(actual, expected, label) {
  if (!equal(actual, expected)) throw new Error(`${label} differs from the approved M1-00A contract`);
}

export function isIanaTimeZone(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > 255) return false;
  if (/^[+-]\d{2}(?::?\d{2})?$/.test(value) || /^(?:GMT|UTC)[+-]/i.test(value)) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function validateProductCoreDecision(decision) {
  requireEqual(decision?.schema_version, "1.0", "decision schema version");
  requireEqual(decision?.decision_id, "M1-00A", "decision identifier");
  requireEqual(decision?.status, "APPROVED", "decision status");
  requireEqual(decision?.approved_by, {
    name: "Federico Ocampo",
    github_login: "faocampo",
    title: "CTO at X3M",
  }, "decision approver");
  requireEqual(decision?.semantics?.key, {
    pattern: PRODUCT_KEY_PATTERN,
    max_length: 50,
    lowercase: true,
    mutable: false,
    workspace_unique: true,
  }, "Product key semantics");
  requireEqual(decision?.semantics?.name, { required: true, mutable: true }, "Product name semantics");
  requireEqual(decision?.semantics?.description, { required: false, mutable: true }, "Product description semantics");
  requireEqual(decision?.semantics?.timezone, {
    required: true,
    mutable: true,
    vocabulary: "IANA_TIME_ZONE",
    changes_apply: "PROSPECTIVELY",
    rewrites_history: false,
  }, "Product timezone semantics");
  requireEqual(decision?.semantics?.ownership, {
    active_owner_count: 1,
    actor_type: "HUMAN",
    initial_owner: "CREATING_USER",
  }, "Product ownership semantics");
  requireEqual(decision?.semantics?.lifecycle, {
    states: ["ACTIVE", "ARCHIVED"],
    archive_precondition: "NO_NON_TERMINAL_INITIATIVE",
    archived_historically_readable: true,
    archived_accepts_new_initiatives: false,
  }, "Product lifecycle semantics");
  requireEqual(decision?.semantics?.authorization, {
    create: ["WORKSPACE_ADMINISTRATOR"],
    archive: ["WORKSPACE_ADMINISTRATOR"],
    restore: ["WORKSPACE_ADMINISTRATOR"],
    reassign: ["WORKSPACE_ADMINISTRATOR"],
    edit_metadata: ["PRODUCT_OWNER", "WORKSPACE_ADMINISTRATOR"],
  }, "Product authorization semantics");
  requireEqual(decision?.semantics?.retirement, "REVERSIBLE_ARCHIVAL", "Product retirement semantics");
  requireEqual(decision?.semantics?.deferred_to_m2, [
    "ROADMAP",
    "MILESTONE",
    "FEATURE",
    "ROADMAP_ITEM",
    "SCHEDULE",
    "SNAPSHOT",
  ], "M2 deferral boundary");
  return true;
}

export function validateProductPolicy(policy) {
  requireEqual(policy?.schema_version, "1.0", "Product policy schema version");
  requireEqual(policy?.policy_key, "CURVE_PRODUCT_POLICY", "Product policy key");
  requireEqual(policy?.policy_version, 1, "Product policy version");
  requireEqual(policy?.default_effect, "DENY", "Product policy default effect");
  requireEqual(policy?.principal_mapping, {
    workspace_administrator: {
      source: "PLANE_WORKSPACE_MEMBERSHIP",
      role_name: "ADMIN",
      role_value: 20,
      active_membership_required: true,
    },
    product_owner: {
      source: "PRODUCT_OWNER",
      actor_type: "HUMAN",
      active_membership_required: true,
    },
  }, "Product principal mapping");
  requireEqual(policy?.initiative_terminal_states, PRODUCT_TERMINAL_INITIATIVE_STATES, "Initiative terminal states");

  const actions = policy?.actions ?? [];
  if (actions.length !== Object.keys(PRODUCT_ACTIONS).length) {
    throw new Error("Product policy must contain exactly six actions");
  }
  if (new Set(actions.map((action) => action.action)).size !== actions.length) {
    throw new Error("Product policy contains duplicate actions");
  }
  for (const action of actions) {
    const expected = PRODUCT_ACTIONS[action.action];
    if (!expected) throw new Error(`Product policy contains unknown action ${action.action}`);
    requireEqual(action.authorities, expected.authorities, `${action.action} authorities`);
    requireEqual(action.allowed_product_states, expected.states, `${action.action} states`);
    requireEqual(action.preconditions, expected.preconditions, `${action.action} preconditions`);
    if (action.requires_active_human !== true || action.external_side_effect !== false) {
      throw new Error(`${action.action} violates the human-only, no-external-effect boundary`);
    }
  }
  return true;
}

export function validateProductRecordSemantics(product) {
  if (!isIanaTimeZone(product?.timezone)) throw new Error("Product timezone is not an explicit IANA timezone");
  if (product?.owner?.actor_type !== "HUMAN") throw new Error("Product owner must be human");
  if (product?.state === "ACTIVE" && (product.archived_at !== null || product.archived_by !== null)) {
    throw new Error("ACTIVE Product carries archival fields");
  }
  if (product?.state === "ARCHIVED" && (!product.archived_at || !product.archived_by)) {
    throw new Error("ARCHIVED Product lacks archival fields");
  }
  return true;
}

export function validateProductEventSemantics(event) {
  if (event?.event_type === "PRODUCT_CREATED" && !isIanaTimeZone(event.current_timezone)) {
    throw new Error("Product creation event lacks a valid IANA timezone");
  }
  if (event?.event_type === "PRODUCT_METADATA_UPDATED") {
    const changedFields = event.changed_fields ?? [];
    if (changedFields.some((field) => !["name", "description", "timezone"].includes(field))) {
      throw new Error("Product metadata event contains a non-metadata field");
    }
    if (changedFields.includes("timezone")) {
      if (!isIanaTimeZone(event.previous_timezone) || !isIanaTimeZone(event.current_timezone)) {
        throw new Error("Product timezone change must record valid previous and current IANA timezones");
      }
      if (event.previous_timezone === event.current_timezone) {
        throw new Error("Product timezone change must be prospective and value-changing");
      }
    } else if (event.previous_timezone !== undefined || event.current_timezone !== undefined) {
      throw new Error("Product metadata event records timezone values without a timezone change");
    }
  }
  if (
    event?.event_type === "PRODUCT_OWNER_REASSIGNED" &&
    event.previous_owner_user_id === event.current_owner_user_id
  ) {
    throw new Error("Product owner reassignment must change the active human owner");
  }
  return true;
}

export function productArchiveBlockers({ initiativeStates, initiativeGuardAvailable }) {
  if (initiativeGuardAvailable !== true) return ["INITIATIVE_GUARD_UNAVAILABLE"];
  return initiativeStates
    .filter((state) => !PRODUCT_TERMINAL_INITIATIVE_STATES.includes(state))
    .map((state) => `NON_TERMINAL_INITIATIVE:${state}`);
}

export function assertProductAcceptsNewInitiative(product) {
  if (product?.state !== "ACTIVE") throw new Error("ARCHIVED_PRODUCT_REJECTS_NEW_INITIATIVE");
  return true;
}
