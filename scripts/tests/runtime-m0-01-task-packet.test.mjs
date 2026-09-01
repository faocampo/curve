import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  RUNTIME_M0_01_CONTEXT_PATHS,
  contextPathsFor,
} from "../lib/context-pack.mjs";

const read = (path) =>
  fs.readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const packet = read(
  "docs/technical/runtime-m0-01-graceful-shutdown-task-packet.md",
);
const decision = read(
  "docs/technical/coding-agent-local-execution-decision.md",
);
const development = read("docs/technical/development-plan.md");
const readiness = read("docs/technical/m0-readiness-board.md");
const strategy = read("docs/technical/m0-test-strategy.md");
const technicalIndex = read("docs/technical/README.md");
const contractIndex = read("contracts/README.md");
const m0Audit = read("docs/technical/m0-completion-audit.md");

test("RUNTIME-M0-01 context is canonical, complete, and repository-resolvable", () => {
  const requiredPaths = [
    "contracts/README.md",
    "contracts/schemas/coding-agent-context-pack-manifest.schema.json",
    "contracts/schemas/coding-agent-implementation-authorization.schema.json",
    "contracts/schemas/coding-agent-source-catalog.schema.json",
    "contracts/schemas/coding-agent-state-evidence.schema.json",
    "contracts/schemas/coding-agent-task-packet.schema.json",
    "contracts/task-packet-authorizations/README.md",
    "contracts/task-packets/README.md",
    "contracts/testing/ac-test-matrix-v1.json",
    "contracts/temporal/m0-workflow-contract.md",
    "docs/curve-ai-native-sdlc-prd.md",
    "docs/technical/adr-001-plane-upstream-foundation.md",
    "docs/technical/adr-003-runtime-topology.md",
    "docs/technical/architecture.md",
    "docs/technical/architecture-decisions.md",
    "docs/technical/coding-agent-local-execution-decision.md",
    "docs/technical/development-plan.md",
    "docs/technical/local-runtime-refresh-evidence.md",
    "docs/technical/m0-completion-audit.md",
    "docs/technical/m0-readiness-board.md",
    "docs/technical/m0-s6a-durable-orchestration-task-packet.md",
    "docs/technical/m0-s6a-implementation-evidence.md",
    "docs/technical/m0-test-strategy.md",
    "docs/technical/m0-traceability.md",
    "docs/technical/runtime-m0-01-graceful-shutdown-task-packet.md",
    "docs/technical/security-and-operations.md",
    "scripts/lib/coding-agent-task-packet.mjs",
    "scripts/lib/context-pack.mjs",
    "scripts/tests/coding-agent-task-packet.test.mjs",
    "scripts/tests/runtime-m0-01-task-packet.test.mjs",
    "scripts/validate-contracts.mjs",
  ];

  assert.deepEqual(RUNTIME_M0_01_CONTEXT_PATHS, [...requiredPaths].sort());
  assert.deepEqual(contextPathsFor("RUNTIME-M0-01"), RUNTIME_M0_01_CONTEXT_PATHS);
  assert.equal(
    new Set(RUNTIME_M0_01_CONTEXT_PATHS).size,
    RUNTIME_M0_01_CONTEXT_PATHS.length,
  );
  for (const path of RUNTIME_M0_01_CONTEXT_PATHS) {
    assert.ok(fs.existsSync(new URL(`../../${path}`, import.meta.url)), path);
  }
});

