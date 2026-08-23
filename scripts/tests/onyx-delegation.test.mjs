import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  computeOnyxDecisionPayloadDigest,
  ONYX_PROOF_CASE_IDS,
  unresolvedOnyxRequirements,
  validateOnyxDelegationDecision,
} from "../lib/onyx-delegation.mjs";

const proposal = JSON.parse(
  readFileSync(
    new URL("../../contracts/governance/d002-onyx-delegation-v1.json", import.meta.url),
    "utf8",
  ),
);

function digest(seed) {
  return `sha256:${seed.repeat(64).slice(0, 64)}`;
}

function decidedFixture() {
  const fixture = structuredClone(proposal);
  fixture.status = "DECIDED";
  fixture.source_boundary.deployed_version = "v4.5.0-test";
  fixture.source_boundary.image_digest = digest("1");
  fixture.source_boundary.openapi_digest = digest("2");
  fixture.source_boundary.sanitized_configuration_digest = digest("3");
  fixture.mechanism.selected = "IDP_TOKEN_EXCHANGE";
  fixture.mechanism.protocol_version = "urn:ietf:params:oauth:grant-type:token-exchange";
  Object.assign(fixture.principal_binding, {
    issuer: "https://id.example.test/",
    audience: "onyx-test",
    subject_mapping: "curve.actor.external_subject equals onyx.user.external_subject",
    workspace_claim: "curve_workspace_id",
    operation_claim: "curve_operation_id",
    purpose_claim: "curve_purpose",
  });
  fixture.credential_lifecycle.maximum_ttl_seconds = 300;
  fixture.credential_lifecycle.revocation_maximum_seconds = 30;
  fixture.api_profile.per_user_delegated_api_support = "PROVEN";
  fixture.api_profile.search = {
    method: "POST",
    path: "/api/search/document-search",
    response_schema_digest: digest("4"),
  };
  fixture.api_profile.access_check = {
    method: "POST",
    path: "/api/search/document-access-check",
    response_schema_digest: digest("5"),
  };
  fixture.api_profile.allowed_capabilities = [
    "DOCUMENT_SEARCH",
    "SOURCE_ACCESS_CHECK",
    "SOURCE_METADATA_READ",
  ];
  fixture.api_profile.timeout_milliseconds = 5000;
  fixture.api_profile.retry_policy = "two bounded retries for safe idempotent reads";
  fixture.api_profile.rate_limit_contract = "honor Retry-After; no unbounded retry";
  fixture.proof_cases = ONYX_PROOF_CASE_IDS.map((id, index) => ({
    id,
    status: "PASS",
    evidence_digest: digest(((index + 6) % 10).toString()),
  }));
  fixture.owners.security_identity = "Security Owner";
  fixture.owners.onyx_operations = "Onyx Owner";
  fixture.activation.adapter_implementation_authorized = true;
  fixture.activation.live_retrieval_authorized = true;
  fixture.approvals = fixture.approvals.map((approval, index) => ({
    ...approval,
    approved_by: ["Security Owner", "Onyx Owner", "Federico Ocampo"][index],
    approved_at: "2026-08-22T23:00:00Z",
  }));
  fixture.unresolved_requirements = [];
  fixture.decision_payload_digest = computeOnyxDecisionPayloadDigest(fixture);
  fixture.approvals = fixture.approvals.map((approval) => ({
    ...approval,
    decision_payload_digest: fixture.decision_payload_digest,
  }));
  return fixture;
}

test("the canonical D-002 proposal is fail-closed and records every computed gap", () => {
  const result = validateOnyxDelegationDecision(proposal);
  assert.equal(result.dispatchable, false);
  assert.deepEqual(result.unresolved, unresolvedOnyxRequirements(proposal));
  assert.equal(proposal.activation.live_retrieval_authorized, false);
});

test("a complete D-002 decision is dispatchable only with digest-bound approvals", () => {
  const fixture = decidedFixture();
  assert.deepEqual(validateOnyxDelegationDecision(fixture), { dispatchable: true, unresolved: [] });
});

test("an undecided D-002 proposal cannot authorize live retrieval", () => {
  const fixture = structuredClone(proposal);
  fixture.activation.live_retrieval_authorized = true;
  assert.throws(() => validateOnyxDelegationDecision(fixture), /undecided/);
});

test("every required proof case is unique, passing, and evidence-bound", () => {
  for (const mutation of ["missing", "duplicate", "failed", "unbound"]) {
    const fixture = decidedFixture();
    if (mutation === "missing") fixture.proof_cases.pop();
    if (mutation === "duplicate") fixture.proof_cases[1].id = fixture.proof_cases[0].id;
    if (mutation === "failed") fixture.proof_cases[0].status = "FAIL";
    if (mutation === "unbound") fixture.proof_cases[0].evidence_digest = null;
    fixture.unresolved_requirements = unresolvedOnyxRequirements(fixture);
    assert.throws(() => validateOnyxDelegationDecision(fixture));
  }
});

test("a broad or incomplete capability profile fails closed", () => {
  for (const mutation of ["unproven", "admin", "missing-access-check"]) {
    const fixture = decidedFixture();
    if (mutation === "unproven") fixture.api_profile.per_user_delegated_api_support = "UNPROVEN";
    if (mutation === "admin") fixture.api_profile.allowed_capabilities.push("ADMINISTRATION");
    if (mutation === "missing-access-check") fixture.api_profile.access_check.path = null;
    fixture.unresolved_requirements = unresolvedOnyxRequirements(fixture);
    assert.throws(() => validateOnyxDelegationDecision(fixture));
  }
});

test("changed decision bytes invalidate every prior approval", () => {
  const fixture = decidedFixture();
  fixture.credential_lifecycle.maximum_ttl_seconds = 600;
  assert.throws(() => validateOnyxDelegationDecision(fixture), /digest/);
});
