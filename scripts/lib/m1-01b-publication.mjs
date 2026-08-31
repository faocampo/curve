import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  collectCodingAgentTaskPacketStateBindings,
  computeCodingAgentStateApprovalSubjectDigest,
  projectCodingAgentSourceCatalogRecord,
  sealCodingAgentTaskPacket,
  validateCodingAgentTaskPacketSemantics,
} from "./coding-agent-task-packet.mjs";
import {
  digestContextEntries,
  M1_01B_CONTEXT_PATHS,
} from "./context-pack.mjs";

const moduleRoot = dirname(fileURLToPath(import.meta.url));
export const M1_01B_REPOSITORY_ROOT = resolve(moduleRoot, "../..");
export const M1_01B_PREPARED_PACKET_PATH =
  "contracts/schemas/examples/coding-agent-task-packet.valid.json";
export const M1_01B_AUTHORITY_DIRECTORY = "contracts/authority/m1-01b/v1";
export const M1_01B_STATE_DIRECTORY = "contracts/state/m1-01b/published-v1";
export const M1_01B_CONTEXT_PATH = "contracts/context/m1-01b-v1.json";
export const M1_01B_SOURCE_CATALOG_PATH =
  "contracts/task-packet-sources/m1-01b-v1.json";
export const M1_01B_PACKET_PATH = "contracts/task-packets/m1-01b-v1.json";

const TOOL_BLOCKER = Object.freeze({
  blocker_id: "B-CODING-TOOLS-01",
  category: "TOOL",
  summary:
    "The observed pnpm launcher is not an approved execution profile, and the exact no-download local security command and CodeQL tool identity remain unresolved.",
  required_evidence:
    "An owner-approved Node/pnpm and security profile with implemented command grammar, tool or image digests, sandbox controls, adversarial tests, and cleanup evidence.",
});
const SOURCE_CATALOG_BLOCKER = Object.freeze({
  blocker_id: "B-SOURCE-CATALOG",
  category: "OTHER",
  summary:
    "No descendant machine source-catalog record has yet been bound to the packet projection.",
  required_evidence:
    "A digest-bound source-catalog record published after normative and evidence revisions.",
});
const AUTHORITY_BLOCKER = Object.freeze({
  blocker_id: "B-CODING-AUTHORITY-01",
  category: "OTHER",
  summary:
    "NO_DISPATCH: trusted human implementation authority remains unresolved and implementation_authority_granted:false.",
  required_evidence:
    "A separately approved, exact-packet-digest implementation grant must change implementation_authority_granted:false before any dispatch.",
});

function readJson(path, root = M1_01B_REPOSITORY_ROOT) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

export function m1_01bSha256(contents) {
  return `sha256:${createHash("sha256").update(contents).digest("hex")}`;
}

export function m1_01bGitBytes(revision, path, root = M1_01B_REPOSITORY_ROOT) {
  return execFileSync("git", ["show", `${revision}:${path}`], { cwd: root });
}

export function m1_01bGitText(args, root = M1_01B_REPOSITORY_ROOT) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function updateNormativeReferences(value, revision, root) {
  if (Array.isArray(value)) {
    for (const entry of value) updateNormativeReferences(entry, revision, root);
    return;
  }
  if (value === null || typeof value !== "object") return;
  if (
    typeof value.path === "string" &&
    typeof value.revision === "string" &&
    typeof value.content_digest === "string" &&
    (value.repository ?? "CURVE") === "CURVE"
  ) {
    value.revision = revision;
    value.content_digest = m1_01bSha256(
      m1_01bGitBytes(revision, value.path, root),
    );
  }
  for (const entry of Object.values(value)) {
    updateNormativeReferences(entry, revision, root);
  }
}

