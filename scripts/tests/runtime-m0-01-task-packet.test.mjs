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
const grant = read(
  "docs/technical/runtime-m0-01-human-execution-grant.md",
);
const evidence = read(
  "docs/technical/runtime-m0-01-implementation-evidence.md",
);

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
    "docs/technical/runtime-m0-01-human-execution-grant.md",
    "docs/technical/runtime-m0-01-implementation-evidence.md",
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
    "9f9bb14f46b80e1d05b4c900d25c1af7a229b55c",
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

test("runtime definition records accepted human operation while machine dispatch stays fail closed", () => {
  assert.match(
    packet,
    /`ACCEPTED_AND_MERGED \/ LOCAL_ONLY`/,
  );
  assert.match(packet, /^\| Version \| 1\.3 \|$/m);
  assert.match(decision, /^\| Version \| 1\.2 \|$/m);
  assert.match(
    decision,
    /`DECIDED \/ OPTION 3 HUMAN-OPERATED \/ MACHINE PROFILE DEFERRED TO M4 \/ NOT IMPLEMENTATION AUTHORITY`/,
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
  assert.match(
    decision,
    /Curve PR #50 head\s+`f8e2f4b3d497f747f9e8a3b7db7508510400bae9`/,
  );
  assert.match(
    decision,
    /approved B-CODING-AUTHORITY-01 Option 3 \(human-operated coding outside\s+Curve dispatch\)[\s\S]*`DEFERRED_TO_M4`/i,
  );
  assert.match(
    decision,
    /Curve machine dispatch remains\s+fail closed until M4 implements the production-relevant OpenHands\/gVisor\s+execution and authority boundary/,
  );

  assert.doesNotMatch(packet, /docker compose[^\n]*sh -c/);
  for (const phase of ["CMD-LINT", "CMD-BUILD", "CMD-TEST", "CMD-SECURITY", "CMD-LOCAL-RUN"]) {
    assert.ok(packet.includes(phase), phase);
  }
  assert.match(packet, /`HUMAN_EXECUTION_APPROVED_PATH \/ MACHINE_UNAVAILABLE`/);
  assert.doesNotMatch(packet, /`PLANNED \/ UNAVAILABLE`/);
  assert.doesNotMatch(packet, /docker compose[^\n]*--build/);
  assert.match(packet, /zero open `critical` or `high` alerts/);
  assert.match(packet, /AC-58-RUNTIME-01/);
  assert.match(packet, /AC-58-RUNTIME-16/);
  assert.doesNotMatch(packet, /`CMD-SECURITY`[^\n]*test_curve_worker_lifecycle\.py/);
  assert.match(packet, /ruff check --no-cache/);
  assert.match(packet, /`CMD-TEST` complete backend/);
  assert.doesNotMatch(packet, /temporarily set[^\n]*restart policy to `no`/i);
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
    /sha256:2eb008a8042a6b4c10e51e4323eb180fc1548e3caaa7fde55d12f0a835a35173/,
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
    /no\s+Operation outside `SUCCEEDED`, `FAILED`, and `CANCELLED`/,
  );
  assert.match(
    packet,
    /no OutboxEvent outside\s+`DELIVERED` whose destination is `CURVE_TEMPORAL_OPERATION_V1`/,
  );
  assert.match(
    packet,
    /namespace `curve-local` on task queue\s+`curve-runtime-m0-01-validation-v1`/,
  );
  assert.match(
    packet,
    /Inventory pending application destinations\s+such as `CURVE_LOCAL` separately/,
  );
  assert.match(
    decision,
    /95 pending `CURVE_LOCAL` application events[\s\S]*Application-local events are inventoried separately and do not block the signal proof/,
  );
  assert.match(packet, /PVTI_lAHOBNjuQc4BgZzOzg4kt70/);
  assert.match(packet, /minimum is fourteen state records/);

  assert.match(
    packet,
    /Designated reviewer approved B-CODING-AUTHORITY-01 Option 3 and recorded\s+B-CODING-TOOLS-01 as `DEFERRED_TO_M4` at merged Curve revision/,
  );
  assert.match(
    packet,
    /Designated reviewer approves the prepared[\s\S]*RUNTIME-M0-01 human execution grant[\s\S]*binding the live base,\s+feature branch, files, commands, synthetic-data boundary, local Docker\s+effects, VCS effects, tests, review, rollback, and validity window/,
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

test("consumed human grant and implementation evidence bind one accepted local Plane attempt", () => {
  for (const value of [
    "CONSUMED / IMPLEMENTATION ACCEPTED_AND_MERGED / LOCAL_ONLY",
    "f8e2f4b3d497f747f9e8a3b7db7508510400bae9",
    "866032fa42e2cb57ad1a4e662d9561f742983f79",
    "git@github.com:faocampo/plane.git",
    "9f9bb14f46b80e1d05b4c900d25c1af7a229b55c",
    "curve/runtime-m0-01-graceful-worker-shutdown",
    "/private/tmp/plane-runtime-m0-01-graceful-worker-shutdown-20260901",
    "apps/api/plane/curve/temporal/worker.py",
    "apps/api/plane/curve/temporal/worker_lifecycle.py",
    "apps/api/plane/curve/tests/test_curve_worker_lifecycle.py",
    "sha256:2eb008a8042a6b4c10e51e4323eb180fc1548e3caaa7fde55d12f0a835a35173",
    "sha256:5dcd00dec45aebe57fd0965e0b04e1765cad6dcce32af474fbc29073bbe834d7",
    "sha256:468d34fefd6338031787c7b8e94078975b3aaf4d66c7ead25c39cd3ba46a15c6",
    "sha256:10328d00120dc14fbc87b2ed61b7677ddbb0d011e705361b4788329a0ec69a93",
    "sha256:611107e29cce05c2acd968325d5dcbde7e2fee404970f1ead75fdb22be2821b3",
    "sha256:14cea493d9a34af32f524e538b8346cf79f3321eff8e708c1e2960462bd8936e",
    "sha256:afaf09281c96e984df0f5510657e5609e9bb88200b12f040bc0cb672d9706617",
    "plane_dev_env",
    "2fad83313a6d22a09ee6ce52633559d5199a8d034f6f80774cc5a726e6daac29",
    "plane-plane-db-1",
    "plane-temporal-1",
    "plane-curve-worker-1",
    "curve-runtime-m0-01-validation-v1",
    "curve-runtime-m0-01-sigterm",
    "curve-runtime-m0-01-sigint",
    "curve-runtime-m0-01-recovery",
    "DATABASE_URL=postgresql://plane:plane@plane-db:5432/plane",
    "TEMPORAL_ADDRESS=temporal:7233",
    "US$0 external spend; one attempt; at most 120 local compute minutes",
    "2026-09-03T23:59:59Z",
    "CURVE_ENABLED=0",
  ]) {
    assert.ok(grant.includes(value), value);
  }

  assert.match(grant, /open one draft Plane pull request into `preview`/);
  assert.match(grant, /No image build, pull, package installation/);
  assert.match(grant, /long-lived worker mutation/);
  assert.match(grant, /external\/protected\/staging\/production credentials or secrets/);
  assert.match(grant, /The approval permits one attempt\s+and no merge/);
  assert.match(grant, /Plane mutation begins only\s+after Designated reviewer approves the exact Curve revision/);
  assert.match(grant, /must equal their\s+preflight values after cleanup/);
  assert.match(grant, /Curve machine dispatch remains unavailable/i);
  assert.match(grant, /exact read-only `temporal task-queue describe` commands/);
  assert.match(grant, /poll time no older than 30 seconds/);
  assert.match(packet, /--task-queue-type workflow --output json/);
  assert.match(packet, /--task-queue-type activity --output json/);
  assert.match(packet, /missing or stale workflow\/activity poller stops the case/);

  for (const value of [
    "ACCEPTED_AND_MERGED / LOCAL_ONLY",
    "030644db40e5a949ac02a193ad47b0c86f96dcab",
    "b5d611ae77d5404e326f1ffa31694fbcead2cb94",
    "88921d95e8b5b997d2578a170fe79e260b61c8c2",
    "c516a612a29751b0d24bcbd32bfcba1bd73fe3af",
    "9bee343ffc7f9ba983bcef40a276f87553e8a342",
    "33563636894",
    "33563639296",
    "33563642356",
    "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    "382 passed",
    "900 passed",
    "DONE_LOCAL",
  ]) {
    assert.ok(evidence.includes(value), value);
  }
  assert.match(evidence, /zero `critical` or `high` findings/i);
  assert.match(evidence, /Curve machine dispatch remains fail closed/i);
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
  assert.match(traceability, /`DONE_LOCAL`/);
  assert.match(packet, /`ACCEPTED_AND_MERGED \/ LOCAL_ONLY`/);
  assert.match(technicalIndex, /RUNTIME-M0-01 implementation evidence/);
  assert.match(technicalIndex, /`ACCEPTED_AND_MERGED \/ LOCAL_ONLY`/);
  for (const [name, contents] of [
    ["development", development],
    ["readiness", readiness],
    ["traceability", traceability],
    ["completion audit", m0Audit],
  ]) assert.match(contents, /RUNTIME-M0-01[\s\S]{0,1200}`?DONE_LOCAL`?/i, name);
  assert.match(strategy, /R1-03 \(full disaster-recovery exercise\) retains complete AC-58 ownership/);
  assert.match(strategy, /`HUMAN_EXECUTION_CANDIDATE \/ MACHINE_UNAVAILABLE`/);
  assert.match(strategy, /outside Curve dispatch under\s+one consumed exact Plane grant/);
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
