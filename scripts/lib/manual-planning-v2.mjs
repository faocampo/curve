import { createHash } from "node:crypto";

/** Candidate reference semantics only; this module does not authorize a runtime. */
export function parseStrictJson(bytes, { maxBytes = 65536, maxDepth = 32, maxNodes = 100000 } = {}) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength > maxBytes) throw new Error("JSON_BOUND_EXCEEDED");
  const input = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  let offset = 0;
  let nodes = 0;
  const whitespace = () => { while (/[\x20\x09\x0a\x0d]/u.test(input[offset] ?? "\0")) offset++; };
  const fail = () => { throw new Error("STRICT_JSON_INVALID"); };
  const string = () => {
    const start = offset++;
    while (offset < input.length) {
      const char = input[offset++];
      if (char === "\\") { offset++; continue; }
      if (char === '"') {
        let result;
        try { result = JSON.parse(input.slice(start, offset)); } catch { fail(); }
        for (let index = 0; index < result.length; index++) {
          const value = result.charCodeAt(index);
          if (value >= 0xd800 && value <= 0xdbff) {
            const next = result.charCodeAt(++index);
            if (!(next >= 0xdc00 && next <= 0xdfff)) fail();
          } else if (value >= 0xdc00 && value <= 0xdfff) fail();
        }
        return result;
      }
    }
    fail();
  };
  const value = (depth) => {
    if (++nodes > maxNodes) fail();
    whitespace();
    const char = input[offset];
    if (char === '"') return string();
    if (char === "{" || char === "[") {
      if (depth >= maxDepth) fail();
      offset++;
      const object = char === "{";
      const result = object ? Object.create(null) : [];
      const end = object ? "}" : "]";
      const keys = new Set();
      whitespace();
      if (input[offset] === end) { offset++; return result; }
      for (;;) {
        whitespace();
        let key;
        if (object) {
          if (input[offset] !== '"' || ++nodes > maxNodes) fail();
          key = string();
          if (keys.has(key)) fail();
          keys.add(key);
          whitespace();
          if (input[offset++] !== ":") fail();
        }
        const child = value(depth + 1);
        if (object) result[key] = child;
        else result.push(child);
        whitespace();
        if (input[offset] === end) { offset++; return result; }
        if (input[offset++] !== ",") fail();
      }
    }
    for (const [token, result] of [["true", true], ["false", false], ["null", null]]) {
      if (input.startsWith(token, offset)) { offset += token.length; return result; }
    }
    const match = /^-?(?:0|[1-9][0-9]*)/u.exec(input.slice(offset));
    if (!match || match[0] === "-0") fail();
    offset += match[0].length;
    if (/[.eE0-9]/u.test(input[offset] ?? "\0")) fail();
    const result = Number(match[0]);
    if (!Number.isSafeInteger(result)) fail();
    return result;
  };
  const result = value(0);
  whitespace();
  if (offset !== input.length) fail();
  return result;
}

function unicodeOrder(left, right) {
  const a = Array.from(left, (x) => x.codePointAt(0));
  const b = Array.from(right, (x) => x.codePointAt(0));
  for (let index = 0; index < Math.min(a.length, b.length); index++) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return a.length - b.length;
}