test("RUNTIME-M0-01 pins one bounded Plane correction and exact rollback", () => {
  for (const value of [
    "git@github.com:faocampo/plane.git",
    "99a73b4eab5ee21fd012d7358bc9259252d47f71",
    "curve/runtime-m0-01-graceful-worker-shutdown",
    "apps/api/plane/curve/temporal/worker.py",
    "apps/api/plane/curve/temporal/worker_lifecycle.py",
    "apps/api/plane/curve/tests/test_curve_worker_lifecycle.py",
    "CURVE_ENABLED=0",
  ]) {
    assert.ok(packet.includes(value), value);
  }

  for (const requirement of ["FR-015", "FR-022", "NFR-004", "NFR-005", "AC-58"]) {
    assert.ok(packet.includes(requirement), requirement);
  }
  assert.match(packet, /R1-03 \(full disaster-\s*recovery exercise\) retains ownership/);
  assert.match(packet, /No application data or migration|no migration or schema rollback/i);
  assert.match(packet, /no Plane mutation/i);
  assert.doesNotMatch(packet, /AC-21 \(cancellation and recovery\)/);
  assert.match(packet, /supplemental local M0-06/);
  assert.match(packet, /NFR-005 \(idempotent replay\) is a regression constraint/);
  for (const caseId of ["RT-13", "RT-14", "RT-15", "RT-16"]) {
    assert.ok(packet.includes(caseId), caseId);
  }
  assert.match(packet, /worker, then relay, then `worker\.shutdown\(\)`/);

  const inScope = packet.match(/### In scope([\s\S]*?)### Out of scope/)?.[1];
  assert.ok(inScope, "in-scope section");
  const implementationPaths = [
    ...inScope.matchAll(/`(apps\/api\/[^`]+)`/g),
  ].map((match) => match[1]);
  assert.deepEqual(implementationPaths.sort(), [
    "apps/api/plane/curve/temporal/worker.py",
    "apps/api/plane/curve/temporal/worker_lifecycle.py",
    "apps/api/plane/curve/tests/test_curve_worker_lifecycle.py",
  ]);
});

test("runtime definition proposes human operation while machine dispatch stays fail closed", () => {
  assert.match(
    packet,
    /`DEFINITION_PREPARED \/ MANUAL_BOOTSTRAP_PROPOSED \/ OWNER_DECISION_REQUIRED \/ NOT_IMPLEMENTATION_AUTHORITY`/,
  );
  assert.match(packet, /^\| Version \| 1\.1 \|$/m);
  assert.match(decision, /^\| Version \| 1\.1 \|$/m);
  assert.match(
    decision,
    /`ANALYZED \/ SIMPLIFIED BOOTSTRAP PROPOSED \/ OWNER DECISION REQUIRED \/ NOT IMPLEMENTATION AUTHORITY`/,
  );
  assert.match(packet, /B-CODING-TOOLS-01/);
  assert.match(packet, /B-CODING-AUTHORITY-01/);

  assert.match(decision, /^### Option A — Trust-tiered local bootstrap profile$/m);
  assert.match(decision, /^### Option B — gVisor for every coding command$/m);
  assert.match(decision, /^### Option C — Docker-controller-only local execution$/m);
  assert.match(
    decision,
    /^### Option 1 — Bootstrap-local human grant plus production fail-closed$/m,
  );
  assert.match(decision, /^### Option 2 — Implement production authority and lease first$/m);
  assert.match(
    decision,
    /^### Option 3 — Continue human-operated coding outside Curve dispatch$/m,
  );
  assert.doesNotMatch(decision, /Option (?:A|1)[^\n]*\(recommended\)/);
  assert.match(decision, /cannot select the security\s+architecture/);
  assert.match(
    decision,
    /Select B-CODING-AUTHORITY-01 Option 3 \(human-operated coding outside Curve\s+dispatch\)[\s\S]*`DEFERRED_TO_M4`/,
  );
  assert.match(
    decision,
    /Curve machine dispatch remains fail closed until M4\s+implements the production-relevant OpenHands\/gVisor execution and authority\s+boundary/,
  );

  assert.doesNotMatch(packet, /docker compose[^\n]*sh -c/);
  for (const phase of ["CMD-LINT", "CMD-BUILD", "CMD-TEST", "CMD-SECURITY", "CMD-LOCAL-RUN"]) {
    assert.ok(packet.includes(phase), phase);
  }
  assert.match(packet, /`HUMAN_EXECUTION_CANDIDATE \/ MACHINE_UNAVAILABLE`/);
  assert.doesNotMatch(packet, /`PLANNED \/ UNAVAILABLE`/);
  assert.doesNotMatch(packet, /docker compose[^\n]*--build/);
  assert.match(packet, /zero open `critical` or `high` alerts/);
  assert.match(packet, /AC-58-RUNTIME-01/);
  assert.match(packet, /AC-58-RUNTIME-16/);
  assert.doesNotMatch(packet, /`CMD-SECURITY`[^\n]*test_curve_worker_lifecycle\.py/);
  assert.match(packet, /ruff check --no-cache/);
  assert.match(packet, /`CMD-TEST` complete backend/);
  assert.match(packet, /temporarily set[^\n]*restart policy to `no`/i);
  assert.match(packet, /plane-m1-01a-initiative-core-20260829-api-tests:latest/);
  assert.match(packet, /curve-runtime-m0-01-validation/);
  assert.doesNotMatch(packet, /--project-name plane-m1-01a-initiative-core-20260829/);
  assert.match(packet, /pre-existing resource stops\s+the attempt and is not removed/);
  assert.match(packet, /docker image tag sha256:5dcd00/);
  assert.match(packet, /docker image rm curve-runtime-m0-01-validation-api-tests:latest/);
  assert.match(
    packet,
    /\/usr\/bin\/install -m 600 apps\/api\/\.env\.example apps\/api\/\.env/,
  );
  assert.match(
    packet,
    /sha256:e731bb2ae230e12379b06c0ded1a66e7bca520294ef64b273087151eec7b49c7/,
  );
  assert.match(packet, /appends no secret/);
  assert.match(packet, /Cleanup responsibility begins immediately after the\s+successful `install`/);
  assert.match(packet, /\/bin\/rm apps\/api\/\.env/);
  assert.match(
    decision,
    /Four healthy dependency containers and the `test_env` network remain active under Compose project `plane-m1-01a-initiative-core-20260829`/,
  );
  assert.match(
    packet,
    /sha256:5dcd00dec45aebe57fd0965e0b04e1765cad6dcce32af474fbc29073bbe834d7/,
  );
  for (const [tag, digest] of [
    [
      "postgres:15.7-alpine",
      "sha256:468d34fefd6338031787c7b8e94078975b3aaf4d66c7ead25c39cd3ba46a15c6",
    ],
    [
      "valkey/valkey:7.2.11-alpine",
      "sha256:10328d00120dc14fbc87b2ed61b7677ddbb0d011e705361b4788329a0ec69a93",
    ],
    [
      "rabbitmq:3.13.6-management-alpine",
      "sha256:611107e29cce05c2acd968325d5dcbde7e2fee404970f1ead75fdb22be2821b3",
    ],
    [
      "minio/minio:latest",
      "sha256:14cea493d9a34af32f524e538b8346cf79f3321eff8e708c1e2960462bd8936e",
    ],
  ]) {
    assert.ok(packet.includes(tag), tag);
    assert.ok(packet.includes(digest), digest);
  }
  const composeRunCommands = [
    ...packet.matchAll(/`(docker compose[^`]*\brun\b[^`]*)`/g),
  ].map((match) => match[1]);
  assert.equal(composeRunCommands.length, 7);
  for (const command of composeRunCommands) {
    assert.match(command, /\s--pull never(?:\s|$)/, command);
  }
  assert.match(packet, /c6d757e7-7c0d-4721-990b-4cfbf4063e8e/);
  assert.match(decision, /c6d757e7-7c0d-4721-990b-4cfbf4063e8e/);
  assert.doesNotMatch(packet, /UNRESOLVED_WORKSPACE_ID/);
  assert.match(
    packet,
    /no Operation outside the\s+terminal set `SUCCEEDED`, `FAILED`, and `CANCELLED`/,
  );
  assert.match(
    packet,
    /no OutboxEvent in any\s+state other than `DELIVERED` whose\s+destination is `CURVE_TEMPORAL_OPERATION_V1`/,
  );
  assert.match(
    packet,
    /namespace `curve-local` on task queue `curve-control-plane-v1`/,
  );
  assert.match(
    packet,
    /Inventory\s+pending application destinations such as `CURVE_LOCAL` separately because\s+the worker relay never claims them/,
  );
  assert.match(
    decision,
    /95 pending `CURVE_LOCAL` application events[\s\S]*Application-local events are inventoried separately and do not block the signal proof/,
  );
  assert.match(packet, /PVTI_lAHOBNjuQc4BgZzOzg4kt70/);
  assert.match(packet, /minimum is fourteen state records/);

  assert.match(
    packet,
    /Federico approves B-CODING-AUTHORITY-01 Option 3 and records\s+B-CODING-TOOLS-01 as `DEFERRED_TO_M4` at one exact merged Curve revision/,
  );
  assert.match(
    packet,
    /Federico grants one exact Plane execution scope binding the live base,\s+feature branch, files, commands, synthetic-data boundary, local Docker\s+effects, VCS effects, tests, review, rollback, and validity window/,
  );
  assert.match(
    packet,
    /creates no canonical machine task packet, implementation-\s*authorization record, or attempt lease/,
  );
  assert.match(packet, /`HUMAN_OPERATED_OUTSIDE_CURVE_DISPATCH`/);
  assert.match(packet, /generic production\s+preflight and dispatcher fail closed/);
  assert.match(
    packet,
    /If M4 materializes this correction as a machine exercise, publication uses\s+`S -> E1\.\.En -> C -> P`/,
  );
  assert.match(
    packet,
    /human-operated RUNTIME-M0-01 implementation does not create these artifacts or\s+claim this publication path/,
  );
  assert.doesNotMatch(packet, /`PASSED_WITH_IMPLEMENTATION_AUTHORITY_REQUIRED`/);
  assert.doesNotMatch(
    packet,
    /does not block these publication revisions or read-only readiness/,
  );

  for (const path of [
    "contracts/authority/runtime-m0-01-v1.json",
    "contracts/state/runtime-m0-01/*.json",
    "contracts/context/runtime-m0-01-v1.json",
    "contracts/task-packet-sources/runtime-m0-01-v1.json",
    "contracts/task-packets/runtime-m0-01-v1.json",
    "contracts/task-packet-authorizations/runtime-m0-01-attempt-1-v1.json",
  ]) assert.ok(packet.includes(path), path);

  for (const path of [
    "contracts/authority/runtime-m0-01-v1.json",
    "contracts/context/runtime-m0-01-v1.json",
    "contracts/task-packet-sources/runtime-m0-01-v1.json",
    "contracts/task-packets/runtime-m0-01-v1.json",
    "contracts/task-packet-authorizations/runtime-m0-01-attempt-1-v1.json",
  ]) {
    assert.equal(
      fs.existsSync(new URL(`../../${path}`, import.meta.url)),
      false,
      `${path} remains a future path`,
    );
  }
  assert.equal(
    fs.existsSync(new URL("../../contracts/state/runtime-m0-01/", import.meta.url)),
    false,
    "future RUNTIME-M0-01 state directory remains absent",
  );
  assert.doesNotMatch(m0Audit, /proposal selects/i);
});

test("active indexes and test ownership expose the same runtime boundary", () => {
  for (const [name, contents] of [
    ["development plan", development],
    ["readiness board", readiness],
    ["test strategy", strategy],
    ["technical index", technicalIndex],
  ]) {
    assert.match(contents, /RUNTIME-M0-01/, name);
    assert.match(contents, /graceful Curve worker shutdown classification/i, name);
  }
  const traceability = read("docs/technical/m0-traceability.md");
  assert.match(traceability, /RUNTIME-M0-01 graceful worker-shutdown checkpoint/);
  assert.match(traceability, /after owner selection and exact Plane grant/);
  const normalizedStatus = "DEFINITION_PREPARED / MANUAL_BOOTSTRAP_PROPOSED / OWNER_DECISION_REQUIRED / NOT_IMPLEMENTATION_AUTHORITY";
  for (const [name, contents] of [
    ["packet", packet],
    ["development", development],
    ["readiness", readiness],
    ["traceability", traceability],
    ["technical index", technicalIndex],
    ["completion audit", m0Audit],
  ]) {
    assert.ok(contents.includes(normalizedStatus), `${name} status`);
  }
  assert.match(strategy, /R1-03 \(full disaster-recovery exercise\) retains complete AC-58 ownership/);
  assert.match(strategy, /`HUMAN_EXECUTION_CANDIDATE \/ MACHINE_UNAVAILABLE`/);
  assert.match(strategy, /outside Curve\s+dispatch under one exact Plane grant/);
  assert.match(
    strategy,
    /until M4 provides the approved OpenHands\/gVisor tool, authority, lease, and\s+execution-evidence profile/,
  );

  for (const root of [
    "contracts/authority/",
    "contracts/state/",
    "contracts/context/",
    "contracts/task-packet-sources/",
    "contracts/task-packets/",
    "contracts/task-packet-authorizations/",
  ]) {
    assert.ok(contractIndex.includes(root), root);
  }
  assert.match(contractIndex, /`S -> E1\.\.En -> C -> P`/);

  const stateFixture = JSON.parse(
    read("contracts/schemas/examples/coding-agent-state-evidence.valid.json"),
  );
  assert.match(
    stateFixture.attestations[0].authority_source.path,
    /^contracts\/authority\//,
  );
});
