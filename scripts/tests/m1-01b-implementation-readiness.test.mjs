import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  collectCodingAgentTaskPacketStateBindings,
  computeCodingAgentApprovalSubjectDigest,
  computeCodingAgentTaskPacketDigest,
  projectCodingAgentSourceCatalogRecord,
  validateCodingAgentTaskPacketSemantics,
} from "../lib/coding-agent-task-packet.mjs";
import {
  digestContextEntries,
  M1_01B_CONTEXT_PATHS,
  contextPathsFor,
} from "../lib/context-pack.mjs";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptRoot, "../..");
const curveRevision = "f7c211cfcd7cfff7fd026d9cdd7b57a6fe6c95fe";
const planeRevision = "9f9bb14f46b80e1d05b4c900d25c1af7a229b55c";
const projectItemId = "PVTI_lAHOBNjuQc4BgZzOzg4vNto";
const preparedContextDigest = "sha256:2f3b89607a2ada9918829a13767ccd180da6209110e90836ebafedaeaad4df5c";

function read(path) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

function sha256(contents) {
  return `sha256:${createHash("sha256").update(contents).digest("hex")}`;
}

function gitBlob(revision, path) {
  return execFileSync("git", ["show", `${revision}:${path}`], { cwd: repoRoot });
}

function schemaValidator(path) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(readJson(path));
}

const packetPath = "contracts/schemas/examples/coding-agent-task-packet.valid.json";
const contextPath = "contracts/context/m1-01b-prepared-v1.json";
const sourceCatalogPath = "contracts/task-packet-sources/m1-01b-prepared-v1.json";
const stateDirectory = join(repoRoot, "contracts/state/m1-01b");
const implementationPacketPath = "docs/technical/m1-01b-initiative-shell-implementation-task-packet.md";
const grantDecisionPath = "docs/technical/m1-01b-execution-grant-decision.md";
const humanGrantPath = "docs/technical/m1-01b-human-execution-grant.md";

const packet = readJson(packetPath);
const context = readJson(contextPath);
const sourceCatalog = readJson(sourceCatalogPath);

test("M1-01B canonical specimen is current, sealed, and fail-closed", () => {
  assert.equal(packet.packet_id, "CURVE-M1-01B");
  assert.equal(packet.work_package_id, "M1-01B");
  assert.equal(packet.packet_version, 2);
  assert.equal(packet.status, "BLOCKED");
  assert.equal(packet.curve_binding.curve_revision, curveRevision);
  assert.equal(packet.repository.base_sha, planeRevision);
  assert.equal(packet.repository.stale_base_policy, "REQUIRE_EXACT_REMOTE_TIP");
  assert.equal(packet.project_tracking.item_node_id, projectItemId);
  assert.equal(packet.project_tracking.tracking_kind, "WORK_PACKAGE");
  assert.equal(packet.project_tracking.visual_metadata_only, true);
  assert.equal(packet.packet_digest, computeCodingAgentTaskPacketDigest(packet));
  assert.deepEqual(
    packet.blockers.map(({ blocker_id }) => blocker_id).sort(),
    ["B-CODING-TOOLS-01", "B-CONTEXT-PACK", "B-MACHINE-STATE", "B-SOURCE-CATALOG"].sort(),
  );
  assert.ok(packet.commands.every(({ availability }) => availability === "PLANNED"));
  assert.deepEqual(
    packet.commands.find(({ id }) => id === "CMD-SECURITY").argv,
    ["codeql", "UNRESOLVED"],
  );
  assert.equal(packet.ux_evidence.resolution, "REQUIRED_UNRESOLVED");
  assert.equal(packet.ux_evidence.unresolved_blocker_id, "B-MACHINE-STATE");
  validateCodingAgentTaskPacketSemantics(packet);
});