export function canonicalJson(value) {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || Object.is(value, -0)) throw new Error("NONCANONICAL_NUMBER");
    return String(value);
  }
  if (typeof value === "string") {
    // Reuse the strict UTF-16 well-formedness check without accepting other types.
    parseStrictJson(Buffer.from(JSON.stringify(value)), { maxBytes: 5242880 });
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    if (Object.getOwnPropertyNames(value).length !== value.length + 1 ||
        Object.getOwnPropertySymbols(value).length !== 0 ||
        !Array.from({ length: value.length }, (_, index) => Object.hasOwn(value, index)).every(Boolean)) {
      throw new Error("NONCANONICAL_ARRAY");
    }
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (typeof value === "object" && [null, Object.prototype].includes(Object.getPrototypeOf(value))) {
    if (Object.getOwnPropertySymbols(value).length !== 0 ||
        !Object.values(Object.getOwnPropertyDescriptors(value)).every((item) => item.enumerable && Object.hasOwn(item, "value"))) {
      throw new Error("NONCANONICAL_OBJECT");
    }
    return `{${Object.keys(value).sort(unicodeOrder).map((key) => `${canonicalJson(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  throw new Error("NONCANONICAL_JSON_TYPE");
}

export function metadataDigest(value) {
  const { digest: omitted, ...payload } = value;
  void omitted;
  return `sha256:${createHash("sha256").update(canonicalJson(payload), "utf8").digest("hex")}`;
}

const same = (a, b) => canonicalJson(a) === canonicalJson(b);
const assert = (condition, code) => { if (!condition) throw new Error(code); };
const issueKey = (ref) => `${ref.provider_installation_id}:${ref.source_issue_id}`;
const sortedUnique = (values) => same(values, [...new Set(values)].sort(unicodeOrder));

/** New v2 selection: typed C1-style strong ETag, never the lost numeric edition. */
export function parseTypedInitiativeEtag(value, initiativeId) {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u.test(initiativeId)) {
    throw new Error("INITIATIVE_ETAG_INVALID");
  }
  const match = /^"curve-initiative:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):v([1-9][0-9]*)"$/u.exec(value);
  if (!match || match[0] !== value || match[1] !== initiativeId || !Number.isSafeInteger(Number(match[2]))) {
    throw new Error("INITIATIVE_ETAG_INVALID");
  }
  return Number(match[2]);
}

/** Pure definition checks after closed schema validation, using immutable fixture facts. */
export function validateManualDefinitionSemantics(definition, facts) {
  assert(same(definition.manual_profile_ref, facts.manual_profile_ref), "PROFILE_MISMATCH");
  assert(same(definition.approved_subject_ref, facts.approved_subject_ref), "APPROVED_SUBJECT_MISMATCH");
  assert(same(definition.scope_revision_ref, facts.scope_revision_ref), "SCOPE_MISMATCH");
  assert(same(definition.workflow_ref, facts.workflow_ref), "WORKFLOW_MISMATCH");
  assert(same(facts.workflow_conditions.workflow_ref, definition.workflow_ref), "WORKFLOW_CONDITION_EDITION_MISMATCH");
  assert(same(definition.quality_policy_ref, facts.quality_policy_ref), "QUALITY_POLICY_MISMATCH");
  assert(definition.workspace_id === facts.workspace_id && definition.initiative_id === facts.initiative_id, "SCOPE_MISMATCH");
  const repositories = new Map();
  for (const repository of definition.repositories) {
    const id = repository.repository_ref.entity_id;
    assert(!repositories.has(id), "DUPLICATE_REPOSITORY");
    const observed = facts.repositories.find((candidate) => candidate.repository_ref.entity_id === id);
    assert(observed && same(repository, observed), "REPOSITORY_INPUT_MISMATCH");
    repositories.set(id, repository);
  }
  assert(repositories.size === facts.repositories.length, "REPOSITORY_SET_MISMATCH");
  assert(sortedUnique(definition.repositories.map((x) => x.repository_ref.entity_id)), "REPOSITORY_ORDER");
  const slices = new Map();
  const coveredIssues = new Set();
  const requirements = new Set(), acceptances = new Set();
  const ranks = { LOW: 0, STANDARD: 1, HIGH: 2 };
  for (const slice of definition.slices) {
    assert(!slices.has(slice.slice_key), "DUPLICATE_SLICE");
    assert(repositories.has(slice.repository_binding_id), "SLICE_REPOSITORY_MISSING");
    assert(slice.owner.actor_type === "HUMAN" && facts.owner_ids.includes(slice.owner.actor_id), "OWNER_UNAVAILABLE");
    assert(slice.code_approver.actor_type === "HUMAN" && slice.code_approver.actor_id === facts.code_approver_id, "CODE_APPROVER_MISMATCH");
    assert(ranks[slice.risk_tier] >= ranks[facts.risk_tier], "RISK_UNDERSTATED");
    assert(same(slice.budget_policy_ref, facts.budget_policy_ref), "BUDGET_POLICY_MISMATCH");
    assert(sortedUnique(slice.requirement_ids) && slice.requirement_ids.every((x) => facts.requirement_ids.includes(x)), "REQUIREMENT_TRACE_INVALID");
    assert(sortedUnique(slice.acceptance_ids) && slice.acceptance_ids.every((x) => facts.acceptance_ids.includes(x)), "ACCEPTANCE_TRACE_INVALID");
    for (const id of slice.requirement_ids) requirements.add(id);
    for (const id of slice.acceptance_ids) acceptances.add(id);
    assert(slice.verification_steps.length >= facts.required_check_ids.length &&
      facts.required_check_ids.every((id) => slice.verification_steps.some((step) => step.check_id === id)), "QUALITY_CHECK_MISSING");
    const checks = slice.verification_steps.map((x) => x.check_id);
    assert(new Set(checks).size === checks.length, "DUPLICATE_CHECK");
    assert(slice.expected_components.every((x) => !/[\x00-\x1f\x7f]/u.test(x.path) && !x.path.startsWith("/") && !x.path.includes("\\") &&
      x.path.split("/").every((part) => part !== ".." && part !== "." && part.length > 0)), "COMPONENT_PATH_INVALID");
    assert(/^[a-z][a-z0-9-]{0,79}$/u.test(facts.initiative_key) &&
      slice.branch_name === `curve/${facts.initiative_key}/${slice.slice_key}`, "BRANCH_INVALID");
    assert(sortedUnique(slice.proposed_delivery_refs.map(issueKey)), "DELIVERY_ORDER");
    for (const item of slice.proposed_delivery_refs) {
      assert(facts.proposed_delivery_refs.some((x) => same(x, item)), "UNAPPROVED_DELIVERY_ITEM");
      coveredIssues.add(issueKey(item));
    }
    slices.set(slice.slice_key, slice);
  }
  assert(sortedUnique(definition.slices.map((x) => x.slice_key)), "SLICE_ORDER");
  assert(facts.requirement_ids.every((id) => requirements.has(id)), "REQUIREMENT_COVERAGE_MISSING");
  assert(facts.acceptance_ids.every((id) => acceptances.has(id)), "ACCEPTANCE_COVERAGE_MISSING");
  assert(same([...coveredIssues].sort(unicodeOrder), facts.proposed_delivery_refs.map(issueKey).sort(unicodeOrder)), "DELIVERY_COVERAGE_MISSING");
  const outgoing = new Map([...slices.keys()].map((key) => [key, new Set()]));
  const seenEdges = new Set();
  for (const edge of definition.dependencies) {
    const a = edge.predecessor_slice_key, b = edge.successor_slice_key;
    assert(slices.has(a) && slices.has(b) && a !== b, "EDGE_ENDPOINT_INVALID");
    const identity = `${a}:${b}:${edge.dependency_type}`;
    assert(!seenEdges.has(identity), "DUPLICATE_EDGE");
    seenEdges.add(identity);
    assert(edge.condition_status === "FUTURE_NOT_ASSERTED", "FUTURE_CONDITION_ASSERTED");
    if (edge.artifact_ref !== null) {
      assert(facts.dependency_artifact_refs.some((item) => same(item, edge.artifact_ref)) &&
        facts.protected_object_refs.some((item) => same(item, edge.artifact_ref)), "DEPENDENCY_ARTIFACT_UNAVAILABLE");
    }
    assert(same(edge.workflow_ref, definition.workflow_ref), "EDGE_WORKFLOW_MISMATCH");
    const condition = { dependency_type: edge.dependency_type, condition_subject: edge.condition_subject,
      required_state: edge.required_state, condition_source: edge.condition_source };
    assert(facts.workflow_conditions.allowed_conditions.some((item) => same(item, condition)), "EDGE_CONDITION_INVALID");
    outgoing.get(a).add(b);
  }
  const visiting = new Set(), visited = new Set();
  const visit = (key) => {
    assert(!visiting.has(key), "CYCLIC_GRAPH");
    if (visited.has(key)) return;
    visiting.add(key);
    for (const target of outgoing.get(key)) visit(target);
    visiting.delete(key); visited.add(key);
  };
  for (const key of slices.keys()) visit(key);
  return true;
}

/** Retained private receipt invariants; current DB assignment/ACL checks are separate. */
export function validateInputIdentitySemantics(identity, definition) {
  assert(identity.workspace_id === definition.workspace_id && identity.initiative_id === definition.initiative_id, "INPUT_SCOPE_MISMATCH");
  for (const key of ["approved_subject_ref", "manual_profile_ref", "scope_revision_ref", "workflow_ref", "quality_policy_ref"]) {
    assert(same(identity[key], definition[key]), "INPUT_REFERENCE_MISMATCH");
  }
  assert(same(identity.repository_inputs, definition.repositories), "INPUT_REPOSITORY_MISMATCH");
  assert(same(identity.gate_assignments.map((item) => item.gate_type), ["CODE_READINESS", "PLAN_APPROVAL", "PRD_APPROVAL"]), "INPUT_GATES_MISSING");
  assert(new Set(identity.gate_assignments.map((item) => item.gate_assignment_id)).size === 3, "INPUT_ASSIGNMENT_REUSED");
  if (definition.slices.some((slice) => slice.risk_tier !== "LOW")) {
    assert(new Set(identity.gate_assignments.map((item) => item.approver_user_id)).size === 3, "INPUT_GATE_SEPARATION");
  }
  const owners = [...new Set(definition.slices.map((slice) => slice.owner.actor_id))].sort(unicodeOrder);
  assert(same(identity.human_owner_ids, owners), "INPUT_OWNER_MISMATCH");
  const objects = identity.protected_inputs.map((item) => item.object_ref);
  assert(new Set(objects.map((item) => item.object_id)).size === objects.length, "INPUT_OBJECT_REUSED");
  for (const item of identity.protected_inputs) {
    const bound = item.input_kind === "CONTEXT_INPUT" ? 524288000 : 104857600;
    assert(item.object_ref.size_bytes <= bound, "INPUT_OBJECT_TOO_LARGE");
  }
  for (const repository of definition.repositories) {
    assert(identity.protected_inputs.some((item) => item.input_kind === "CONTEXT_INPUT" && same(item.object_ref, repository.context_input_ref)), "INPUT_CONTEXT_MISSING");
  }
  for (const dependency of definition.dependencies) {
    if (dependency.artifact_ref !== null) assert(objects.some((item) => same(item, dependency.artifact_ref)), "INPUT_DEPENDENCY_ARTIFACT_MISSING");
  }
  assert(identity.digest === metadataDigest(identity), "INPUT_DIGEST_MISMATCH");
  return true;
}