export function buildM1_01BNormativePacket(
  normativeRevision,
  root = M1_01B_REPOSITORY_ROOT,
) {
  const packet = structuredClone(readJson(M1_01B_PREPARED_PACKET_PATH, root));
  packet.packet_version = 3;
  packet.curve_binding.curve_revision = normativeRevision;
  updateNormativeReferences(packet, normativeRevision, root);
  sealCodingAgentTaskPacket(packet);
  validateCodingAgentTaskPacketSemantics(packet);
  return packet;
}

function stateKey(subjectType, subjectId) {
  return `${subjectType}:${subjectId}`;
}

function slug(subjectType, subjectId) {
  return `${subjectType}-${subjectId}`
    .toLowerCase()
    .replaceAll("_", "-")
    .replace(/[^a-z0-9-]+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^-|-$/gu, "");
}

function preparedStateMetadata(root) {
  const directory = join(root, "contracts/state/m1-01b");
  const records = new Map();
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const record = readJson(`contracts/state/m1-01b/${entry.name}`, root);
    const attestation = record.attestations[0];
    records.set(stateKey(record.subject_type, record.subject_id), {
      actorId: attestation.actor_id,
      actorRole: attestation.actor_role,
      attestedAt: attestation.attested_at,
      sourceType: attestation.authority_source.source_type,
      normativePath: attestation.authority_source.path,
      normativeTitle: attestation.authority_source.title,
    });
  }
  return records;
}

function normativeCommitTimestamp(revision, root) {
  return m1_01bGitText(["show", "-s", "--format=%cI", revision], root);
}

export function describeM1_01BStatePublications(
  normativeRevision,
  root = M1_01B_REPOSITORY_ROOT,
) {
  const packet = buildM1_01BNormativePacket(normativeRevision, root);
  const prepared = preparedStateMetadata(root);
  const fallbackTimestamp = normativeCommitTimestamp(normativeRevision, root);
  return collectCodingAgentTaskPacketStateBindings(packet)
    .map((item) => {
      const key = stateKey(item.subjectType, item.subjectId);
      const metadata = prepared.get(key) ?? {
        actorId: "faocampo",
        actorRole: "CURVE_ENGINEERING_APPROVER",
        attestedAt: fallbackTimestamp,
        sourceType: "WORKSPACE_ROLE_BINDING",
        normativePath: M1_01B_PREPARED_PACKET_PATH,
        normativeTitle: `M1-01B ${item.subjectId} proposal source`,
      };
      const fileSlug = slug(item.subjectType, item.subjectId);
      return {
        ...item,
        ...metadata,
        approvalSubjectDigest:
          computeCodingAgentStateApprovalSubjectDigest(item.approvalSubject),
        authorityPath: `${M1_01B_AUTHORITY_DIRECTORY}/${fileSlug}.json`,
        statePath: `${M1_01B_STATE_DIRECTORY}/${fileSlug}.json`,
        sourceId: `CURVE-M1-01B-${item.subjectType}-${item.subjectId}`,
      };
    })
    .sort((left, right) => left.statePath.localeCompare(right.statePath));
}

export function buildM1_01BAuthorityRecords(
  normativeRevision,
  root = M1_01B_REPOSITORY_ROOT,
) {
  return describeM1_01BStatePublications(normativeRevision, root).map((item) => ({
    path: item.authorityPath,
    value: {
      schema_version: "curve.coding-agent-state-authority-source/v1",
      source_id: item.sourceId,
      source_type: item.sourceType,
      workspace_id: item.approvalSubject.workspace_id,
      work_package_id: "M1-01B",
      actor: {
        actor_type: "HUMAN",
        actor_id: item.actorId,
        actor_role: item.actorRole,
      },
      authority_scope: [
        `STATE:${item.subjectType}:${item.subjectId}:${item.state}`,
      ],
      approval_subject: item.approvalSubject,
      approval_subject_digest: item.approvalSubjectDigest,
      attested_at: item.attestedAt,
      normative_source: {
        repository: "CURVE",
        title: item.normativeTitle,
        path: item.normativePath,
        revision: normativeRevision,
        content_digest: m1_01bSha256(
          m1_01bGitBytes(normativeRevision, item.normativePath, root),
        ),
      },
      execution_selections: {
        node_execution_profile: null,
        security_profile: null,
        authority_profile: null,
      },
      implementation_authority: {
        status: "UNRESOLVED",
        blocker_id: "B-CODING-AUTHORITY-01",
        implementation_authority_granted: false,
        dispatch_status: "NO_DISPATCH",
      },
    },
  }));
}

