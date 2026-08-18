import { createHash } from "node:crypto";

export const M0_03_CONTEXT_PATHS = Object.freeze(
  [
    "contracts/database/m0-03-policy-contract.md",
    "contracts/policy/core-policy-v1.json",
    "contracts/schemas/core-policy-manifest.schema.json",
    "contracts/schemas/examples/core-policy-manifest.invalid.json",
    "contracts/schemas/examples/core-policy-manifest.valid.json",
    "contracts/schemas/examples/policy-decision.invalid.json",
    "contracts/schemas/examples/policy-decision.valid.json",
    "contracts/schemas/examples/policy-evaluation.invalid.json",
    "contracts/schemas/examples/policy-evaluation.valid.json",
    "contracts/schemas/policy-decision.schema.json",
    "contracts/schemas/policy-evaluation.schema.json",
    "contracts/schemas/semantic-fixtures/policy-decision-allow-reason.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-decision-human-recorder.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-gate-assignment.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-gate-assignment.valid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-human-service-auth.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-human-service-role.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-service-human-role.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-service-membership.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-service-version.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-service.valid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-target-version.invalid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-target-version.valid.json",
    "contracts/schemas/semantic-fixtures/policy-evaluation-transition-service.valid.json",
    "docs/curve-ai-native-sdlc-prd.md",
    "docs/technical/architecture.md",
    "docs/technical/domain-model.md",
    "docs/technical/m0-03-core-policy-task-packet.md",
    "docs/technical/m0-authorization-and-state-matrices.md",
    "docs/technical/m0-s2-implementation-evidence.md",
    "docs/technical/security-and-operations.md",
    "scripts/lib/context-pack.mjs",
    "scripts/validate-contracts.mjs",
  ].sort(),
);

const P0_06_CONTEXT_PATHS = Object.freeze(
  [
    "contracts/temporal/m0-workflow-contract.md",
    "docs/technical/adr-003-runtime-topology.md",
    "docs/technical/development-plan.md",
    "docs/technical/m0-readiness-board.md",
    "docs/technical/p0-06-local-temporal-proof-task-packet.md",
  ].sort(),
);

const CONTEXT_PATHS = new Map([
  ["M0-03", M0_03_CONTEXT_PATHS],
  ["P0-06", P0_06_CONTEXT_PATHS],
]);

export function contextPathsFor(taskId) {
  const paths = CONTEXT_PATHS.get(taskId);
  return paths ? [...paths] : null;
}

export function digestContextEntries(entries) {
  const ordered = [...entries].sort((left, right) => left.path.localeCompare(right.path));
  const paths = ordered.map((entry) => entry.path);
  if (new Set(paths).size !== paths.length) throw new Error("Context-pack paths must be unique.");

  const digest = createHash("sha256");
  digest.update("curve-context-pack:v1\0");
  for (const entry of ordered) {
    if (!Buffer.isBuffer(entry.contents)) throw new Error(`Context-pack entry ${entry.path} is not a Buffer.`);
    digest.update(entry.path);
    digest.update("\0");
    digest.update(String(entry.contents.length));
    digest.update("\0");
    digest.update(entry.contents);
    digest.update("\0");
  }
  return `sha256:${digest.digest("hex")}`;
}
