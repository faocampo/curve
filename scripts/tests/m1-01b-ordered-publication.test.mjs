import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  buildM1_01BAuthorityRecords,
  buildM1_01BNormativePacket,
  buildM1_01BPublishedPacket,
  buildM1_01BSourceCatalog,
  buildM1_01BStateRecords,
  describeM1_01BStatePublications,
  M1_01B_AUTHORITY_DIRECTORY,
  M1_01B_CONTEXT_PATH,
  M1_01B_PACKET_PATH,
  M1_01B_REPOSITORY_ROOT,
  M1_01B_SOURCE_CATALOG_PATH,
  M1_01B_STATE_DIRECTORY,
  m1_01bPublicationStage,
} from "../lib/m1-01b-publication.mjs";
import {
  validateCodingAgentTaskPacketEvidence,
  validateCodingAgentTaskPacketSemantics,
} from "../lib/coding-agent-task-packet.mjs";

function readJson(path) {
  return JSON.parse(readFileSync(join(M1_01B_REPOSITORY_ROOT, path), "utf8"));
}

function git(args) {
  return execFileSync("git", args, {
    cwd: M1_01B_REPOSITORY_ROOT,
    encoding: "utf8",
  }).trim();
}

function commitFor(path) {
  return git(["log", "-1", "--format=%H", "--", path]);
}

function firstCommitFor(path) {
  const revisions = git(["log", "--diff-filter=A", "--format=%H", "--", path])
    .split(/\s+/u)
    .filter(Boolean);
  assert.equal(revisions.length, 1, `${path} must have exactly one canonical add commit`);
  return revisions[0];
}

function isAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
      cwd: M1_01B_REPOSITORY_ROOT,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function assertPacketPublicationCheckout({
  head,
  packetRevision,
  packetPathRevision,
  packetRevisionIsAncestor,
}) {
  assert.equal(
    packetPathRevision,
    packetRevision,
    "packet path must not be rewritten after its canonical publication commit",
  );
  assert.equal(
    packetRevisionIsAncestor,
    true,
    "packet publication commit must be an ancestor of the current checkout",
  );
  if (head === packetRevision) return "DIRECT_PACKET_HEAD";
  return "POST_PUBLICATION_DESCENDANT";
}

function assertAncestor(ancestor, descendant) {
  execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
    cwd: M1_01B_REPOSITORY_ROOT,
  });
}

function assertJsonSet(actualDirectory, expectedArtifacts) {
  const actualPaths = readdirSync(join(M1_01B_REPOSITORY_ROOT, actualDirectory))
    .filter((name) => name.endsWith(".json"))
    .map((name) => `${actualDirectory}/${name}`)
    .sort();
  assert.deepEqual(actualPaths, expectedArtifacts.map(({ path }) => path).sort());
  for (const artifact of expectedArtifacts) {
    assert.deepEqual(readJson(artifact.path), artifact.value, artifact.path);
  }
}

function directCurveReferenceRevisions(value, revisions = []) {
  if (Array.isArray(value)) {
    for (const entry of value) directCurveReferenceRevisions(entry, revisions);
    return revisions;
  }
  if (value === null || typeof value !== "object") return revisions;
  if (
    typeof value.path === "string" &&
    typeof value.revision === "string" &&
    typeof value.content_digest === "string" &&
    (value.repository ?? "CURVE") === "CURVE"
  ) {
    revisions.push(value.revision);
  }
  for (const entry of Object.values(value)) {
    directCurveReferenceRevisions(entry, revisions);
  }
  return revisions;
}

test("packet publication checkout accepts canonical P descendants and rejects sibling or rewritten histories", () => {
  const packetRevision = "2".repeat(40);
  const accepted = [
    {
      name: "direct packet head",
      head: packetRevision,
      result: "DIRECT_PACKET_HEAD",
    },
    {
      name: "GitHub synthetic packet-publication merge",
      head: "3".repeat(40),
      result: "POST_PUBLICATION_DESCENDANT",
    },
    {
      name: "later main descendant",
      head: "4".repeat(40),
      result: "POST_PUBLICATION_DESCENDANT",
    },
    {
      name: "later feature descendant",
      head: "5".repeat(40),
      result: "POST_PUBLICATION_DESCENDANT",
    },
    {
      name: "later feature synthetic merge descendant",
      head: "6".repeat(40),
      result: "POST_PUBLICATION_DESCENDANT",
    },
  ];
  for (const { name, head, result } of accepted) {
    assert.equal(assertPacketPublicationCheckout({
      head,
      packetRevision,
      packetPathRevision: packetRevision,
      packetRevisionIsAncestor: true,
    }), result, name);
  }

  const rejected = [
    {
      name: "sibling history",
      packetPathRevision: packetRevision,
      packetRevisionIsAncestor: false,
      expected: /must be an ancestor/u,
    },
    {
      name: "unrelated history",
      packetPathRevision: packetRevision,
      packetRevisionIsAncestor: false,
      expected: /must be an ancestor/u,
    },
    {
      name: "packet path rewrite",
      packetPathRevision: "7".repeat(40),
      packetRevisionIsAncestor: true,
      expected: /must not be rewritten/u,
    },
  ];
  for (const { name, packetPathRevision, packetRevisionIsAncestor, expected } of rejected) {
    assert.throws(
      () => assertPacketPublicationCheckout({
        head: "8".repeat(40),
        packetRevision,
        packetPathRevision,
        packetRevisionIsAncestor,
      }),
      expected,
      name,
    );
  }
});