export function buildM1_01BStateRecords(
  normativeRevision,
  authorityRevision,
  root = M1_01B_REPOSITORY_ROOT,
) {
  return describeM1_01BStatePublications(normativeRevision, root).map((item) => ({
    path: item.statePath,
    value: {
      schema_version: "curve.coding-agent-state-evidence/v1",
      workspace_id: item.approvalSubject.workspace_id,
      subject_type: item.subjectType,
      subject_id: item.subjectId,
      state: item.state,
      approval_subject: item.approvalSubject,
      approval_subject_digest: item.approvalSubjectDigest,
      attestations: [
        {
          actor_type: "HUMAN",
          actor_id: item.actorId,
          actor_role: item.actorRole,
          authority_source: {
            source_type: item.sourceType,
            source_id: item.sourceId,
            repository: "CURVE",
            title: `${item.label} publication authority source`,
            path: item.authorityPath,
            revision: authorityRevision,
            content_digest: m1_01bSha256(
              m1_01bGitBytes(authorityRevision, item.authorityPath, root),
            ),
          },
          workspace_id: item.approvalSubject.workspace_id,
          authority_scope: [
            `STATE:${item.subjectType}:${item.subjectId}:${item.state}`,
          ],
          attested_at: item.attestedAt,
          subject_digest: item.approvalSubjectDigest,
          derivation: null,
        },
      ],
    },
  }));
}

export function buildM1_01BContextManifest(
  normativeRevision,
  root = M1_01B_REPOSITORY_ROOT,
) {
  const entries = M1_01B_CONTEXT_PATHS.map((path) => ({
    repository: "CURVE",
    path,
    revision: normativeRevision,
    content_digest: m1_01bSha256(m1_01bGitBytes(normativeRevision, path, root)),
  }));
  return {
    schema_version: "curve.coding-agent-context-pack-manifest/v1",
    context_pack_id: "M1-01B-V1",
    version: 1,
    workspace_id: "10000000-0000-4000-8000-000000000001",
    work_package_id: "M1-01B",
    curve_revision: normativeRevision,
    entries,
  };
}

export function computeM1_01BContextDigest(
  normativeRevision,
  root = M1_01B_REPOSITORY_ROOT,
) {
  return digestContextEntries(
    M1_01B_CONTEXT_PATHS.map((path) => ({
      path,
      contents: m1_01bGitBytes(normativeRevision, path, root),
    })),
  );
}

function publishedReference(title, path, revision, root) {
  return {
    repository: "CURVE",
    title,
    path,
    revision,
    content_digest: m1_01bSha256(m1_01bGitBytes(revision, path, root)),
  };
}

