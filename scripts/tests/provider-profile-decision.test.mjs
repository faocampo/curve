import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  PROVIDER_PROFILE_PREDECESSOR_PATHS,
  PROVIDER_PROFILE_SCHEMA_PATHS,
  validateProviderProfileBoundBytes,
  validateProviderProfileDecisionSemantics,
} from "../lib/provider-profile-decision.mjs";

const readJson = (path) => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"));
const readBytes = (path) => readFileSync(new URL(`../../${path}`, import.meta.url));
const canonical = readJson("contracts/governance/m0-s9b2-provider-profile-v1.json");

const schemaPaths = [
  "contracts/schemas/common.schema.json",
  ...PROVIDER_PROFILE_SCHEMA_PATHS,
];
const schemas = schemaPaths.map(readJson);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const schema of schemas) ajv.addSchema(schema);

const fixtureCases = [
  ["provider-credential-reference", true],
  ["provider-credential-reference", false],
  ["provider-endpoint-profile", true],
  ["provider-endpoint-profile", false],
  ["provider-profile-binding", true],
  ["provider-profile-binding", false],
  ["provider-profile-decision", true],
  ["provider-profile-decision", false],
];

for (const [name, valid] of fixtureCases) {
  test(`${name} ${valid ? "valid" : "invalid"} fixture is classified correctly`, () => {
    const schema = ajv.getSchema(
      `https://curve.x3m.internal/contracts/schemas/${name}.schema.json`,
    );
    const fixture = readJson(`contracts/schemas/examples/${name}.${valid ? "valid" : "invalid"}.json`);
    assert.equal(schema(fixture), valid, JSON.stringify(schema.errors));
  });
}

test("canonical M0-S9B2 proposal is structurally valid, semantically fail closed, and raw-byte bound", () => {
  const schema = ajv.getSchema(
    "https://curve.x3m.internal/contracts/schemas/provider-profile-decision.schema.json",
  );
  assert.equal(schema(canonical), true, JSON.stringify(schema.errors));
  assert.deepEqual(validateProviderProfileDecisionSemantics(canonical), {
    dispatchable: false,
    unresolved: [
      "B-IDENTITY",
      "B-ENDPOINT",
      "B-DATA",
      "CREDENTIAL_PERSISTENCE_PLACEMENT",
      "BROKER_REFERENCE_SYNTAX",
      "ENDPOINT_VALUES",
      "OWNER_APPROVALS",
    ],
  });
  const paths = [...PROVIDER_PROFILE_PREDECESSOR_PATHS, ...PROVIDER_PROFILE_SCHEMA_PATHS];
  validateProviderProfileBoundBytes(
    canonical,
    Object.fromEntries(paths.map((path) => [path, readBytes(path)])),
  );
});

function clone() {
  return structuredClone(canonical);
}

for (const [label, mutate, expected] of [
  [
    "machine-selected persistence placement",
    (candidate) => { candidate.material_options.credential_persistence_placement.selected = "DEDICATED_PROFILE_RECORD"; },
    /remains a human selection/,
  ],
  [
    "concrete credential-reference syntax",
    (candidate) => { candidate.material_options.credential_reference_protocol.reference_syntax = "secret:\/\/example"; },
    /reference syntax remains unresolved/,
  ],
  [
    "concrete endpoint value",
    (candidate) => { candidate.material_options.endpoint_transport_policy.endpoint_values = ["https:\/\/provider.invalid"]; },
    /endpoint values remain unresolved/,
  ],
  [
    "networked broker port",
    (candidate) => { candidate.broker_port.network_transport = true; },
    /candidate broker port changed/,
  ],
  [
    "owner claim without decision",
    (candidate) => { candidate.owners.decision_owner = "synthetic-human"; },
    /owner, evidence, or approval claims/,
  ],
  [
    "premature activation",
    (candidate) => { candidate.activation.credential_resolution_enabled = true; },
    /fully inactive/,
  ],
  [
    "credential reference in candidate metadata",
    (candidate) => { candidate.candidate_records.credential_reference.reference_kind = "synthetic-ref"; },
    /exposed or selected a reference/,
  ],
  [
    "endpoint policy in candidate metadata",
    (candidate) => { candidate.candidate_records.endpoint_profile.transport_protocol = "HTTPS"; },
    /exposed or selected a transport value/,
  ],
  [
    "cross-workspace profile binding",
    (candidate) => { candidate.candidate_records.profile_binding.workspace_id = "33333333-3333-4333-8333-333333333333"; },
    /share one workspace-scoped provider connection/,
  ],
]) {
  test(`semantic validator rejects ${label}`, () => {
    const candidate = clone();
    mutate(candidate);
    assert.throws(() => validateProviderProfileDecisionSemantics(candidate), expected);
  });
}

test("raw-byte verifier rejects altered schema bytes", () => {
  const paths = [...PROVIDER_PROFILE_PREDECESSOR_PATHS, ...PROVIDER_PROFILE_SCHEMA_PATHS];
  const bytes = Object.fromEntries(paths.map((path) => [path, readBytes(path)]));
  bytes[PROVIDER_PROFILE_SCHEMA_PATHS[0]] = Buffer.from("{}\n");
  assert.throws(
    () => validateProviderProfileBoundBytes(canonical, bytes),
    /raw-byte digest changed/,
  );
});