test("M1-01B ordered publication remains monotonic and fail closed", () => {
  const stage = m1_01bPublicationStage();
  assert.match(stage, /^(?:S|E1|E2|C|P)$/u);
  if (stage === "S") {
    const normativeRevision = git(["rev-parse", "HEAD"]);
    const revisions = directCurveReferenceRevisions(
      buildM1_01BNormativePacket(normativeRevision),
    );
    assert.ok(revisions.length > 1);
    assert.deepEqual([...new Set(revisions)], [normativeRevision]);
    return;
  }

  const authorityFiles = readdirSync(join(M1_01B_REPOSITORY_ROOT, M1_01B_AUTHORITY_DIRECTORY))
    .filter((name) => name.endsWith(".json"));
  assert.equal(authorityFiles.length, 17);
  const firstAuthorityPath = `${M1_01B_AUTHORITY_DIRECTORY}/${authorityFiles[0]}`;
  const authorityRevision = commitFor(firstAuthorityPath);
  const firstAuthority = readJson(firstAuthorityPath);
  const normativeRevision = firstAuthority.normative_source.revision;
  assert.deepEqual(
    [...new Set(directCurveReferenceRevisions(
      buildM1_01BNormativePacket(normativeRevision),
    ))],
    [normativeRevision],
  );
  assertAncestor(normativeRevision, authorityRevision);
  assertJsonSet(
    M1_01B_AUTHORITY_DIRECTORY,
    buildM1_01BAuthorityRecords(normativeRevision),
  );
  for (const { value } of buildM1_01BAuthorityRecords(normativeRevision)) {
    assert.deepEqual(value.execution_selections, {
      node_execution_profile: null,
      security_profile: null,
      authority_profile: null,
    });
    assert.deepEqual(value.implementation_authority, {
      status: "UNRESOLVED",
      blocker_id: "B-CODING-AUTHORITY-01",
      implementation_authority_granted: false,
      dispatch_status: "NO_DISPATCH",
    });
  }
  if (stage === "E1") return;

  const evidenceRevision = commitFor(M1_01B_CONTEXT_PATH);
  assertAncestor(authorityRevision, evidenceRevision);
  assertJsonSet(
    M1_01B_STATE_DIRECTORY,
    buildM1_01BStateRecords(normativeRevision, authorityRevision),
  );
  const context = readJson(M1_01B_CONTEXT_PATH);
  assert.equal(context.curve_revision, normativeRevision);
  assert.ok(context.entries.every(({ revision }) => revision === normativeRevision));
  const descriptors = describeM1_01BStatePublications(normativeRevision);
  assert.equal(descriptors.length, 17);
  assert.equal(descriptors.filter(({ subjectType }) => subjectType === "POLICY").length, 7);
  assert.ok(
    descriptors
      .filter(({ subjectType }) => subjectType === "POLICY")
      .every(({ state }) => state === "PROPOSED"),
  );
  if (stage === "E2") return;

  const catalogRevision = commitFor(M1_01B_SOURCE_CATALOG_PATH);
  assertAncestor(evidenceRevision, catalogRevision);
  assert.deepEqual(
    readJson(M1_01B_SOURCE_CATALOG_PATH),
    buildM1_01BSourceCatalog(normativeRevision, evidenceRevision),
  );
  if (stage === "C") return;

  const packetRevision = firstCommitFor(M1_01B_PACKET_PATH);
  const head = git(["rev-parse", "HEAD"]);
  assertPacketPublicationCheckout({
    head,
    packetRevision,
    packetPathRevision: commitFor(M1_01B_PACKET_PATH),
    packetRevisionIsAncestor: isAncestor(packetRevision, head),
  });
  assertAncestor(catalogRevision, packetRevision);
  const packet = readJson(M1_01B_PACKET_PATH);
  assert.deepEqual(
    packet,
    buildM1_01BPublishedPacket(normativeRevision, evidenceRevision, catalogRevision),
  );
  validateCodingAgentTaskPacketSemantics(packet);
  assert.equal(packet.status, "BLOCKED");
  assert.deepEqual(packet.blockers.map(({ blocker_id }) => blocker_id), [
    "B-CODING-TOOLS-01",
    "B-CODING-AUTHORITY-01",
  ]);
  const authorityBlocker = packet.blockers.find(
    ({ blocker_id }) => blocker_id === "B-CODING-AUTHORITY-01",
  );
  assert.match(authorityBlocker.summary, /NO_DISPATCH/u);
  assert.match(
    `${authorityBlocker.summary} ${authorityBlocker.required_evidence}`,
    /implementation_authority_granted:false/u,
  );
  assert.ok(packet.commands.every(({ availability }) => availability === "PLANNED"));
  assert.deepEqual(
    packet.commands.find(({ id }) => id === "CMD-SECURITY").argv,
    ["codeql", "UNRESOLVED"],
  );
  assert.ok(
    [
      packet.data_policy,
      packet.model_policy,
      packet.tool_policy,
      packet.sandbox_policy,
      packet.budget,
      packet.external_effects,
      packet.rollback,
    ].every(({ status }) => status === "PROPOSED"),
  );

  const targetRoot = "/Users/federico.ocampo/Development/tools/project_management/plane";
  if (existsSync(targetRoot)) {
    const evidence = validateCodingAgentTaskPacketEvidence(packet, {
      resolveReference: (reference) => execFileSync(
        "git",
        [
          "-C",
          reference.repository === "TARGET" ? targetRoot : M1_01B_REPOSITORY_ROOT,
          "show",
          `${reference.revision}:${reference.path}`,
        ],
      ),
    });
    assert.equal(evidence.stateRecordCount, 17);
    assert.equal(evidence.contextEntryCount, context.entries.length);
  }
});
