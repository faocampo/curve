import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildCodingAgentSourceCatalogProjection,
  buildCodingAgentImplementationAuthorizationBinding,
  classifyCodingAgentCommand,
  collectCodingAgentTaskPacketEvidenceReferences,
  collectCodingAgentTaskPacketStateBindings,
  computeCodingAgentApprovalSubjectDigest,
  computeCodingAgentTaskPacketDigest,
  createCodingAgentRemoteTipTestController,
  createFilesystemEvidenceResolver,
  createGitEvidenceResolver,
  createGitHubProjectItemResolver,
  createLocalCodingAgentToolResolver,
  discoverCodingAgentTaskPacketFiles,
  sealCodingAgentTaskPacket,
  validateCodingAgentCurveRepositoryPreflight,
  validateCodingAgentRepositoryPreflight,
  validateCodingAgentImplementationAuthorizationBinding,
  validateCodingAgentProjectTracking,
  validateCodingAgentRegistryFilesPreflight,
  validateCodingAgentTaskPacketEvidence,
  validateCodingAgentTaskPacketForDispatch,
  validateCodingAgentTaskPacketForDispatchWithTestControllers,
  validateCodingAgentTaskPacketForReadinessPreflight,
  validateCodingAgentTaskPacketForReadinessPreflightWithTestControllers,
  validateCodingAgentTaskPacketSemantics,
  validateCodingAgentTaskPacketSetSemantics,
  validateCodingAgentToolsPreflight,
} from "../lib/coding-agent-task-packet.mjs";
import { digestContextEntries } from "../lib/context-pack.mjs";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptRoot, "../..");
const schemaPath = resolve(
  repoRoot,
  "contracts/schemas/coding-agent-task-packet.schema.json",
);
const ajvPath = resolve(repoRoot, "node_modules/.bin/ajv");
const blockedFixture = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/examples/coding-agent-task-packet.valid.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const invalidFixture = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/examples/coding-agent-task-packet.invalid.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

function digest(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function cloneBlocked() {
  return structuredClone(blockedFixture);
}

function isSchemaValid(packet) {
  const tempDirectory = mkdtempSync(join(tmpdir(), "curve-task-packet-schema-"));
  const fixturePath = join(tempDirectory, "fixture.json");
  writeFileSync(fixturePath, `${JSON.stringify(packet, null, 2)}\n`);
  const result = spawnSync(
    ajvPath,
    [
      "validate",
      "--spec=draft2020",
      "--strict=false",
      "-c",
      "ajv-formats",
      "-s",
      schemaPath,
      "-d",
      fixturePath,
    ],
    { cwd: repoRoot, encoding: "utf8" },
  );
  rmSync(tempDirectory, { recursive: true, force: true });
  if (result.error) throw result.error;
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(result.stderr || result.stdout || `ajv exited ${result.status}`);
  }
  return result.status === 0;
}

function assertSchemaInvalid(packet, label) {
  assert.equal(isSchemaValid(packet), false, `${label} unexpectedly validated`);
}

// Migrated v1 readiness harness.
const READY_CURVE_REVISION = "a".repeat(40);
const READY_TARGET_REVISION = "b".repeat(40);
const READY_TARGET_URL = "git@github.com:faocampo/plane.git";
const READY_PROJECT_ITEM_ID = "PVTI_readySyntheticM101B";
const READY_WORKSPACE_ID = "10000000-0000-4000-8000-000000000001";
const READY_PNPM_BYTES = Buffer.from("#!/bin/sh\nprintf '11.3.0\\n'\n");
const READY_CODEQL_BYTES = Buffer.from("#!/bin/sh\nprintf '2.23.0\\n'\n");

function readyJsonBytes(value) {
  return Buffer.from(JSON.stringify(value));
}

function readyEvidenceKey(reference) {
  return `${reference.repository}:${reference.revision}:${reference.path}`;
}

function readyUnresolvedState(blockerId = "B-MACHINE-STATE") {
  return {
    resolution: "REQUIRED_UNRESOLVED",
    evidence: null,
    record_pointer: null,
    assertions: [],
    approval_subject_digest: null,
    unresolved_blocker_id: blockerId,
  };
}

function readyDecision(decisionId, governs) {
  return {
    decision_id: decisionId,
    title: `${decisionId} synthetic decided control`,
    governs: [governs],
    status: "DECIDED",
    state_binding: readyUnresolvedState(),
  };
}

function readyDependency(id) {
  return {
    id,
    title: `${id} synthetic satisfied dependency`,
    satisfaction: "SATISFIED",
    state_binding: readyUnresolvedState(),
  };
}

function readyDecisionScope(decisionId, network = false) {
  return new Map([
    ["D-004", "MODEL_GATEWAY"],
    ["D-005", "MODEL_DATA_POLICY"],
    ["D-008", network ? "NETWORK_ALLOWLIST" : "TRUSTED_VCS"],
    ["D-009", "RETENTION_AND_PROTECTED_STORAGE"],
    ["D-014", "BUDGET"],
  ]).get(decisionId) ?? "OTHER";
}

function readyProjectPayload({
  contentType = "Issue",
  status = "Ready",
  title = "M1-01B — Implement the Initiative shell",
  body = "<!-- curve-work-package-id:M1-01B -->\nExecutable work package M1-01B.",
} = {}) {
  return {
    items: [{
      id: READY_PROJECT_ITEM_ID,
      status,
      content: {
        type: contentType,
        title,
        body,
        number: 101,
        repository: "faocampo/curve",
        url: "https://github.com/faocampo/curve/issues/101",
      },
    }],
    totalCount: 1,
  };
}

function readyRegisterReference(harness, reference, bytes, revision) {
  const contents = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  reference.revision = revision;
  reference.content_digest = digest(contents);
  harness.evidence.set(readyEvidenceKey(reference), contents);
}

function readyDirectReferences(packet) {
  return [
    ...packet.curve_binding.governance_documents,
    ...packet.requirements.acceptance_tests.map((item) => item.trace_evidence),
    ...packet.repository_instructions,
    ...packet.contract_applicability
      .filter((entry) => entry.applicability === "APPLICABLE")
      .map((entry) => entry.contract),
    ...packet.external_effects.controller_contracts,
  ];
}

function readyBindDirectEvidence(harness) {
  readyDirectReferences(harness.packet).forEach((reference, index) => {
    const revision = reference.repository === "TARGET"
      ? harness.targetRevision
      : harness.packet.curve_binding.curve_revision;
    readyRegisterReference(
      harness,
      reference,
      `direct-evidence:${reference.repository}:${reference.path}:${index}\n`,
      revision,
    );
  });
}

function readyBindStateEvidence(harness) {
  const entries = collectCodingAgentTaskPacketStateBindings(harness.packet);
  assert.ok(entries.length >= 10, "READY fixture must bind every governed claim");
  entries.forEach((entry, index) => {
    const approvalSubjectDigest = computeCodingAgentApprovalSubjectDigest(
      entry.approvalSubject,
    );
    const record = {
      schema_version: "curve.coding-agent-state-evidence/v1",
      workspace_id: harness.packet.workspace_id,
      subject_type: entry.subjectType,
      subject_id: entry.subjectId,
      state: entry.state,
      approval_subject: entry.approvalSubject,
      approval_subject_digest: approvalSubjectDigest,
      attestations: [{
        actor_type: "HUMAN",
        actor_id: "faocampo",
        actor_role: entry.subjectType === "UX"
          ? "PRODUCT_APPROVER"
          : "CURVE_ENGINEERING_APPROVER",
        authority_source: null,
        workspace_id: harness.packet.workspace_id,
        authority_scope: [
          `STATE:${entry.subjectType}:${entry.subjectId}:${entry.state}`,
        ],
        attested_at: "2026-08-29T12:00:00Z",
        subject_digest: approvalSubjectDigest,
        derivation: null,
      }],
    };
    const authorityBytes = readyJsonBytes({
      workspace_id: harness.packet.workspace_id,
      actor_id: "faocampo",
      actor_role: record.attestations[0].actor_role,
      approval_subject_digest: approvalSubjectDigest,
      approved_at: "2026-08-29T12:00:00Z",
    });
    const authorityReference = {
      source_type: ["APPROVED", "DECIDED"].includes(entry.state)
        ? "CURVE_APPROVAL_RECORD"
        : "WORKSPACE_ROLE_BINDING",
      source_id: `AUTH-${String(index).padStart(2, "0")}`,
      repository: "CURVE",
      title: `${entry.label} authority source`,
      path: `contracts/authority/synthetic-${String(index).padStart(2, "0")}.json`,
      revision: harness.packet.curve_binding.curve_revision,
      content_digest: digest(authorityBytes),
    };
    record.attestations[0].authority_source = authorityReference;
    harness.evidence.set(readyEvidenceKey(authorityReference), authorityBytes);
    const path = `contracts/state/synthetic-${String(index).padStart(2, "0")}.json`;
    const reference = {
      repository: "CURVE",
      title: `${entry.label} machine state evidence`,
      path,
      revision: harness.packet.curve_binding.curve_revision,
      content_digest: digest(readyJsonBytes(record)),
    };
    harness.evidence.set(readyEvidenceKey(reference), readyJsonBytes(record));
    harness.stateRecords.set(path, record);
    Object.assign(entry.binding, {
      resolution: "RESOLVED",
      evidence: reference,
      record_pointer: "",
      assertions: [
        { pointer: "/subject_type", expected: entry.subjectType },
        { pointer: "/subject_id", expected: entry.subjectId },
        { pointer: "/state", expected: entry.state },
      ],
      approval_subject_digest: approvalSubjectDigest,
      unresolved_blocker_id: null,
    });
  });
}

function readyBindContext(harness) {
  const revision = harness.packet.curve_binding.curve_revision;
  const sources = [
    {
      path: "context/m1-01b/product-requirements.md",
      contents: Buffer.from("product requirements\n"),
    },
    {
      path: "context/m1-01b/initiative-contract.json",
      contents: Buffer.from('{"contract":"initiative-v1"}\n'),
    },
  ];
  const entries = sources.map(({ path, contents }) => {
    const entry = {
      repository: "CURVE",
      path,
      revision,
      content_digest: digest(contents),
    };
    harness.evidence.set(readyEvidenceKey(entry), contents);
    return entry;
  });
  const manifest = {
    schema_version: "curve.coding-agent-context-pack-manifest/v1",
    context_pack_id: "M1-01B-SYNTHETIC",
    version: 1,
    workspace_id: harness.packet.workspace_id,
    work_package_id: harness.packet.work_package_id,
    curve_revision: revision,
    entries,
  };
  const manifestBytes = readyJsonBytes(manifest);
  const manifestReference = {
    repository: "CURVE",
    title: "M1-01B synthetic context-pack manifest",
    path: "contracts/context/m1-01b-synthetic.json",
    revision,
    content_digest: digest(manifestBytes),
  };
  harness.evidence.set(readyEvidenceKey(manifestReference), manifestBytes);
  harness.contextManifest = manifest;
  harness.packet.curve_binding.context_pack = {
    resolution: "RESOLVED",
    manifest: manifestReference,
    context_digest: digestContextEntries(sources),
    unresolved_blocker_id: null,
  };
}

function readyBindCatalog(harness) {
  const catalog = {
    schema_version: "curve.coding-agent-source-catalog/v1",
    catalog_id: "curve-synthetic-ready-catalog",
    catalog_version: 1,
    work_packages: [buildCodingAgentSourceCatalogProjection(harness.packet)],
  };
  const catalogBytes = readyJsonBytes(catalog);
  const reference = {
    repository: "CURVE",
    title: "Synthetic coding-agent source catalog",
    path: "contracts/task-packet-sources/source-catalog.synthetic.json",
    revision: harness.packet.curve_binding.curve_revision,
    content_digest: digest(catalogBytes),
  };
  harness.evidence.set(readyEvidenceKey(reference), catalogBytes);
  harness.sourceCatalog = catalog;
  harness.packet.source_catalog_binding = {
    resolution: "RESOLVED",
    evidence: reference,
    record_pointer: "/work_packages/0",
    unresolved_blocker_id: null,
  };
}