function resolveEvidenceBindings(packet, normativeRevision, evidenceRevision, root) {
  packet.curve_binding.context_pack = {
    resolution: "RESOLVED",
    manifest: publishedReference(
      "M1-01B canonical context-pack manifest",
      M1_01B_CONTEXT_PATH,
      evidenceRevision,
      root,
    ),
    context_digest: computeM1_01BContextDigest(normativeRevision, root),
    unresolved_blocker_id: null,
  };
  const descriptors = new Map(
    describeM1_01BStatePublications(normativeRevision, root).map((item) => [
      stateKey(item.subjectType, item.subjectId),
      item,
    ]),
  );
  for (const item of collectCodingAgentTaskPacketStateBindings(packet)) {
    const descriptor = descriptors.get(stateKey(item.subjectType, item.subjectId));
    item.binding.resolution = "RESOLVED";
    item.binding.evidence = publishedReference(
      `${item.label} machine state evidence`,
      descriptor.statePath,
      evidenceRevision,
      root,
    );
    item.binding.record_pointer = "";
    item.binding.assertions = [
      { pointer: "/subject_type", expected: item.subjectType },
      { pointer: "/subject_id", expected: item.subjectId },
      { pointer: "/state", expected: item.state },
    ];
    item.binding.approval_subject_digest = descriptor.approvalSubjectDigest;
    item.binding.unresolved_blocker_id = null;
  }
}

export function buildM1_01BPacketThroughEvidence(
  normativeRevision,
  evidenceRevision,
  root = M1_01B_REPOSITORY_ROOT,
) {
  const packet = buildM1_01BNormativePacket(normativeRevision, root);
  resolveEvidenceBindings(packet, normativeRevision, evidenceRevision, root);
  packet.blockers = [
    structuredClone(SOURCE_CATALOG_BLOCKER),
    structuredClone(TOOL_BLOCKER),
    structuredClone(AUTHORITY_BLOCKER),
  ];
  sealCodingAgentTaskPacket(packet);
  validateCodingAgentTaskPacketSemantics(packet);
  return packet;
}

export function buildM1_01BSourceCatalog(
  normativeRevision,
  evidenceRevision,
  root = M1_01B_REPOSITORY_ROOT,
) {
  const packet = buildM1_01BPacketThroughEvidence(
    normativeRevision,
    evidenceRevision,
    root,
  );
  // C binds the stable P projection. source_catalog_binding and packet_digest
  // are excluded from that projection, so the temporary source-catalog blocker
  // must also be removed before cataloging even though the binding itself is
  // not resolvable until C has a real commit.
  packet.blockers = [structuredClone(TOOL_BLOCKER), structuredClone(AUTHORITY_BLOCKER)];
  sealCodingAgentTaskPacket(packet);
  return {
    schema_version: "curve.coding-agent-source-catalog/v1",
    catalog_id: "curve-m1-01b-v1",
    catalog_version: 1,
    work_packages: [projectCodingAgentSourceCatalogRecord(packet)],
  };
}

export function buildM1_01BPublishedPacket(
  normativeRevision,
  evidenceRevision,
  sourceCatalogRevision,
  root = M1_01B_REPOSITORY_ROOT,
) {
  const packet = buildM1_01BPacketThroughEvidence(
    normativeRevision,
    evidenceRevision,
    root,
  );
  packet.source_catalog_binding = {
    resolution: "RESOLVED",
    evidence: publishedReference(
      "M1-01B canonical source-catalog record",
      M1_01B_SOURCE_CATALOG_PATH,
      sourceCatalogRevision,
      root,
    ),
    record_pointer: "/work_packages/0",
    unresolved_blocker_id: null,
  };
  packet.blockers = [structuredClone(TOOL_BLOCKER), structuredClone(AUTHORITY_BLOCKER)];
  sealCodingAgentTaskPacket(packet);
  validateCodingAgentTaskPacketSemantics(packet);
  return packet;
}

export function m1_01bPublicationStage(root = M1_01B_REPOSITORY_ROOT) {
  const hasAuthority = existsSync(join(root, M1_01B_AUTHORITY_DIRECTORY));
  const hasEvidence = existsSync(join(root, M1_01B_CONTEXT_PATH));
  const hasCatalog = existsSync(join(root, M1_01B_SOURCE_CATALOG_PATH));
  const hasPacket = existsSync(join(root, M1_01B_PACKET_PATH));
  if (hasPacket) return "P";
  if (hasCatalog) return "C";
  if (hasEvidence) return "E2";
  if (hasAuthority) return "E1";
  return "S";
}