test("M1-01B packet carries the complete approved frontend acceptance scope", () => {
  assert.deepEqual(packet.requirements.functional_requirement_ids, ["FR-001", "FR-042", "FR-043"]);
  assert.deepEqual(packet.requirements.non_functional_requirement_ids, ["NFR-005", "NFR-009", "NFR-015", "NFR-016"]);
  assert.deepEqual(
    packet.requirements.acceptance_tests.map(({ id }) => id),
    [
      "AC-01-UI-LIST",
      "AC-01-UI-CREATE",
      "AC-01-UI-HUMANS",
      "AC-01-UI-RESET",
      "AC-01-UI-LIFECYCLE",
      "AC-01-UI-CONFLICT",
      "AC-01-UI-RECOVERY",
      "AC-01-UI-MOBILE",
      "AC-01-UI-KEYBOARD",
      "AC-01-UI-DISABLED",
    ],
  );
  const joinedAcceptance = JSON.stringify(packet.requirements.acceptance_tests);
  for (const required of [
    "three-distinct-human",
    "fresh-form",
    "mobile multi-row",
    "optimistic-concurrency",
    "keyboard and reflow",
    "disabled-state",
  ]) {
    assert.match(joinedAcceptance, new RegExp(required, "i"));
  }

  const targetPaths = new Set(packet.repository_instructions.map(({ path }) => path));
  for (const path of [
    "apps/web/package.json",
    "apps/web/vitest.config.ts",
    "packages/services/src/curve/curve.service.ts",
    "packages/types/src/curve.ts",
    "apps/web/core/services/curve.service.ts",
    "apps/web/core/components/curve/curve-workspace-sidebar.tsx",
    "apps/web/app/routes/core.ts",
    "apps/web/core/hooks/store/use-member.ts",
    "apps/web/core/store/member/workspace/workspace-member.store.ts",
  ]) {
    assert.equal(targetPaths.has(path), true, `missing target instruction ${path}`);
  }
  assert.ok(packet.repository_instructions.every(({ revision }) => revision === planeRevision));
});

test("prepared source catalog exactly projects the blocked packet", () => {
  const validate = schemaValidator("contracts/schemas/coding-agent-source-catalog.schema.json");
  assert.equal(validate(sourceCatalog), true, JSON.stringify(validate.errors));
  assert.equal(sourceCatalog.catalog_id, "curve-m1-01b-prepared");
  assert.deepEqual(sourceCatalog.work_packages, [projectCodingAgentSourceCatalogRecord(packet)]);
});

test("prepared context manifest resolves every current-main input and declares regeneration", () => {
  const validate = schemaValidator("contracts/schemas/coding-agent-context-pack-manifest.schema.json");
  assert.equal(validate(context), true, JSON.stringify(validate.errors));
  assert.equal(context.context_pack_id, "M1-01B-PREPARED-F7C211C");
  assert.equal(context.curve_revision, curveRevision);
  assert.ok(context.entries.every(({ revision }) => revision === curveRevision));

  const entries = context.entries.map((entry) => {
    const contents = gitBlob(entry.revision, entry.path);
    assert.equal(sha256(contents), entry.content_digest, `stale context digest for ${entry.path}`);
    return { path: entry.path, contents };
  });
  assert.equal(digestContextEntries(entries), preparedContextDigest);

  const unpublishedNormativePaths = [
    grantDecisionPath,
    implementationPacketPath,
    "scripts/tests/m1-01b-implementation-readiness.test.mjs",
  ].sort();
  assert.deepEqual(contextPathsFor("M1-01B"), [...M1_01B_CONTEXT_PATHS]);
  assert.deepEqual(
    M1_01B_CONTEXT_PATHS.filter((path) => !context.entries.some((entry) => entry.path === path)),
    unpublishedNormativePaths,
  );
  assert.match(read(implementationPacketPath), /regenerated after the normative source\s+is merged/i);
});