function readyConfigureModel(packet) {
  Object.assign(packet.model_policy, {
    mode: "PINNED",
    provider: "approved-provider",
    model: "approved-model",
    model_version: "2026-08-29",
    prompt_digest: digest("approved prompt"),
    maximum_calls: 2,
  });
}

function readyConfigureTrustedVcs(packet) {
  packet.external_effects.mode = "TRUSTED_CONTROLLER_ONLY";
  packet.external_effects.effects = [{
    effect_id: "PUSH-BRANCH",
    effect_type: "PUSH_BRANCH",
    target: "The packet-bound feature branch",
    rationale: "Publish the controller-validated candidate tree.",
    controller_contract_ids: ["VCS-CONTROLLER-V1"],
  }];
  packet.external_effects.controller_contracts = [{
    contract_id: "VCS-CONTROLLER-V1",
    title: "Trusted VCS controller contract",
    path: "contracts/vcs/controller-v1.json",
    version: "1",
    revision: packet.curve_binding.curve_revision,
    content_digest: digest("placeholder"),
    status: "APPROVED",
    approval_binding: readyUnresolvedState(),
  }];
}

function readyConfigureNetwork(packet) {
  packet.sandbox_policy.network_mode = "ALLOWLIST";
  packet.sandbox_policy.network_policy_decision_id = "D-008";
  packet.sandbox_policy.network_destinations = [{
    destination_id: "GITHUB-API",
    kind: "HOST",
    scheme: "HTTPS",
    host: "api.github.com",
    port: 443,
    path_prefix: "/",
    allowed_cidrs: ["192.0.2.0/24", "2001:db8::/32"],
    purpose: "Synthetic allowlisted metadata endpoint.",
  }];
}

function makeReadyHarnessV1({
  targetRevision = READY_TARGET_REVISION,
  curveRevision = READY_CURVE_REVISION,
  decisionIds = [],
  dependencyIds = [],
  modelPinned = false,
  trustedVcs = false,
  networkAllowlist = false,
  userFacing = true,
} = {}) {
  const packet = cloneBlocked();
  const harness = {
    packet,
    evidence: new Map(),
    targetRevision,
    stateRecords: new Map(),
    sourceCatalog: null,
    contextManifest: null,
  };

  packet.status = "READY";
  packet.size = "M";
  packet.user_facing = userFacing;
  packet.blockers = [];
  packet.decomposition = null;
  packet.curve_binding.curve_revision = curveRevision;
  packet.repository = {
    url: READY_TARGET_URL,
    target_branch: "preview",
    base_sha: targetRevision,
    feature_branch: "curve/m1-01b-initiative-shell",
    stale_base_policy: "REQUIRE_EXACT_REMOTE_TIP",
  };
  packet.project_tracking = {
    project_url: "https://github.com/users/faocampo/projects/2",
    project_number: 2,
    item_node_id: READY_PROJECT_ITEM_ID,
    work_package_id: packet.work_package_id,
    tracking_kind: "WORK_PACKAGE",
    status: "READY",
    visual_metadata_only: true,
  };

  for (const document of packet.curve_binding.governance_documents) {
    document.revision = curveRevision;
    document.status = "APPROVED";
    document.approval_binding = readyUnresolvedState();
  }
  for (const dependency of packet.dependencies) {
    dependency.satisfaction = "SATISFIED";
    dependency.state_binding = readyUnresolvedState();
  }
  for (const dependencyId of dependencyIds) {
    if (!packet.dependencies.some((entry) => entry.id === dependencyId)) {
      packet.dependencies.push(readyDependency(dependencyId));
    }
  }
  for (const decision of packet.decisions) {
    decision.status = "DECIDED";
    decision.state_binding = readyUnresolvedState();
  }
  for (const decisionId of decisionIds) {
    if (!packet.decisions.some((entry) => entry.decision_id === decisionId)) {
      packet.decisions.push(
        readyDecision(
          decisionId,
          readyDecisionScope(decisionId, networkAllowlist),
        ),
      );
    }
  }
  for (const entry of packet.contract_applicability) {
    if (entry.applicability !== "APPLICABLE") continue;
    entry.contract.revision = curveRevision;
    entry.contract.status = "APPROVED";
    entry.contract.approval_binding = readyUnresolvedState();
  }

  packet.commands = packet.commands.map((command) => ({
    ...command,
    availability: "AVAILABLE",
  }));
  packet.commands.find((command) => command.id === "CMD-SECURITY").argv = [
    "pnpm",
    "check",
  ];
  packet.commands.find((command) => command.id === "CMD-SECURITY").tool_id =
    "PNPM";
  packet.commands.push({
    id: "CMD-INSTALL",
    phase: "INSTALL",
    argv: [
      "pnpm",
      "install",
      "--frozen-lockfile",
      "--offline",
      "--ignore-scripts",
    ],
    working_directory: ".",
    timeout_seconds: 1200,
    availability: "AVAILABLE",
    tool_id: "PNPM",
    network_destination_ids: [],
    external_effect_ids: [],
  });

  for (const field of [
    "data_policy",
    "model_policy",
    "tool_policy",
    "sandbox_policy",
    "budget",
    "external_effects",
    "rollback",
  ]) {
    packet[field].status = "APPROVED";
    packet[field].state_binding = readyUnresolvedState();
  }
  packet.tool_policy.tools.find((tool) => tool.tool_id === "CODEQL").version =
    "2.23.0";
  Object.assign(packet.tool_policy.tools.find((tool) => tool.tool_id === "PNPM"), {
    executable_digest: digest(READY_PNPM_BYTES),
    version_probe: {
      argv: ["pnpm", "--version"],
      expected_output: "11.3.0",
      timeout_seconds: 5,
    },
  });
  Object.assign(packet.tool_policy.tools.find((tool) => tool.tool_id === "CODEQL"), {
    executable_digest: digest(READY_CODEQL_BYTES),
    version_probe: {
      argv: ["codeql", "version", "--format=terse"],
      expected_output: "2.23.0",
      timeout_seconds: 5,
    },
  });
  packet.sandbox_policy.max_attempts = 1;
  packet.sandbox_policy.max_active_attempts = 1;
  packet.sandbox_policy.runtime = "GVISOR_CONTAINER";
  packet.sandbox_policy.image_digest = `sha256:${"c".repeat(64)}`;
  packet.sandbox_policy.read_only_paths = [".git", "AGENTS.md"];
  packet.sandbox_policy.writable_paths = [
    "apps/web",
    "packages/services",
    "packages/shared-state",
  ];

  if (modelPinned) readyConfigureModel(packet);
  if (trustedVcs) readyConfigureTrustedVcs(packet);
  if (networkAllowlist) readyConfigureNetwork(packet);
  packet.ux_evidence = userFacing
    ? readyUnresolvedState("B-UX-EVIDENCE")
    : null;

  readyBindDirectEvidence(harness);
  readyBindStateEvidence(harness);
  readyBindContext(harness);
  readyBindCatalog(harness);
  harness.packet = sealCodingAgentTaskPacket(packet);
  return harness;
}

function readySeal(harness) {
  harness.packet = sealCodingAgentTaskPacket(harness.packet);
}

function readyResolver(harness) {
  return (reference) => {
    const contents = harness.evidence.get(readyEvidenceKey(reference));
    if (!contents) {
      throw new Error(`Synthetic evidence missing for ${readyEvidenceKey(reference)}`);
    }
    return Buffer.from(contents);
  };
}

function readyReplaceJsonEvidence(harness, reference, value) {
  const bytes = readyJsonBytes(value);
  reference.content_digest = digest(bytes);
  harness.evidence.set(readyEvidenceKey(reference), bytes);
}

function readyRefreshCatalog(harness) {
  harness.sourceCatalog.work_packages[0] =
    buildCodingAgentSourceCatalogProjection(harness.packet);
  readyReplaceJsonEvidence(
    harness,
    harness.packet.source_catalog_binding.evidence,
    harness.sourceCatalog,
  );
  readySeal(harness);
}

function readyUpdateStateRecord(harness, entry, mutate) {
  const reference = entry.binding.evidence;
  const record = structuredClone(harness.stateRecords.get(reference.path));
  mutate(record);
  harness.stateRecords.set(reference.path, record);
  readyReplaceJsonEvidence(harness, reference, record);
  readyRefreshCatalog(harness);
}