test("prepared human state records bind exact packet subjects and existing authority bytes", () => {
  const validate = schemaValidator("contracts/schemas/coding-agent-state-evidence.schema.json");
  const stateFiles = readdirSync(stateDirectory).filter((name) => name.endsWith(".json")).sort();
  assert.equal(stateFiles.length, 10);

  const expectedBindings = new Map(
    collectCodingAgentTaskPacketStateBindings(packet).map((binding) => [
      `${binding.subjectType}:${binding.subjectId}`,
      binding,
    ]),
  );
  const observed = new Set();
  for (const name of stateFiles) {
    const record = readJson(`contracts/state/m1-01b/${name}`);
    assert.equal(validate(record), true, `${name}: ${JSON.stringify(validate.errors)}`);
    const key = `${record.subject_type}:${record.subject_id}`;
    const expected = expectedBindings.get(key);
    assert.ok(expected, `unexpected state subject ${key}`);
    assert.deepEqual(record.approval_subject, expected.approvalSubject);
    assert.equal(record.approval_subject_digest, computeCodingAgentApprovalSubjectDigest(expected.approvalSubject));
    assert.ok(record.attestations.every(({ actor_type }) => actor_type === "HUMAN"));
    for (const attestation of record.attestations) {
      assert.equal(attestation.subject_digest, record.approval_subject_digest);
      assert.equal(attestation.authority_source.revision, curveRevision);
      const bytes = gitBlob(attestation.authority_source.revision, attestation.authority_source.path);
      assert.equal(sha256(bytes), attestation.authority_source.content_digest);
    }
    observed.add(key);
  }

  assert.deepEqual(
    [...observed].sort(),
    [
      "CONTRACT:CURVE-OPENAPI-V1",
      "CONTRACT:INITIATIVE-POLICY-V1",
      "CONTRACT:INITIATIVE-SCHEMA-V1",
      "DECISION:D-001",
      "DEPENDENCY:M1-01A",
      "GOVERNANCE_DOCUMENT:DOC-ADR-001",
      "GOVERNANCE_DOCUMENT:DOC-ARCHITECTURE",
      "GOVERNANCE_DOCUMENT:DOC-DEVELOPMENT-PLAN",
      "GOVERNANCE_DOCUMENT:DOC-PRD",
      "UX:M1-01B",
    ].sort(),
  );
});

test("implementation packet and grant record preserve scope and authority separation", () => {
  const implementation = read(implementationPacketPath);
  const grant = read(grantDecisionPath);
  const humanGrant = read(humanGrantPath);
  for (const required of [
    planeRevision,
    projectItemId,
    "typed Product, Initiative, GateAssignment",
    "three distinct user IDs",
    "Every opening resets authored fields",
    "Every matching accumulated Initiative remains rendered on mobile",
    "WCAG",
    "B-CODING-TOOLS-01",
    "B-CODING-AUTHORITY-01",
    "S -> E1 -> E2 -> C -> P",
  ]) {
    assert.match(implementation, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
  for (const excluded of ["no backend/migration", "no protected body or credential"]) {
    assert.match(`${implementation}\n${grant}`, new RegExp(excluded.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
  assert.match(grant, /DECIDED \/ HUMAN_OPERATED_OUTSIDE_CURVE_DISPATCH \/ MACHINE_DISPATCH_BLOCKED/);
  assert.match(grant, /node_execution_profile: HUMAN_OPERATED_LOCAL_NODE_PNPM/);
  assert.match(grant, /security_profile: LOCAL_STATIC_AND_COMMIT_CODEQL_M1_01B_V1/);
  assert.match(grant, /authority_profile: HUMAN_OPERATED_OUTSIDE_CURVE_V1/);
  assert.match(grant, /implementation_authority_granted: false/);
  assert.match(grant, /human_execution_grant: ACTIVE/);
  assert.match(grant, /curve_machine_dispatch_status: BLOCKED/);
  assert.match(humanGrant, /c516a612a29751b0d24bcbd32bfcba1bd73fe3af/);
  assert.match(humanGrant, /manual UX\/UI[\s\S]*test[\s\S]*remains unmerged/i);
  assert.match(grant, /BOOTSTRAP_LOCAL_MANUAL_V1/);
  assert.match(grant, /PRODUCTION_AUTHORITY_FIRST_V1/);
  assert.match(grant, /HUMAN_OPERATED_OUTSIDE_CURVE_V1/);
});

test("CI fetches complete Git history for exact-revision provenance checks", () => {
  const workflow = read(".github/workflows/docs.yml");
  assert.match(workflow, /actions\/checkout@v4[\s\S]*fetch-depth:\s*0/);
});