function readyRunGit(repository, args, input = undefined) {
  const result = spawnSync("git", ["-C", repository, ...args], {
    encoding: "utf8",
    input,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Curve Test",
      GIT_AUTHOR_EMAIL: "curve-test@example.invalid",
      GIT_COMMITTER_NAME: "Curve Test",
      GIT_COMMITTER_EMAIL: "curve-test@example.invalid",
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_TERMINAL_PROMPT: "0",
    },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed: ${result.stderr || result.stdout}`,
    );
  }
  return result.stdout.trim();
}

function readyTargetRepository() {
  const temporary = mkdtempSync(join(tmpdir(), "curve-packet-target-"));
  const repository = join(temporary, "plane");
  const bare = join(temporary, "origin.git");
  mkdirSync(repository);
  mkdirSync(bare);
  readyRunGit(repository, ["init", "-b", "preview"]);
  readyRunGit(bare, ["init", "--bare"]);
  writeFileSync(join(repository, "README.md"), "synthetic target\n");
  mkdirSync(join(repository, "apps", "web"), { recursive: true });
  writeFileSync(join(repository, "apps", "web", "package.json"), "{}\n");
  readyRunGit(repository, ["add", "."]);
  readyRunGit(repository, ["commit", "-m", "synthetic base"]);
  const baseSha = readyRunGit(repository, ["rev-parse", "HEAD"]);
  readyRunGit(repository, ["remote", "add", "origin", bare]);
  readyRunGit(repository, ["push", "-u", "origin", "preview"]);
  readyRunGit(repository, ["remote", "set-url", "origin", READY_TARGET_URL]);
  return { temporary, repository, bare, baseSha };
}

function readyCurveRepository(temporary) {
  const repository = join(temporary, "curve");
  const bare = join(temporary, "curve-origin.git");
  mkdirSync(repository);
  mkdirSync(bare);
  readyRunGit(repository, ["init", "-b", "main"]);
  readyRunGit(bare, ["init", "--bare"]);
  writeFileSync(join(repository, "README.md"), "synthetic Curve contracts\n");
  readyRunGit(repository, ["add", "."]);
  readyRunGit(repository, ["commit", "-m", "synthetic Curve baseline"]);
  const revision = readyRunGit(repository, ["rev-parse", "HEAD"]);
  readyRunGit(repository, ["remote", "add", "origin", bare]);
  readyRunGit(repository, ["push", "-u", "origin", "main"]);
  readyRunGit(repository, [
    "remote", "set-url", "origin", "https://github.com/faocampo/curve",
  ]);
  return { curveRepository: repository, curveRevision: revision };
}

function readyDispatchHarness() {
  const target = readyTargetRepository();
  const curve = readyCurveRepository(target.temporary);
  const toolDirectory = join(target.temporary, "tools");
  mkdirSync(toolDirectory);
  writeFileSync(join(toolDirectory, "pnpm"), READY_PNPM_BYTES);
  writeFileSync(join(toolDirectory, "codeql"), READY_CODEQL_BYTES);
  chmodSync(join(toolDirectory, "pnpm"), 0o755);
  chmodSync(join(toolDirectory, "codeql"), 0o755);
  const harness = makeReadyHarnessV1({
    targetRevision: target.baseSha,
    curveRevision: curve.curveRevision,
  });
  const liveTips = {
    preview: target.baseSha,
    main: curve.curveRevision,
  };
  return {
    ...harness,
    ...target,
    ...curve,
    resolveReference: readyResolver(harness),
    resolveProjectItem: createGitHubProjectItemResolver(readyProjectPayload()),
    liveTips,
    remoteTipController: createCodingAgentRemoteTipTestController(
      ({ repository_identity, branch }) => ({
        commit: liveTips[branch],
        repository_identity,
        branch,
        remote: "origin",
        observed_at: "2026-08-30T12:00:00Z",
        source: "GIT_LS_REMOTE",
      }),
      { now: Date.parse("2026-08-30T12:00:00Z") },
    ),
    resolveTool: createLocalCodingAgentToolResolver({
      path: toolDirectory,
      runVersionProbe: ({ executablePath, argv, spawnOptions }) => ({
        ...spawnSync(executablePath, argv.slice(1), spawnOptions),
        network_isolation: "TRUSTED_RUNNER_NETWORK_NONE",
      }),
    }),
    toolDirectory,
  };
}

function readyDispatchOptions(harness, overrides = {}) {
  return {
    resolveReference: harness.resolveReference ?? readyResolver(harness),
    targetRepositoryRoot: harness.repository,
    curveRepository: harness.curveRepository,
    resolveTool: harness.resolveTool,
    resolveProjectItem: harness.resolveProjectItem
      ?? createGitHubProjectItemResolver(readyProjectPayload()),
    ...overrides,
  };
}

function readyRepositoryPreflight(harness, repository = harness.repository) {
  return validateCodingAgentRepositoryPreflight(harness.packet, repository, {
    testOnlyRemoteTipController: harness.remoteTipController,
  });
}

function readyValidateDispatch(harness, overrides = {}) {
  return validateCodingAgentTaskPacketForDispatchWithTestControllers(
    harness.packet,
    readyDispatchOptions(harness, overrides),
    { remoteTipController: harness.remoteTipController },
  );
}

function readyValidateReadiness(harness, overrides = {}) {
  return validateCodingAgentTaskPacketForReadinessPreflightWithTestControllers(
    harness.packet,
    readyDispatchOptions(harness, overrides),
    { remoteTipController: harness.remoteTipController },
  );
}

test("migrated examples expose BLOCKED honestly and dispatch fails closed", () => {
  assert.equal(isSchemaValid(blockedFixture), true);
  assert.equal(blockedFixture.status, "BLOCKED");
  assert.ok(blockedFixture.blockers.length >= 1);
  assert.equal(isSchemaValid(invalidFixture), false);
  const sealed = sealCodingAgentTaskPacket(cloneBlocked());
  validateCodingAgentTaskPacketSemantics(sealed);
  assert.throws(
    () => validateCodingAgentTaskPacketForDispatch(sealed, {
      resolveReference: () => Buffer.from("unused"),
    }),
    /READY|dispatch/i,
  );
});

test("direct task-packet entry points enforce the closed JSON Schema", () => {
  const blocked = cloneBlocked();
  blocked.unexpected_privilege = { mode: "BYPASS" };
  sealCodingAgentTaskPacket(blocked);
  assert.equal(isSchemaValid(blocked), false);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(blocked),
    /closed JSON Schema|additional properties|unexpected_privilege/i,
  );
  assert.throws(
    () => validateCodingAgentTaskPacketForDispatch(blocked),
    /closed JSON Schema|additional properties|unexpected_privilege/i,
  );
  assert.throws(
    () => validateCodingAgentTaskPacketForReadinessPreflight(blocked),
    /closed JSON Schema|additional properties|unexpected_privilege/i,
  );

  const inheritedRequiredField = cloneBlocked();
  const inheritedStatus = inheritedRequiredField.status;
  delete inheritedRequiredField.status;
  Object.setPrototypeOf(inheritedRequiredField, { status: inheritedStatus });
  sealCodingAgentTaskPacket(inheritedRequiredField);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(inheritedRequiredField),
    /closed JSON Schema|required property 'status'|must have required property 'status'/i,
  );

  const nested = cloneBlocked();
  nested.repository.unexpected_privilege = { mode: "BYPASS" };
  sealCodingAgentTaskPacket(nested);
  let toolResolverCalls = 0;
  let projectResolverCalls = 0;
  const schemaFailure = /closed JSON Schema|additional properties|unexpected_privilege/i;
  assert.throws(
    () => validateCodingAgentRepositoryPreflight(
      nested,
      "/definitely/missing/target-repository",
    ),
    schemaFailure,
  );
  assert.throws(
    () => validateCodingAgentCurveRepositoryPreflight(
      nested,
      "/definitely/missing/curve-repository",
    ),
    schemaFailure,
  );
  assert.throws(
    () => validateCodingAgentRegistryFilesPreflight(
      [sealCodingAgentTaskPacket(cloneBlocked()), nested],
      [
        "/definitely/missing/valid-task-packet.json",
        "/definitely/missing/invalid-task-packet.json",
      ],
      "/definitely/missing/curve-repository",
    ),
    schemaFailure,
  );
  assert.throws(
    () => validateCodingAgentToolsPreflight(nested, () => {
      toolResolverCalls += 1;
      return null;
    }),
    schemaFailure,
  );
  assert.throws(
    () => validateCodingAgentProjectTracking(nested, () => {
      projectResolverCalls += 1;
      return null;
    }),
    schemaFailure,
  );
  assert.equal(toolResolverCalls, 0);
  assert.equal(projectResolverCalls, 0);

  const ready = readyDispatchHarness();
  try {
    ready.packet.unexpected_privilege = { mode: "BYPASS" };
    readySeal(ready);
    assert.throws(
      () => readyValidateReadiness(ready),
      /closed JSON Schema|additional properties|unexpected_privilege/i,
    );
    assert.throws(
      () => readyValidateDispatch(ready),
      /closed JSON Schema|additional properties|unexpected_privilege/i,
    );
  } finally {
    rmSync(ready.temporary, { recursive: true, force: true });
  }
});

test("a genuinely READY packet closes catalog, context, state, Project, and Git", () => {
  const harness = readyDispatchHarness();
  try {
    assert.equal(isSchemaValid(harness.packet), true);
    assert.equal(
      harness.packet.packet_digest,
      computeCodingAgentTaskPacketDigest(harness.packet),
    );
    validateCodingAgentTaskPacketSemantics(harness.packet);
    const evidence = validateCodingAgentTaskPacketEvidence(harness.packet, {
      resolveReference: harness.resolveReference,
    });
    assert.ok(evidence.referenceCount >= 20);
    readyRepositoryPreflight(harness);
    const readiness = readyValidateReadiness(harness);
    assert.equal(readiness.readiness_preflight_passed, true);
    assert.equal(
      readiness.state_authority_verification,
      "REQUIRED_BEFORE_IMPLEMENTATION",
    );
    assert.deepEqual(readiness.blockers, ["B-CODING-AUTHORITY-01"]);
    assert.equal(readiness.implementation_authority_granted, false);
    assert.doesNotThrow(() => readyValidateDispatch(harness));
    assert.throws(
      () => validateCodingAgentTaskPacketForDispatch(
        harness.packet,
        readyDispatchOptions(harness),
      ),
      /trusted external state-authority.*verifier.*approved and implemented/i,
    );
  } finally {
    rmSync(harness.temporary, { recursive: true, force: true });
  }
});

test("approval-subject canonicalization and state-binding inventory are complete", () => {
  assert.equal(
    computeCodingAgentApprovalSubjectDigest({ z: [3, 2], a: { y: 1, x: 2 } }),
    computeCodingAgentApprovalSubjectDigest({ a: { x: 2, y: 1 }, z: [3, 2] }),
  );
  const bindings = collectCodingAgentTaskPacketStateBindings(
    makeReadyHarnessV1().packet,
  );
  const types = new Set(bindings.map((entry) => entry.subjectType));
  for (const required of [
    "GOVERNANCE_DOCUMENT",
    "DEPENDENCY",
    "DECISION",
    "CONTRACT",
    "POLICY",
    "UX",
  ]) assert.ok(types.has(required), `missing ${required}`);
  assert.ok(bindings.every((entry) => entry.binding.resolution === "RESOLVED"));
});

test("source-catalog pointers and projections reject forged identity and fields", () => {
  const absent = makeReadyHarnessV1();
  absent.packet.source_catalog_binding.record_pointer = "/work_packages/99";
  readySeal(absent);
  assert.throws(() => validateCodingAgentTaskPacketEvidence(absent.packet, {
    resolveReference: readyResolver(absent),
  }), /catalog|pointer|work_packages/i);

  for (const mutate of [
    (record) => { record.user_facing = false; },
    (record) => { record.risk_tier = "HIGH"; },
    (record) => { record.repository.target_branch = "main"; },
    (record) => { record.commands[0].argv = ["pnpm", "forged"]; },
    (record) => { record.project_tracking.item_node_id = "PVTI_forgedItem"; },
  ]) {
    const harness = makeReadyHarnessV1();
    mutate(harness.sourceCatalog.work_packages[0]);
    readyReplaceJsonEvidence(
      harness,
      harness.packet.source_catalog_binding.evidence,
      harness.sourceCatalog,
    );
    readySeal(harness);
    assert.throws(() => validateCodingAgentTaskPacketEvidence(harness.packet, {
      resolveReference: readyResolver(harness),
    }), /source catalog|catalog.*mismatch|projection/i);
  }
});

test("source-catalog validation rejects a malformed non-selected sibling", () => {
  const harness = makeReadyHarnessV1();
  const sibling = structuredClone(harness.sourceCatalog.work_packages[0]);
  sibling.work_package_id = "M1-01C";
  sibling.packet_id = "CURVE-M1-01C";
  sibling.project_tracking.item_node_id = "PVTI_readySyntheticM101C";
  sibling.commands[0].argv = [];
  harness.sourceCatalog.work_packages.push(sibling);
  readyReplaceJsonEvidence(
    harness,
    harness.packet.source_catalog_binding.evidence,
    harness.sourceCatalog,
  );
  readySeal(harness);

  assert.equal(
    harness.packet.source_catalog_binding.record_pointer,
    "/work_packages/0",
    "the malformed sibling must remain non-selected",
  );
  assert.throws(
    () => validateCodingAgentTaskPacketEvidence(harness.packet, {
      resolveReference: readyResolver(harness),
    }),
    /source catalog work_packages\/1.*argv|work_packages\/1.*command/i,
  );
});

test("source-catalog validation rejects contradictory contract applicability in non-selected siblings", () => {
  for (const mutate of [
    (entry) => {
      entry.applicability = "APPLICABLE";
      entry.contract_id = null;
    },
    (entry) => {
      entry.applicability = "NOT_APPLICABLE";
      entry.contract_id = "FORGED-CONTRACT";
    },
    (entry) => {
      entry.applicability = "REQUIRED_UNRESOLVED";
      entry.contract_id = "FORGED-CONTRACT";
    },
  ]) {
    const harness = makeReadyHarnessV1();
    const sibling = structuredClone(harness.sourceCatalog.work_packages[0]);
    sibling.work_package_id = "M1-01C";
    sibling.packet_id = "CURVE-M1-01C";
    sibling.project_tracking.item_node_id = "PVTI_readySyntheticM101C";
    mutate(sibling.contract_applicability[0]);
    harness.sourceCatalog.work_packages.push(sibling);
    readyReplaceJsonEvidence(
      harness,
      harness.packet.source_catalog_binding.evidence,
      harness.sourceCatalog,
    );
    readySeal(harness);

    assert.equal(
      harness.packet.source_catalog_binding.record_pointer,
      "/work_packages/0",
      "the contradictory sibling must remain non-selected",
    );
    assert.throws(
      () => validateCodingAgentTaskPacketEvidence(harness.packet, {
        resolveReference: readyResolver(harness),
      }),
      /source catalog work_packages\/1.*contract applicability.*contract_id/i,
    );
  }
});

test("source-catalog digest binds dispatch-critical fields beyond the readable projection", () => {
  for (const mutate of [
    (packet) => { packet.budget.maximum_compute_minutes += 1; },
    (packet) => { packet.sandbox_policy.duration_seconds += 1; },
    (packet) => { packet.data_policy.allowed_data.push("Another synthetic input."); },
    (packet) => { packet.repository.feature_branch = "curve/forged-feature"; },
  ]) {
    const harness = makeReadyHarnessV1();
    mutate(harness.packet);
    readySeal(harness);
    assert.throws(
      () => validateCodingAgentTaskPacketEvidence(harness.packet, {
        resolveReference: readyResolver(harness),
      }),
      /source catalog|projection/i,
    );
  }
});

test("implementation-authorization binding preserves readiness-authority separation and tenant identity", () => {
  const packet = makeReadyHarnessV1().packet;
  const binding = buildCodingAgentImplementationAuthorizationBinding(packet);
  assert.equal(binding.workspace_id, packet.workspace_id);
  assert.doesNotThrow(() =>
    validateCodingAgentImplementationAuthorizationBinding(packet, binding));
  assert.throws(
    () => validateCodingAgentImplementationAuthorizationBinding(packet, {
      ...binding,
      workspace_id: "20000000-0000-4000-8000-000000000002",
    }),
    /workspace|authorization|bind/i,
  );
});

test("state evidence rejects forged subject, assertion, approval subject, and attestation", () => {
  for (const [mutationKind, mutate] of [
    ["record", (record) => { record.subject_id = "FORGED-SUBJECT"; }],
    ["record", (record) => { record.approval_subject = { forged: true }; }],
    ["record", (record) => {
      record.attestations[0].subject_digest = digest("forged attestation");
    }],
  ]) {
    const harness = makeReadyHarnessV1();
    const [entry] = collectCodingAgentTaskPacketStateBindings(harness.packet);
    assert.equal(mutationKind, "record");
    readyUpdateStateRecord(harness, entry, mutate);
    assert.throws(() => validateCodingAgentTaskPacketEvidence(harness.packet, {
      resolveReference: readyResolver(harness),
    }), /subject|assertion|attestation|digest/i);
  }

  const assertion = makeReadyHarnessV1();
  const [entry] = collectCodingAgentTaskPacketStateBindings(assertion.packet);
  entry.binding.assertions[0].expected = "FORGED-TYPE";
  readyRefreshCatalog(assertion);
  assert.throws(() => validateCodingAgentTaskPacketEvidence(assertion.packet, {
    resolveReference: readyResolver(assertion),
  }), /assertion/i);
});

test("state authority is tenant-bound, role-scoped, resolvable, and human for material approval", () => {
  for (const [mutate, expected] of [
    [(record) => { record.workspace_id = "20000000-0000-4000-8000-000000000002"; }, /workspace/i],
    [(record) => {
      record.attestations[0].workspace_id = "20000000-0000-4000-8000-000000000002";
    }, /workspace/i],
    [(record) => { record.attestations[0].actor_role = "CODE_APPROVER"; }, /role|attest/i],
    [(record) => {
      record.attestations[0].authority_scope = ["STATE:FORGED:SCOPE:APPROVED"];
    }, /scope/i],
    [(record) => {
      record.attestations[0].authority_source.path = "contracts/authority/missing.json";
    }, /authority source|missing|evidence/i],
    [(record) => {
      record.attestations[0].actor_type = "SYSTEM";
      record.attestations[0].actor_role = "SYSTEM_DERIVER";
      record.attestations[0].authority_source.source_type = "SYSTEM_DERIVATION_CONTRACT";
      record.attestations[0].derivation = {
        contract_id: record.attestations[0].authority_source.source_id,
        contract_digest: record.attestations[0].authority_source.content_digest,
        input_digest: digest("forged"),
      };
    }, /SYSTEM|HUMAN|machine-derived/i],
  ]) {
    const harness = makeReadyHarnessV1();
    const [entry] = collectCodingAgentTaskPacketStateBindings(harness.packet);
    readyUpdateStateRecord(harness, entry, mutate);
    assert.throws(
      () => validateCodingAgentTaskPacketEvidence(harness.packet, {
        resolveReference: readyResolver(harness),
      }),
      expected,
    );
  }
});

test("context manifests reject changed entry bytes and a stale aggregate digest", () => {
  const entryMismatch = makeReadyHarnessV1();
  const [firstEntry] = entryMismatch.contextManifest.entries;
  entryMismatch.evidence.set(
    readyEvidenceKey(firstEntry),
    Buffer.from("tampered entry\n"),
  );
  assert.throws(() => validateCodingAgentTaskPacketEvidence(
    entryMismatch.packet,
    { resolveReference: readyResolver(entryMismatch) },
  ), /context|digest mismatch/i);

  const aggregate = makeReadyHarnessV1();
  const [aggregateEntry] = aggregate.contextManifest.entries;
  const altered = Buffer.from("rebound entry with stale aggregate\n");
  aggregate.evidence.set(readyEvidenceKey(aggregateEntry), altered);
  aggregateEntry.content_digest = digest(altered);
  readyReplaceJsonEvidence(
    aggregate,
    aggregate.packet.curve_binding.context_pack.manifest,
    aggregate.contextManifest,
  );
  readyRefreshCatalog(aggregate);
  assert.throws(() => validateCodingAgentTaskPacketEvidence(aggregate.packet, {
    resolveReference: readyResolver(aggregate),
  }), /context.*digest|aggregate/i);

  const tenant = makeReadyHarnessV1();
  tenant.contextManifest.workspace_id = "20000000-0000-4000-8000-000000000002";
  readyReplaceJsonEvidence(
    tenant,
    tenant.packet.curve_binding.context_pack.manifest,
    tenant.contextManifest,
  );
  readyRefreshCatalog(tenant);
  assert.throws(() => validateCodingAgentTaskPacketEvidence(tenant.packet, {
    resolveReference: readyResolver(tenant),
  }), /context.*workspace|workspace.*packet/i);

  const collision = makeReadyHarnessV1();
  const manifestReference = collision.packet.curve_binding.context_pack.manifest;
  Object.assign(collision.packet.curve_binding.governance_documents[0], {
    repository: manifestReference.repository,
    title: manifestReference.title,
    path: manifestReference.path,
    revision: manifestReference.revision,
    content_digest: manifestReference.content_digest,
  });
  readyRefreshCatalog(collision);
  assert.throws(() => validateCodingAgentTaskPacketEvidence(collision.packet, {
    resolveReference: readyResolver(collision),
  }), /multiple Curve publication roles|reuses evidence/i);
});

test("mandatory command phases coexist with structured optional commands", () => {
  const harness = makeReadyHarnessV1();
  assert.ok(harness.packet.commands.some((command) => command.phase === "INSTALL"));
  validateCodingAgentTaskPacketSemantics(harness.packet);
  harness.packet.commands = harness.packet.commands.filter(
    (command) => command.phase !== "INSTALL",
  );
  readyRefreshCatalog(harness);
  assert.equal(isSchemaValid(harness.packet), true);
  validateCodingAgentTaskPacketSemantics(harness.packet);

  const missing = makeReadyHarnessV1();
  missing.packet.commands = missing.packet.commands.filter(
    (command) => command.phase !== "SECURITY",
  );
  readySeal(missing);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(missing.packet),
    /SECURITY|mandatory.*phase/i,
  );
});

test("argv binds the approved executable and excludes shell interpretation", () => {
  const executable = makeReadyHarnessV1();
  executable.packet.commands[0].argv[0] = "node";
  readySeal(executable);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(executable.packet),
    /executable|argv|tool/i,
  );

  for (const argv of [
    ["pnpm", "check && echo forged"],
    ["sh", "-c", "pnpm check"],
    ["pnpm", "check", ";", "echo", "forged"],
  ]) {
    const shell = makeReadyHarnessV1();
    shell.packet.commands[0].argv = argv;
    readySeal(shell);
    assert.throws(
      () => validateCodingAgentTaskPacketSemantics(shell.packet),
      /shell|operator|argv|executable/i,
    );
  }
});

test("structured command classification blocks direct VCS, network, deployment, and provider mutation", () => {
  const cases = [
    ["git", ["git", "push", "origin", "feature"]],
    ["git", ["git", "commit", "-m", "forbidden"]],
    ["git", ["git", "merge", "main"]],
    ["git", ["git", "rebase", "main"]],
    ["git", ["git", "reset", "--hard", "HEAD"]],
    ["gh", ["gh", "pr", "create"]],
    ["curl", ["curl", "https://example.invalid"]],
    ["wget", ["wget", "https://example.invalid"]],
    ["ssh", ["ssh", "example.invalid"]],
    ["kubectl", ["kubectl", "apply", "-f", "manifest.yaml"]],
    ["helm", ["helm", "upgrade", "curve", "chart"]],
    ["aws", ["aws", "s3", "cp", "artifact", "s3://bucket/key"]],
    ["slack", ["slack", "chat", "send", "message"]],
    ["openhands", ["openhands", "run"]],
  ];
  for (const [executable, argv] of cases) {
    const harness = makeReadyHarnessV1();
    const command = harness.packet.commands.find((candidate) => candidate.id === "CMD-LINT");
    const tool = harness.packet.tool_policy.tools.find((candidate) => candidate.tool_id === "PNPM");
    command.argv = argv;
    tool.executable = executable;
    tool.version = "1.0.0";
    tool.version_probe = {
      argv: [executable, "--version"],
      expected_output: "1.0.0",
      timeout_seconds: 5,
    };
    readySeal(harness);
    assert.ok(classifyCodingAgentCommand(command, tool).prohibited_reason);
    assert.throws(
      () => validateCodingAgentTaskPacketSemantics(harness.packet),
      /prohibited|mutation|network|provider|deployment|VCS|Git|tool.*kind|recognized/i,
      executable,
    );
  }

  const onlineInstall = makeReadyHarnessV1();
  onlineInstall.packet.commands.find((command) => command.id === "CMD-INSTALL").argv = [
    "pnpm", "install", "--frozen-lockfile",
  ];
  readySeal(onlineInstall);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(onlineInstall.packet),
    /network-capable|network destination|only exact/i,
  );
});

test("recognized command grammars reject aliases, dynamic execution, release scripts, inline eval, and host-dangerous containers", () => {
  const cases = [
    ["GIT_READ_ONLY", "git", ["git", "-c", "alias.audit=!sh", "audit"]],
    ["GIT_READ_ONLY", "git", ["git", "--exec-path=/tmp/forged", "status"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "forged-alias"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "LoG", "HEAD"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "STATUS"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "grep", "--open-files-in-pager=sh", "pattern"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "grep", "--open-files-in-pager", "sh", "pattern"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "diff", "--ext-diff", "HEAD"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "show", "--textconv", "HEAD:file"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "diff", "--no-index", "left", "right"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "show", "--output=/tmp/forged", "HEAD"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "show", "--output", "/tmp/forged", "HEAD"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "grep", "-f", "/tmp/patterns"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "log", "--show-signature", "HEAD"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "cat-file", "--filters", "HEAD:file"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "ls-files", "--exclude-from=/tmp/patterns"]],
    ["GIT_READ_ONLY", "git", ["git", "--no-pager", "status", "--pathspec-from-file=/tmp/paths"]],
    ["GH_READ_ONLY", "gh", ["gh", "project", "item-edit"]],
    ["GH_READ_ONLY", "gh", ["gh", "repo", "view", "--web"]],
    ["GH_READ_ONLY", "gh", ["gh", "pr", "view", "123", "--repo", "other/private"]],
    ["GH_READ_ONLY", "gh", ["gh", "PR", "view", "123"]],
    ["PNPM_PACKAGE_MANAGER", "pnpm", ["pnpm", "exec", "node", "tool.js"]],
    ["NPM_PACKAGE_MANAGER", "npm", ["npm", "exec", "node", "tool.js"]],
    ["YARN_PACKAGE_MANAGER", "yarn", ["yarn", "exec", "node", "tool.js"]],
    ["PNPM_PACKAGE_MANAGER", "pnpm", ["pnpm", "run", "TeSt"]],
    ["NPM_PACKAGE_MANAGER", "npm", ["npm", "TEST"]],
    ["NPM_PACKAGE_MANAGER", "npm", ["npm", "test", "--help"]],
    ["PNPM_PACKAGE_MANAGER", "pnpm", ["pnpm", "test", "--help"]],
    ["NPM_PACKAGE_MANAGER", "npm", ["npm", "test", "--script-shell=/tmp/helper"]],
    ["NPM_PACKAGE_MANAGER", "npm", ["npm", "run", "test", "--if-present"]],
    ["PNPM_PACKAGE_MANAGER", "pnpm", ["pnpm", "install", "--frozen-lockfile", "--offline"]],
    ["PNPM_PACKAGE_MANAGER", "pnpm", ["pnpm", "--filter=web", "install", "--frozen-lockfile", "--offline", "--ignore-scripts"]],
    ["PNPM_PACKAGE_MANAGER", "pnpm", ["pnpm", "run", "deploy"]],
    ["NPM_PACKAGE_MANAGER", "npm", ["npm", "run", "publish"]],
    ["YARN_PACKAGE_MANAGER", "yarn", ["yarn", "release"]],
    ["NODE_RUNTIME", "node", ["node", "-e", "process.exit(0)"]],
    ["NODE_RUNTIME", "node", ["node", "--check", "--import=data:text/javascript,console.log%28%22EXEC%22%29"]],
    ["NODE_RUNTIME", "node", ["node", "--check", "--require=./payload.js"]],
    ["PYTHON_RUNTIME", "python", ["python", "-c", "print('forged')"]],
    ["PYTHON_RUNTIME", "python", ["python", "-m", "compileall", "-q", "."]],
    ["CODEQL_ANALYZER", "codeql", ["codeql", "database", "analyze", "curve-db", "curve-suite.qls"]],
    ["DOCKER_LOCAL", "docker", ["docker", "run", "--privileged", "image"]],
    ["DOCKER_LOCAL", "docker", ["docker", "run", "--network=host", "image"]],
    ["DOCKER_LOCAL", "docker", ["docker", "run", "-v", "/var/run/docker.sock:/sock", "image"]],
    ["DOCKER_LOCAL", "docker", ["docker", "run", "--device=/dev/kvm", "image"]],
    ["DOCKER_LOCAL", "docker", ["docker", "compose", "config", "--resolve-image-digests"]],
    ["DOCKER_LOCAL", "docker", ["docker", "compose", "config", "--output", "/tmp/compose.yaml"]],
  ];
  for (const [toolKind, executable, argv] of cases) {
    const harness = makeReadyHarnessV1();
    const command = harness.packet.commands.find((candidate) => candidate.id === "CMD-LINT");
    const tool = harness.packet.tool_policy.tools.find((candidate) => candidate.tool_id === "PNPM");
    command.argv = argv;
    Object.assign(tool, {
      tool_kind: toolKind,
      executable,
      launcher_mode: "REGULAR_FILE_ONLY",
      canonical_executable_name: executable,
      version: "1.0.0",
      version_probe: {
        argv: [executable, "--version"],
        expected_output: "1.0.0",
        timeout_seconds: 5,
      },
    });
    readySeal(harness);
    assert.ok(
      classifyCodingAgentCommand(command, tool).prohibited_reason,
      `${toolKind} ${argv.join(" ")} unexpectedly classified as safe`,
    );
    assert.throws(
      () => validateCodingAgentTaskPacketSemantics(harness.packet),
      /recognized|prohibited|outside|host|privilege|tool kind|dispatch.safe|requires|only exact|selectors/i,
    );
  }

  const preferOffline = makeReadyHarnessV1();
  preferOffline.packet.commands.find((command) => command.id === "CMD-INSTALL").argv = [
    "pnpm", "install", "--frozen-lockfile", "--prefer-offline",
  ];
  readySeal(preferOffline);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(preferOffline.packet),
    /network.capable|exact --offline|unrecognized install|only exact/i,
  );
});

test("package-manager execution uses exact argv and a sealed no-credential gVisor boundary", () => {
  const tool = { tool_kind: "PNPM_PACKAGE_MANAGER", executable: "pnpm" };
  const safeCommands = [
    ["pnpm", "check"],
    ["pnpm", "--filter=web", "test", "--", "initiative-shell"],
    [
      "pnpm",
      "install",
      "--frozen-lockfile",
      "--offline",
      "--ignore-scripts",
    ],
  ];
  for (const argv of safeCommands) {
    const classification = classifyCodingAgentCommand({ id: "SAFE-PNPM", argv }, tool);
    assert.equal(classification.prohibited_reason, null, argv.join(" "));
    assert.equal(classification.sandboxed_repository_code, true, argv.join(" "));
  }

  const localWorktree = makeReadyHarnessV1();
  localWorktree.packet.sandbox_policy.runtime = "LOCAL_WORKTREE";
  localWorktree.packet.sandbox_policy.image_digest = null;
  readySeal(localWorktree);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(localWorktree.packet),
    /repository code.*gVisor|gVisor.*repository code/i,
  );
});

test("GIT_READ_ONLY uses a closed argv grammar for every retained inspection subcommand", () => {
  const tool = { tool_kind: "GIT_READ_ONLY", executable: "git" };
  const safeCommands = [
    ["git", "--no-pager", "cat-file", "-p", "HEAD"],
    ["git", "--no-pager", "diff", "--no-ext-diff", "--no-textconv", "--ignore-submodules=all", "--stat", "HEAD^", "HEAD"],
    ["git", "--no-pager", "diff-tree", "--no-ext-diff", "--no-textconv", "--ignore-submodules=all", "-r", "--no-commit-id", "HEAD"],
    ["git", "--no-pager", "for-each-ref", "--count=5", "--format=%(refname)", "refs/heads"],
    ["git", "--no-pager", "grep", "-n", "TODO", "--", "src"],
    ["git", "--no-pager", "log", "--no-ext-diff", "--no-textconv", "--no-show-signature", "--no-use-mailmap", "--ignore-submodules=all", "-n5", "--oneline", "HEAD"],
    ["git", "--no-pager", "ls-files", "--cached", "--", "src"],
    ["git", "--no-pager", "ls-tree", "-r", "--name-only", "HEAD"],
    ["git", "--no-pager", "merge-base", "--is-ancestor", "HEAD^", "HEAD"],
    ["git", "--no-pager", "rev-list", "--count", "HEAD"],
    ["git", "--no-pager", "rev-parse", "--verify", "HEAD^{commit}"],
    ["git", "--no-pager", "show", "--no-ext-diff", "--no-textconv", "--no-show-signature", "--no-use-mailmap", "--ignore-submodules=all", "--stat", "--no-color", "HEAD"],
    ["git", "--no-pager", "show-ref", "--verify", "refs/heads/main"],
    ["git", "--no-pager", "status", "--ignore-submodules=all", "--porcelain=v1", "--untracked-files=all"],
  ];
  for (const argv of safeCommands) {
    assert.equal(
      classifyCodingAgentCommand({ id: `SAFE-${argv[2]}`, argv }, tool)
        .prohibited_reason,
      null,
      `${argv.join(" ")} should remain inside the closed read-only grammar`,
    );
  }

  for (const argv of [
    ["git", "--no-pager", "grep", "--open-files-in-pager=sh", "pattern"],
    ["git", "--no-pager", "diff", "--ext-diff", "HEAD"],
    ["git", "--no-pager", "show", "--textconv", "HEAD:file"],
    ["git", "--no-pager", "diff", "--no-index", "left", "right"],
    ["git", "--no-pager", "show", "--output=/tmp/forged", "HEAD"],
    ["git", "log", "HEAD"],
    ["git", "--no-pager", "log", "--no-ext-diff", "HEAD"],
    ["git", "--no-pager", "log", "--no-ext-diff", "--no-textconv", "HEAD"],
    ["git", "--no-pager", "show", "--no-ext-diff", "--no-textconv", "--no-show-signature", "HEAD"],
    ["git", "--no-pager", "diff", "--no-ext-diff", "--no-textconv", "HEAD"],
    ["git", "--no-pager", "diff", "--no-ext-diff", "--no-textconv", "--ignore-submodules=all", "--submodule=diff", "HEAD"],
    ["git", "--no-pager", "for-each-ref", "--format=%(signature:grade)"],
  ]) {
    assert.match(
      classifyCodingAgentCommand({ id: `REJECT-${argv[2] ?? argv[1]}`, argv }, tool)
        .prohibited_reason,
      /closed read-only grammar|unsafe|repository-local read boundary|no-pager|requires exact/i,
    );
  }
});

test("trusted tool proof rejects missing, shadowed, substituted, and version-mismatched executables", () => {
  const harness = readyDispatchHarness();
  try {
    assert.equal(validateCodingAgentToolsPreflight(
      harness.packet,
      harness.resolveTool,
    ).length, 1);

    assert.throws(
      () => validateCodingAgentToolsPreflight(harness.packet, (tool) => ({
        ...harness.resolveTool(tool),
        launcher_path: join(harness.temporary, "missing", tool.executable),
      })),
      /missing|executable|ENOENT/i,
    );

    assert.throws(
      () => validateCodingAgentToolsPreflight(harness.packet, (tool) => ({
        ...harness.resolveTool(tool),
        version_output: `${tool.version}-forged`,
      })),
      /version/i,
    );

    const shadowDirectory = join(harness.temporary, "shadow-tools");
    mkdirSync(shadowDirectory);
    const substitutedBytes = Buffer.from("#!/bin/sh\nprintf '11.3.0\\n'\n# substituted\n");
    const substitutedPath = join(shadowDirectory, "pnpm");
    writeFileSync(substitutedPath, substitutedBytes);
    chmodSync(substitutedPath, 0o755);
    assert.throws(
      () => validateCodingAgentToolsPreflight(harness.packet, (tool) => {
        if (tool.tool_id !== "PNPM") return harness.resolveTool(tool);
        return {
          ...harness.resolveTool(tool),
          launcher_path: substitutedPath,
          canonical_executable_path: substitutedPath,
          canonical_executable_name: "pnpm",
          launcher_mode: "REGULAR_FILE_ONLY",
          path_candidates: [{
            launcher_path: substitutedPath,
            canonical_executable_path: substitutedPath,
            canonical_executable_name: "pnpm",
            launcher_mode: "REGULAR_FILE_ONLY",
          }],
          content_digest: digest(substitutedBytes),
        };
      }),
      /digest|approved binding|canonical filesystem identity/i,
    );

    const shadowResolver = createLocalCodingAgentToolResolver({
      path: `${shadowDirectory}:${harness.toolDirectory}`,
    });
    assert.throws(
      () => shadowResolver(
        harness.packet.tool_policy.tools.find((tool) => tool.tool_id === "PNPM"),
      ),
      /shadowed|PATH candidates/i,
    );
  } finally {
    rmSync(harness.temporary, { recursive: true, force: true });
  }
});

test("canonical tool identity rejects symlink and alias substitutions unless the exact launcher mode and target name are approved", () => {
  const harness = readyDispatchHarness();
  const aliasDirectory = join(harness.temporary, "alias-only");
  mkdirSync(aliasDirectory);
  const canonicalAliasTarget = join(aliasDirectory, "pnpm-canonical");
  writeFileSync(canonicalAliasTarget, READY_PNPM_BYTES);
  chmodSync(canonicalAliasTarget, 0o755);
  symlinkSync(canonicalAliasTarget, join(aliasDirectory, "pnpm"));
  const resolver = createLocalCodingAgentToolResolver({
    path: aliasDirectory,
    runVersionProbe: ({ executablePath, argv, spawnOptions }) => ({
      ...spawnSync(executablePath, argv.slice(1), spawnOptions),
      network_isolation: "TRUSTED_RUNNER_NETWORK_NONE",
    }),
  });
  try {
    const packet = structuredClone(harness.packet);
    packet.commands = packet.commands.filter((command) => command.tool_id === "PNPM");
    const tool = packet.tool_policy.tools.find((candidate) => candidate.tool_id === "PNPM");
    assert.throws(
      () => validateCodingAgentToolsPreflight(packet, resolver),
      /launcher|canonical executable identity|approved/i,
    );
    tool.launcher_mode = "SYMLINK_TO_CANONICAL";
    tool.canonical_executable_name = "pnpm-canonical";
    assert.equal(validateCodingAgentToolsPreflight(packet, resolver).length, 1);
    tool.canonical_executable_name = "pnpm";
    assert.throws(
      () => validateCodingAgentToolsPreflight(packet, resolver),
      /canonical executable identity|approved/i,
    );
  } finally {
    rmSync(harness.temporary, { recursive: true, force: true });
  }
});

test("PINNED models require D-004, D-005, D-014, and M0-S9C", () => {
  for (const [missing, decisions, dependencies] of [
    ["D-004", ["D-005", "D-014"], ["M0-S9C"]],
    ["D-005", ["D-004", "D-014"], ["M0-S9C"]],
    ["D-014", ["D-004", "D-005"], ["M0-S9C"]],
    ["M0-S9C", ["D-004", "D-005", "D-014"], []],
  ]) {
    const harness = makeReadyHarnessV1({
      modelPinned: true,
      decisionIds: decisions,
      dependencyIds: dependencies,
    });
    assert.throws(
      () => validateCodingAgentTaskPacketSemantics(harness.packet),
      new RegExp(missing.replace("-", "[- ]?"), "i"),
    );
  }
  validateCodingAgentTaskPacketSemantics(makeReadyHarnessV1({
    modelPinned: true,
    decisionIds: ["D-004", "D-005", "D-014"],
    dependencyIds: ["M0-S9C"],
  }).packet);
});

test("trusted VCS effects require D-008 and P0-10", () => {
  assert.throws(() => validateCodingAgentTaskPacketSemantics(
    makeReadyHarnessV1({ trustedVcs: true, dependencyIds: ["P0-10"] }).packet,
  ), /D-008/i);
  assert.throws(() => validateCodingAgentTaskPacketSemantics(
    makeReadyHarnessV1({ trustedVcs: true, decisionIds: ["D-008"] }).packet,
  ), /P0-10/i);
  validateCodingAgentTaskPacketSemantics(makeReadyHarnessV1({
    trustedVcs: true,
    decisionIds: ["D-008"],
    dependencyIds: ["P0-10"],
  }).packet);
});

test("sandbox path containment, active-attempt limit, and CIDR bounds fail closed", () => {
  const overlap = makeReadyHarnessV1();
  overlap.packet.sandbox_policy.writable_paths.push(".git/hooks");
  readySeal(overlap);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(overlap.packet),
    /read.only|writable|overlap|contain/i,
  );

  const attempts = makeReadyHarnessV1();
  attempts.packet.sandbox_policy.max_active_attempts = 2;
  assertSchemaInvalid(attempts.packet, "two active attempts");

  for (const invalidCidr of [
    "192.0.2.0/33",
    "999.0.0.0/24",
    "2001:db8::/129",
  ]) {
    const network = makeReadyHarnessV1({
      networkAllowlist: true,
      decisionIds: ["D-008"],
    });
    network.packet.sandbox_policy.network_destinations[0].allowed_cidrs = [
      invalidCidr,
    ];
    readySeal(network);
    assert.throws(
      () => validateCodingAgentTaskPacketSemantics(network.packet),
      /CIDR|prefix|address/i,
    );
  }
});

test("Project resolver rejects PR evidence and marker mismatch but permits status drift", () => {
  const harness = readyDispatchHarness();
  try {
    assert.throws(() => readyValidateDispatch(harness, {
        resolveProjectItem: createGitHubProjectItemResolver(
          readyProjectPayload({ contentType: "PullRequest" }),
        ),
      }), /Project|WORK_PACKAGE|PullRequest|Issue/i);

    assert.throws(() => readyValidateDispatch(harness, {
        resolveProjectItem: createGitHubProjectItemResolver(
          readyProjectPayload({ title: "Unrelated", body: "No marker." }),
        ),
      }), /M1-01B|marker|work.package/i);

    assert.doesNotThrow(() => readyValidateDispatch(harness, {
        resolveProjectItem: createGitHubProjectItemResolver(
          readyProjectPayload({ status: "Done" }),
        ),
      }));
  } finally {
    rmSync(harness.temporary, { recursive: true, force: true });
  }
});

test("repository preflight enforces remote, exact HEAD, clean state, and stale policy", () => {
  const harness = readyDispatchHarness();
  try {
    assert.throws(
      () => validateCodingAgentRepositoryPreflight(
        harness.packet,
        harness.repository,
        { testOnlyRemoteTipController: () => ({}) },
      ),
      /tagged test-only controller|test seam/i,
    );
    readyRepositoryPreflight(harness);
    readyRunGit(harness.repository, [
      "remote", "set-url", "origin", "git@github.com:someone-else/plane.git",
    ]);
    assert.throws(
      () => readyRepositoryPreflight(harness),
      /origin|remote|does not match packet repository/i,
    );
    readyRunGit(harness.repository, [
      "remote", "set-url", "origin", READY_TARGET_URL,
    ]);

    writeFileSync(join(harness.repository, "dirty.txt"), "dirty\n");
    assert.throws(
      () => readyRepositoryPreflight(harness),
      /clean|dirty|untracked/i,
    );
    rmSync(join(harness.repository, "dirty.txt"));

    const tree = readyRunGit(harness.repository, [
      "rev-parse", `${harness.baseSha}^{tree}`,
    ]);
    const next = readyRunGit(harness.repository, [
      "commit-tree", tree, "-p", harness.baseSha, "-m", "remote next",
    ]);
    readyRunGit(harness.repository, [
      "update-ref", "refs/remotes/origin/preview", next,
    ]);
    assert.doesNotThrow(
      () => readyRepositoryPreflight(harness),
      "a stale remote-tracking cache must not override the trusted live tip",
    );
    harness.liveTips.preview = next;
    assert.throws(
      () => readyRepositoryPreflight(harness),
      /stale|remote tip|exact/i,
    );
    harness.packet.repository.stale_base_policy = "ALLOW_ANCESTOR";
    readySeal(harness);
    readyRepositoryPreflight(harness);
    readyRunGit(harness.repository, ["switch", "--detach", next]);
    assert.throws(
      () => readyRepositoryPreflight(harness),
      /HEAD|base/i,
    );
  } finally {
    rmSync(harness.temporary, { recursive: true, force: true });
  }
});

test("remote-tip trust accepts only fresh exact GIT_LS_REMOTE observations for the bound repository", () => {
  const harness = readyDispatchHarness();
  const baseObservation = {
    commit: harness.baseSha,
    repository_identity: "github.com/faocampo/plane",
    branch: "preview",
    remote: "origin",
    observed_at: "2026-08-30T12:00:00Z",
    source: "GIT_LS_REMOTE",
  };
  const cases = [
    [() => harness.baseSha, /object|observation|properties/i],
    [() => ({ ...baseObservation, observed_at: null }), /timestamp|properties/i],
    [() => ({ ...baseObservation, observed_at: "2026-08-30T11:00:00Z" }), /stale/i],
    [() => ({ ...baseObservation, repository_identity: "github.com/other/repo" }), /another repository/i],
    [() => ({ ...baseObservation, source: "SYNTHETIC_TRUST" }), /GIT_LS_REMOTE/i],
    [() => ({ ...baseObservation, remote: "upstream" }), /origin/i],
    [() => ({ ...baseObservation, branch: "main" }), /another branch/i],
  ];
  try {
    for (const [resolver, expected] of cases) {
      const controller = createCodingAgentRemoteTipTestController(
        resolver,
        { now: Date.parse("2026-08-30T12:00:00Z") },
      );
      assert.throws(
        () => validateCodingAgentRepositoryPreflight(
          harness.packet,
          harness.repository,
          { testOnlyRemoteTipController: controller },
        ),
        expected,
      );
    }

    let forgedPreflightCalled = false;
    assert.throws(
      () => validateCodingAgentTaskPacketForDispatch(harness.packet, {
        resolveReference: harness.resolveReference,
        resolveProjectItem: harness.resolveProjectItem,
        resolveTool: harness.resolveTool,
        repositoryPreflight: () => {
          forgedPreflightCalled = true;
          return { forged: true };
        },
      }),
      /production dispatch does not accept repositoryPreflight.*validated internally/i,
      "production dispatch must reject the removed blanket repositoryPreflight seam",
    );
    assert.equal(forgedPreflightCalled, false);
  } finally {
    rmSync(harness.temporary, { recursive: true, force: true });
  }
});

test("repository preflight rejects unknown and non-commit base objects", () => {
  const harness = readyDispatchHarness();
  try {
    harness.packet.repository.base_sha = "f".repeat(40);
    readySeal(harness);
    assert.throws(
      () => readyRepositoryPreflight(harness),
      /base|commit|revision|object/i,
    );
    harness.packet.repository.base_sha = readyRunGit(
      harness.repository,
      ["rev-parse", "HEAD^{tree}"],
    );
    readySeal(harness);
    assert.throws(
      () => readyRepositoryPreflight(harness),
      /commit|object type/i,
    );
  } finally {
    rmSync(harness.temporary, { recursive: true, force: true });
  }
});

test("Git trust rejects persistent alternates through normal and linked worktrees", () => {
  const harness = readyDispatchHarness();
  const linked = join(harness.temporary, "plane-linked");
  try {
    readyRunGit(harness.repository, [
      "worktree",
      "add",
      "--detach",
      linked,
      harness.baseSha,
    ]);
    readyRepositoryPreflight(harness, linked);

    for (const alternateKind of ["alternates", "http-alternates"]) {
      const alternatePath = readyRunGit(linked, [
        "rev-parse",
        "--path-format=absolute",
        "--git-path",
        `objects/info/${alternateKind}`,
      ]);
      mkdirSync(dirname(alternatePath), { recursive: true });
      const contents = alternateKind === "alternates"
        ? `${join(harness.curveRepository, ".git", "objects")}\n`
        : "https://example.invalid/objects\n";
      writeFileSync(alternatePath, contents);

      assert.throws(
        () => readyRepositoryPreflight(harness),
        new RegExp(`persistent Git object ${alternateKind}`, "i"),
      );
      assert.throws(
        () => readyRepositoryPreflight(harness, linked),
        new RegExp(`persistent Git object ${alternateKind}`, "i"),
      );
      assert.throws(
        () => createGitEvidenceResolver({ TARGET: harness.repository }),
        new RegExp(`persistent Git object ${alternateKind}`, "i"),
      );
      assert.throws(
        () => createGitEvidenceResolver({ TARGET: linked }),
        new RegExp(`persistent Git object ${alternateKind}`, "i"),
      );
      rmSync(alternatePath);
      readyRepositoryPreflight(harness, linked);
    }
  } finally {
    rmSync(harness.temporary, { recursive: true, force: true });
  }
});

test("Git trust rejects local command, include, credential, and transport overrides", () => {
  const harness = readyDispatchHarness();
  const unsafeConfiguration = [
    ["alias.status", "!false"],
    ["include.path", "/tmp/curve-untrusted-git-config"],
    ["credential.helper", "!false"],
    ["core.sshCommand", "false"],
    ["core.attributesFile", "/tmp/curve-untrusted-attributes"],
    ["core.excludesFile", "/tmp/curve-untrusted-excludes"],
    ["core.pager", "false"],
    ["diff.external", "false"],
    ["gpg.program", "/definitely/missing/curve-untrusted-gpg"],
    ["interactive.diffFilter", "false"],
    ["log.showSignature", "true"],
    ["log.mailmap", "true"],
    ["mailmap.file", "/tmp/curve-untrusted-mailmap"],
    ["pager.log", "false"],
    ["http.proxy", "http://127.0.0.1:9"],
    ["remote.origin.uploadpack", "false"],
  ];
  try {
    for (const [name, value] of unsafeConfiguration) {
      readyRunGit(harness.repository, ["config", "--local", name, value]);
      assert.throws(
        () => readyRepositoryPreflight(harness),
        new RegExp(`unsafe local Git config ${name.replaceAll(".", "\\.")}`, "i"),
      );
      assert.throws(
        () => createGitEvidenceResolver({ TARGET: harness.repository }),
        /unsafe local Git config/i,
      );
      readyRunGit(harness.repository, ["config", "--local", "--unset-all", name]);
      readyRepositoryPreflight(harness);
    }

    readyRunGit(harness.repository, [
      "config",
      "--local",
      "extensions.worktreeConfig",
      "true",
    ]);
    readyRunGit(harness.repository, [
      "config",
      "--worktree",
      "gpg.program",
      "/definitely/missing/curve-worktree-gpg",
    ]);
    assert.throws(
      () => readyRepositoryPreflight(harness),
      /unsafe local Git config extensions\.worktreeconfig/i,
    );
    assert.throws(
      () => createGitEvidenceResolver({ TARGET: harness.repository }),
      /unsafe local Git config extensions\.worktreeconfig/i,
    );
  } finally {
    rmSync(harness.temporary, { recursive: true, force: true });
  }
});

test("GIT_READ_ONLY submodule isolation prevents child diff-helper execution", () => {
  const temporary = mkdtempSync(join(tmpdir(), "curve-packet-submodule-trust-"));
  const childSource = join(temporary, "child-source");
  const parent = join(temporary, "parent");
  const childCheckout = join(parent, "dependency");
  const missingHelper = "/definitely/missing/curve-submodule-diff-helper";
  mkdirSync(childSource);
  mkdirSync(parent);
  try {
    readyRunGit(childSource, ["init", "-b", "main"]);
    writeFileSync(join(childSource, "child.txt"), "child v1\n");
    readyRunGit(childSource, ["add", "child.txt"]);
    readyRunGit(childSource, ["commit", "-m", "child baseline"]);

    readyRunGit(parent, ["init", "-b", "main"]);
    writeFileSync(join(parent, "README.md"), "parent\n");
    readyRunGit(parent, ["add", "README.md"]);
    readyRunGit(parent, ["commit", "-m", "parent baseline"]);
    readyRunGit(parent, [
      "-c",
      "protocol.file.allow=always",
      "submodule",
      "add",
      childSource,
      "dependency",
    ]);
    readyRunGit(parent, ["commit", "-am", "add dependency"]);
    readyRunGit(parent, ["config", "--local", "diff.submodule", "diff"]);
    readyRunGit(parent, [
      "config",
      "--local",
      "--remove-section",
      "submodule.dependency",
    ]);
    readyRunGit(childCheckout, ["config", "--local", "diff.external", missingHelper]);
    writeFileSync(join(childCheckout, "child.txt"), "child v2\n");
    readyRunGit(childCheckout, ["add", "child.txt"]);
    readyRunGit(childCheckout, ["commit", "-m", "child update"]);

    assert.doesNotThrow(() => createGitEvidenceResolver({ TARGET: parent }));
    const unsafe = spawnSync(
      "git",
      ["--no-pager", "diff", "--no-ext-diff", "--no-textconv", "HEAD"],
      { cwd: parent, encoding: "utf8" },
    );
    assert.match(`${unsafe.stderr}${unsafe.stdout}`, /curve-submodule-diff-helper/i);

    const isolated = spawnSync(
      "git",
      [
        "--no-pager",
        "diff",
        "--no-ext-diff",
        "--no-textconv",
        "--ignore-submodules=all",
        "HEAD",
      ],
      { cwd: parent, encoding: "utf8" },
    );
    assert.equal(isolated.status, 0, isolated.stderr || isolated.stdout);

    const tool = { tool_kind: "GIT_READ_ONLY", executable: "git" };
    assert.match(
      classifyCodingAgentCommand({ id: "UNSAFE-SUBMODULE", argv: [
        "git", "--no-pager", "diff", "--no-ext-diff", "--no-textconv", "HEAD",
      ] }, tool).prohibited_reason,
      /ignore-submodules=all/i,
    );
    assert.equal(
      classifyCodingAgentCommand({ id: "SAFE-SUBMODULE", argv: [
        "git", "--no-pager", "diff", "--no-ext-diff", "--no-textconv",
        "--ignore-submodules=all", "HEAD",
      ] }, tool).prohibited_reason,
      null,
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("Git evidence accepts regular blobs and rejects trees, symlinks, and tree revisions", () => {
  const temporary = mkdtempSync(join(tmpdir(), "curve-packet-git-evidence-"));
  const repository = join(temporary, "repository");
  mkdirSync(repository);
  readyRunGit(repository, ["init", "-b", "main"]);
  mkdirSync(join(repository, "evidence"));
  writeFileSync(join(repository, "evidence", "regular.txt"), "regular blob\n");
  symlinkSync("regular.txt", join(repository, "evidence", "linked.txt"));
  readyRunGit(repository, ["add", "."]);
  readyRunGit(repository, ["commit", "-m", "evidence objects"]);
  const revision = readyRunGit(repository, ["rev-parse", "HEAD"]);
  const treeRevision = readyRunGit(repository, ["rev-parse", "HEAD^{tree}"]);
  const resolver = createGitEvidenceResolver({
    CURVE: repository,
    TARGET: repository,
  });
  try {
    const regular = resolver({
      repository: "CURVE",
      revision,
      path: "evidence/regular.txt",
      content_digest: digest("regular blob\n"),
    });
    assert.equal(
      Buffer.from(regular.contents ?? regular).toString(),
      "regular blob\n",
    );
    assert.throws(() => resolver({
      repository: "CURVE",
      revision,
      path: "evidence",
      content_digest: digest("unused"),
    }), /blob|tree|regular file/i);
    assert.throws(() => resolver({
      repository: "CURVE",
      revision,
      path: "evidence/linked.txt",
      content_digest: digest("regular.txt"),
    }), /symlink|regular file|mode 120000/i);
    assert.throws(() => resolver({
      repository: "CURVE",
      revision: treeRevision,
      path: "evidence/regular.txt",
      content_digest: digest("regular blob\n"),
    }), /commit|revision|object type/i);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("real multi-commit publication resolves normative, evidence, catalog, packet, and registry bytes", () => {
  const temporary = mkdtempSync(join(tmpdir(), "curve-packet-publication-"));
  const curveRepository = join(temporary, "curve");
  const curveOrigin = join(temporary, "curve-origin.git");
  const targetRepository = join(temporary, "plane");
  const targetOrigin = join(temporary, "plane-origin.git");
  const toolDirectory = join(temporary, "tools");
  const preliminary = makeReadyHarnessV1();
  const evidenceBytes = (harness, reference) => {
    const contents = harness.evidence.get(readyEvidenceKey(reference));
    assert.ok(contents, `missing fixture bytes for ${readyEvidenceKey(reference)}`);
    return Buffer.from(contents);
  };
  const writeEvidence = (repository, harness, reference) => {
    const path = join(repository, reference.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, evidenceBytes(harness, reference));
  };
  try {
    mkdirSync(curveRepository);
    mkdirSync(curveOrigin);
    mkdirSync(targetRepository);
    mkdirSync(targetOrigin);
    readyRunGit(curveRepository, ["init", "-b", "main"]);
    readyRunGit(curveOrigin, ["init", "--bare"]);
    readyRunGit(targetRepository, ["init", "-b", "preview"]);
    readyRunGit(targetOrigin, ["init", "--bare"]);

    for (const reference of readyDirectReferences(preliminary.packet)) {
      if (reference.repository === "TARGET") {
        writeEvidence(targetRepository, preliminary, reference);
      }
    }
    for (const path of ["apps/web", "packages/services", "packages/shared-state"]) {
      mkdirSync(join(targetRepository, path), { recursive: true });
      writeFileSync(join(targetRepository, path, ".keep"), "synthetic fixture\n");
    }
    readyRunGit(targetRepository, ["add", "."]);
    readyRunGit(targetRepository, ["commit", "-m", "target base"]);
    const targetRevision = readyRunGit(targetRepository, ["rev-parse", "HEAD"]);
    readyRunGit(targetRepository, ["remote", "add", "origin", targetOrigin]);
    readyRunGit(targetRepository, ["push", "-u", "origin", "preview"]);
    readyRunGit(targetRepository, ["remote", "set-url", "origin", READY_TARGET_URL]);

    for (const reference of readyDirectReferences(preliminary.packet)) {
      if (reference.repository !== "TARGET") {
        writeEvidence(curveRepository, preliminary, reference);
      }
    }
    for (const entry of preliminary.contextManifest.entries) {
      writeEvidence(curveRepository, preliminary, entry);
    }
    readyRunGit(curveRepository, ["add", "."]);
    readyRunGit(curveRepository, ["commit", "-m", "normative Curve sources"]);
    const normativeSourceRevision = readyRunGit(curveRepository, ["rev-parse", "HEAD"]);

    const harness = makeReadyHarnessV1({
      targetRevision,
      curveRevision: normativeSourceRevision,
    });
    const stateBindings = collectCodingAgentTaskPacketStateBindings(harness.packet);
    const authorityReferences = [];
    for (const record of harness.stateRecords.values()) {
      for (const attestation of record.attestations) {
        authorityReferences.push(attestation.authority_source);
        writeEvidence(curveRepository, harness, attestation.authority_source);
      }
    }
    readyRunGit(curveRepository, ["add", "."]);
    readyRunGit(curveRepository, ["commit", "-m", "publish authority evidence"]);
    const authorityEvidenceRevision = readyRunGit(curveRepository, ["rev-parse", "HEAD"]);

    for (const reference of authorityReferences) {
      const contents = evidenceBytes(harness, reference);
      reference.revision = authorityEvidenceRevision;
      harness.evidence.set(readyEvidenceKey(reference), contents);
    }
    for (const item of stateBindings) {
      const record = harness.stateRecords.get(item.binding.evidence.path);
      for (const attestation of record.attestations) {
        attestation.authority_source.revision = authorityEvidenceRevision;
      }
      harness.stateRecords.set(item.binding.evidence.path, record);
      readyReplaceJsonEvidence(harness, item.binding.evidence, record);
    }
    writeEvidence(
      curveRepository,
      harness,
      harness.packet.curve_binding.context_pack.manifest,
    );
    for (const item of stateBindings) {
      writeEvidence(curveRepository, harness, item.binding.evidence);
    }
    readyRunGit(curveRepository, ["add", "."]);
    readyRunGit(curveRepository, ["commit", "-m", "publish context and state evidence"]);
    const stateEvidenceRevision = readyRunGit(curveRepository, ["rev-parse", "HEAD"]);
    harness.packet.curve_binding.context_pack.manifest.revision = stateEvidenceRevision;
    for (const item of stateBindings) {
      item.binding.evidence.revision = stateEvidenceRevision;
    }

    readyRefreshCatalog(harness);
    writeEvidence(
      curveRepository,
      harness,
      harness.packet.source_catalog_binding.evidence,
    );
    readyRunGit(curveRepository, ["add", "."]);
    readyRunGit(curveRepository, ["commit", "-m", "publish source catalog"]);
    const sourceCatalogRevision = readyRunGit(curveRepository, ["rev-parse", "HEAD"]);
    harness.packet.source_catalog_binding.evidence.revision = sourceCatalogRevision;
    readySeal(harness);

    const registryDirectory = join(curveRepository, "contracts", "task-packets");
    mkdirSync(registryDirectory, { recursive: true });
    const packetPath = join(registryDirectory, "m1-01b.json");
    const packetBytes = Buffer.from(`${JSON.stringify(harness.packet, null, 2)}\n`);
    writeFileSync(packetPath, packetBytes);
    readyRunGit(curveRepository, ["add", "."]);
    readyRunGit(curveRepository, ["commit", "-m", "publish task-packet registry"]);
    const registryPublicationRevision = readyRunGit(curveRepository, ["rev-parse", "HEAD"]);
    readyRunGit(curveRepository, ["remote", "add", "origin", curveOrigin]);
    readyRunGit(curveRepository, ["push", "-u", "origin", "main"]);
    readyRunGit(curveRepository, [
      "remote", "set-url", "origin", "https://github.com/faocampo/curve",
    ]);

    mkdirSync(toolDirectory);
    writeFileSync(join(toolDirectory, "pnpm"), READY_PNPM_BYTES);
    writeFileSync(join(toolDirectory, "codeql"), READY_CODEQL_BYTES);
    chmodSync(join(toolDirectory, "pnpm"), 0o755);
    chmodSync(join(toolDirectory, "codeql"), 0o755);
    const liveTips = {
      main: registryPublicationRevision,
      preview: targetRevision,
    };
    const remoteTipController = createCodingAgentRemoteTipTestController(
      ({ repository_identity, branch }) => ({
        commit: liveTips[branch],
        repository_identity,
        branch,
        remote: "origin",
        observed_at: "2026-08-30T12:00:00Z",
        source: "GIT_LS_REMOTE",
      }),
      { now: Date.parse("2026-08-30T12:00:00Z") },
    );
    const registry = validateCodingAgentRegistryFilesPreflight(
      [harness.packet],
      [packetPath],
      curveRepository,
      { testOnlyRemoteTipController: remoteTipController },
    );
    const resolveReference = createGitEvidenceResolver({
      CURVE: curveRepository,
      TARGET: targetRepository,
    });
    const readiness = validateCodingAgentTaskPacketForReadinessPreflightWithTestControllers(
      harness.packet,
      {
        resolveReference,
        resolveProjectItem: createGitHubProjectItemResolver(readyProjectPayload()),
        curveRepository,
        targetRepository,
        resolveTool: createLocalCodingAgentToolResolver({
          path: toolDirectory,
          runVersionProbe: ({ executablePath, argv, spawnOptions }) => ({
            ...spawnSync(executablePath, argv.slice(1), spawnOptions),
            network_isolation: "TRUSTED_RUNNER_NETWORK_NONE",
          }),
        }),
      },
      { remoteTipController },
    );

    assert.equal(registry.registryPublicationRevision, registryPublicationRevision);
    assert.equal(registry.files[0].content_digest, digest(packetBytes));
    assert.equal(readiness.readiness_preflight_passed, true);
    const { requiredAncestryEdges, ...revisionSummary } =
      readiness.evidence.revisionModel;
    assert.deepEqual(revisionSummary, {
      normativeSourceRevision,
      evidencePublicationRevisions: [
        authorityEvidenceRevision,
        stateEvidenceRevision,
      ].sort(),
      sourceCatalogRevision,
      curveRevisions: [
        normativeSourceRevision,
        authorityEvidenceRevision,
        stateEvidenceRevision,
        sourceCatalogRevision,
      ].sort(),
    });
    for (const expectedEdge of [
      {
        ancestor: normativeSourceRevision,
        descendant: authorityEvidenceRevision,
        relationship: "NORMATIVE_SOURCE_TO_EVIDENCE",
      },
      {
        ancestor: authorityEvidenceRevision,
        descendant: stateEvidenceRevision,
        relationship: "AUTHORITY_SOURCE_TO_STATE_EVIDENCE",
      },
      {
        ancestor: stateEvidenceRevision,
        descendant: sourceCatalogRevision,
        relationship: "EVIDENCE_TO_SOURCE_CATALOG",
      },
    ]) {
      assert.ok(
        requiredAncestryEdges.some(
          (edge) => JSON.stringify(edge) === JSON.stringify(expectedEdge),
        ),
        `missing publication edge ${JSON.stringify(expectedEdge)}`,
      );
    }
    assert.equal(
      readiness.repositories.curve.publication.registryPublicationRevision,
      registryPublicationRevision,
    );
    assert.deepEqual(
      readiness.repositories.curve.publication.evidencePublicationRevisions,
      [authorityEvidenceRevision, stateEvidenceRevision].sort(),
    );

    assert.throws(
      () => validateCodingAgentCurveRepositoryPreflight(
        harness.packet,
        curveRepository,
        {
          testOnlyRemoteTipController: remoteTipController,
          revisionModel: {
            normativeSourceRevision,
            evidencePublicationRevisions: [],
            sourceCatalogRevision: null,
            curveRevisions: [normativeSourceRevision],
            requiredAncestryEdges: [],
          },
        },
      ),
      /does not accept caller-supplied option revisionModel/i,
    );

    const alteredPacketObject = structuredClone(harness.packet);
    alteredPacketObject.project_tracking.status = "IN_PROGRESS";
    assert.throws(
      () => validateCodingAgentRegistryFilesPreflight(
        [alteredPacketObject],
        [packetPath],
        curveRepository,
        { testOnlyRemoteTipController: remoteTipController },
      ),
      /supplied object does not exactly match committed registry bytes/i,
    );

    const normativeDrift = structuredClone(harness.packet);
    normativeDrift.curve_binding.governance_documents[0].revision =
      stateEvidenceRevision;
    sealCodingAgentTaskPacket(normativeDrift);
    assert.throws(
      () => validateCodingAgentCurveRepositoryPreflight(
        normativeDrift,
        curveRepository,
        { testOnlyRemoteTipController: remoteTipController },
      ),
      /normative Curve source/i,
    );

    const outOfOrder = structuredClone(harness.packet);
    outOfOrder.curve_binding.context_pack.manifest.revision =
      registryPublicationRevision;
    sealCodingAgentTaskPacket(outOfOrder);
    assert.throws(
      () => validateCodingAgentCurveRepositoryPreflight(
        outOfOrder,
        curveRepository,
        { testOnlyRemoteTipController: remoteTipController },
      ),
      /publication order|ancestor/i,
    );

    readyRunGit(curveRepository, ["checkout", "-b", "unmerged-evidence"]);
    writeFileSync(join(curveRepository, "unmerged-evidence.txt"), "not on main\n");
    readyRunGit(curveRepository, ["add", "."]);
    readyRunGit(curveRepository, ["commit", "-m", "unmerged evidence"]);
    const unmergedEvidenceRevision = readyRunGit(curveRepository, ["rev-parse", "HEAD"]);
    readyRunGit(curveRepository, ["checkout", "main"]);
    const unmerged = structuredClone(harness.packet);
    unmerged.curve_binding.context_pack.manifest.revision = unmergedEvidenceRevision;
    sealCodingAgentTaskPacket(unmerged);
    assert.throws(
      () => validateCodingAgentCurveRepositoryPreflight(
        unmerged,
        curveRepository,
        { testOnlyRemoteTipController: remoteTipController },
      ),
      /merged into live main|ancestor/i,
    );

    writeFileSync(packetPath, Buffer.concat([packetBytes, Buffer.from(" ")]));
    assert.throws(
      () => validateCodingAgentRegistryFilesPreflight(
        [harness.packet],
        [packetPath],
        curveRepository,
        { testOnlyRemoteTipController: remoteTipController },
      ),
      /clean|bytes|blob/i,
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("filesystem evidence rejects traversal and exact evidence bytes reject tampering", () => {
  const harness = makeReadyHarnessV1();
  const reference = harness.packet.repository_instructions[0];
  harness.evidence.set(readyEvidenceKey(reference), Buffer.from("wrong bytes\n"));
  assert.throws(() => validateCodingAgentTaskPacketEvidence(harness.packet, {
    resolveReference: readyResolver(harness),
  }), /digest mismatch/i);

  const temporary = mkdtempSync(join(tmpdir(), "curve-packet-filesystem-"));
  const root = join(temporary, "curve");
  mkdirSync(root);
  writeFileSync(join(root, "evidence.txt"), "safe\n");
  const resolver = createFilesystemEvidenceResolver({
    CURVE: { root, revision: READY_CURVE_REVISION },
  });
  try {
    assert.throws(() => resolver({
      repository: "CURVE",
      revision: READY_CURVE_REVISION,
      path: "../outside.txt",
      content_digest: digest("unused"),
    }), /path|outside|contain/i);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("packet identity, branch separation, nested IDs, and acceptance trace fail closed", () => {
  const tampered = makeReadyHarnessV1();
  tampered.packet.scope.in_scope[0] = "Tampered after sealing";
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(tampered.packet),
    /packet_digest|canonical/i,
  );
  const branch = makeReadyHarnessV1();
  branch.packet.repository.feature_branch = branch.packet.repository.target_branch;
  readySeal(branch);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(branch.packet),
    /branch|differ/i,
  );
  const tool = makeReadyHarnessV1();
  tool.packet.tool_policy.tools.push(structuredClone(tool.packet.tool_policy.tools[0]));
  readySeal(tool);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(tool.packet),
    /duplicate.*tool|PNPM/i,
  );
  const trace = makeReadyHarnessV1();
  trace.packet.requirements.functional_requirement_ids.push("FR-999");
  readySeal(trace);
  assert.throws(
    () => validateCodingAgentTaskPacketSemantics(trace.packet),
    /FR-999|acceptance trace/i,
  );
});

test("packet-set decomposition rejects missing children and self-reference", () => {
  const parent = cloneBlocked();
  parent.packet_id = "CURVE-PARENT";
  parent.work_package_id = "M2-PARENT";
  parent.size = "L";
  parent.project_tracking.item_node_id = "PVTI_parent";
  parent.project_tracking.work_package_id = "M2-PARENT";
  parent.decomposition = {
    independently_dispatchable_children: true,
    child_packet_ids: ["CURVE-CHILD-A", "CURVE-CHILD-B"],
  };
  const sealedParent = sealCodingAgentTaskPacket(parent);
  assert.throws(
    () => validateCodingAgentTaskPacketSetSemantics([sealedParent]),
    /child.*missing|CURVE-CHILD-A/i,
  );
  parent.decomposition.child_packet_ids = ["CURVE-PARENT", "CURVE-CHILD-B"];
  assert.throws(
    () => validateCodingAgentTaskPacketSetSemantics([
      sealCodingAgentTaskPacket(parent),
    ]),
    /itself|self/i,
  );
});

test("registry discovery is recursive, JSON-only, deterministic, and set-validated", () => {
  const temporary = mkdtempSync(join(tmpdir(), "curve-task-packet-discovery-"));
  try {
    mkdirSync(join(temporary, "nested"));
    writeFileSync(join(temporary, "one.json"), "{}\n");
    writeFileSync(join(temporary, "nested", "two.json"), "{}\n");
    writeFileSync(join(temporary, "README.md"), "# packets\n");
    assert.deepEqual(
      discoverCodingAgentTaskPacketFiles(temporary).map((path) =>
        path.slice(temporary.length + 1),
      ),
      ["nested/two.json", "one.json"],
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
  const left = makeReadyHarnessV1().packet;
  assert.throws(
    () => validateCodingAgentTaskPacketSetSemantics([left, structuredClone(left)]),
    /duplicate.*packet|packet.*duplicate/i,
  );
  assert.ok(collectCodingAgentTaskPacketEvidenceReferences(left).length >= 20);
});
