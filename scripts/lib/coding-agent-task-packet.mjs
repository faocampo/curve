import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { isIP } from "node:net";
import {
  basename,
  delimiter,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { posix } from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { digestContextEntries } from "./context-pack.mjs";

const CODING_AGENT_TASK_PACKET_SCHEMA = JSON.parse(
  readFileSync(
    new URL(
      "../../contracts/schemas/coding-agent-task-packet.schema.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const TASK_PACKET_SCHEMA_VALIDATOR = new Ajv2020({
  allErrors: true,
  ownProperties: true,
  strict: false,
});
addFormats(TASK_PACKET_SCHEMA_VALIDATOR);
const validateTaskPacketSchema = TASK_PACKET_SCHEMA_VALIDATOR.compile(
  CODING_AGENT_TASK_PACKET_SCHEMA,
);

const MANDATORY_COMMAND_PHASES = Object.freeze([
  "LINT",
  "BUILD",
  "TEST",
  "SECURITY",
  "LOCAL_RUN",
]);
const CONTRACT_CATEGORIES = Object.freeze([
  "API",
  "SCHEMA",
  "EVENT",
  "WORKFLOW",
  "POLICY",
  "PERSISTENCE",
  "MIGRATION",
]);
const REQUIRED_GOVERNANCE_ROLES = Object.freeze([
  "PRD",
  "ARCHITECTURE",
  "ADR",
  "TECHNICAL_PLAN",
]);
const POLICY_FIELDS = Object.freeze([
  "data_policy",
  "model_policy",
  "tool_policy",
  "sandbox_policy",
  "budget",
  "external_effects",
  "rollback",
]);
const VCS_EFFECT_TYPES = new Set([
  "PUSH_BRANCH",
  "CREATE_DRAFT_PR",
  "LINK_VCS_REFERENCE",
]);
const SHELL_WRAPPERS = new Set([
  "sh",
  "bash",
  "dash",
  "zsh",
  "fish",
  "cmd",
  "cmd.exe",
  "powershell",
  "powershell.exe",
  "pwsh",
  "env",
]);
const SHELL_OPERATOR_PATTERN = /(?:&&|\|\||[;|<>`]|\$\(|\$\{|[\r\n])/u;
const TOOL_KIND_EXECUTABLE = Object.freeze({
  PNPM_PACKAGE_MANAGER: "pnpm",
  NPM_PACKAGE_MANAGER: "npm",
  YARN_PACKAGE_MANAGER: "yarn",
  CODEQL_ANALYZER: "codeql",
  GIT_READ_ONLY: "git",
  GH_READ_ONLY: "gh",
  DOCKER_LOCAL: "docker",
  NODE_RUNTIME: "node",
  PYTHON_RUNTIME: "python",
});
const SAFE_PACKAGE_SCRIPTS = new Set([
  "build", "check", "dev", "lint", "start", "test", "typecheck",
]);
const FORBIDDEN_PACKAGE_SCRIPT_PATTERN = /(?:^|[-_:])(?:deploy|publish|release)(?:$|[-_:])/iu;
const SAFE_GIT_READ_SUBCOMMANDS = new Set([
  "cat-file", "diff", "diff-tree", "for-each-ref", "grep", "log",
  "ls-files", "ls-tree", "merge-base", "rev-list", "rev-parse", "show",
  "show-ref", "status",
]);
const GIT_DIFF_READ_OPTIONS = Object.freeze([
  "--cached", "--staged", "--merge-base", "--stat", "--numstat",
  "--shortstat", "--summary", "--patch", "-p", "-u", "--raw",
  "--patch-with-raw", "--name-only", "--name-status", "--check",
  "--full-index", "--binary", "--abbrev", "--no-abbrev", "--no-color",
  "--color", "--no-prefix", "--default-prefix", "--relative", "--minimal",
  "--patience", "--histogram", "--word-diff", "--exit-code", "--quiet",
  "--ignore-submodules=all", "--ignore-space-at-eol",
  "--ignore-space-change", "-b", "--ignore-all-space", "-w",
  "--ignore-blank-lines", "--indent-heuristic", "--no-indent-heuristic",
  "--no-ext-diff", "--no-textconv",
]);
const GIT_DIFF_READ_OPTION_PATTERNS = Object.freeze([
  /^-U[0-9]+$/u,
  /^--unified=[0-9]+$/u,
  /^--abbrev=[0-9]+$/u,
  /^--color=(?:always|auto|never)$/u,
  /^--diff-filter=[ACDMRTUXB*]+$/u,
  /^--find-renames(?:=[0-9]+%?)?$/u,
  /^--find-copies(?:=[0-9]+%?)?$/u,
  /^--word-diff=(?:color|plain|porcelain|none)$/u,
]);
const GIT_HISTORY_READ_OPTIONS = Object.freeze([
  "--all", "--branches", "--tags", "--remotes", "--decorate",
  "--no-decorate", "--oneline", "--graph", "--first-parent", "--merges",
  "--no-merges", "--reverse", "--topo-order", "--date-order",
  "--author-date-order", "--parents", "--children", "--boundary",
  "--left-right", "--cherry-mark", "--cherry-pick", "--full-history",
  "--simplify-merges", "--simplify-by-decoration", "--dense", "--sparse",
  "--remove-empty", "--name-only", "--name-status", "--stat", "--shortstat",
  "--no-patch", "-s", "--patch", "-p", "--no-color",
  "--no-show-signature", "--no-use-mailmap",
]);
const GIT_HISTORY_READ_OPTION_PATTERNS = Object.freeze([
  /^-n[1-9][0-9]*$/u,
  /^--max-count=[1-9][0-9]*$/u,
  /^--skip=[0-9]+$/u,
  /^--(?:branches|tags|remotes)=[A-Za-z0-9._/*?\[\]-]+$/u,
  /^--(?:since|after|until|before|author|committer|grep)=[A-Za-z0-9._@:+/ ,=-]+$/u,
  /^--date=(?:relative|local|iso|iso-strict|rfc|short|raw|human|unix)$/u,
  /^--pretty=(?:oneline|short|medium|full|fuller|reference|email|raw)$/u,
  /^--abbrev-commit$/u,
]);

function gitReadGrammar({ exact = [], patterns = [], minOperands = 0, maxOperands = 64 }) {
  return Object.freeze({
    exact: new Set(exact),
    patterns: Object.freeze(patterns),
    minOperands,
    maxOperands,
  });
}

const GIT_READ_ONLY_GRAMMARS = Object.freeze({
  "cat-file": gitReadGrammar({
    exact: ["-e", "-p", "-t", "-s", "--allow-unknown-type"],
    minOperands: 1,
    maxOperands: 1,
  }),
  diff: gitReadGrammar({
    exact: GIT_DIFF_READ_OPTIONS,
    patterns: GIT_DIFF_READ_OPTION_PATTERNS,
  }),
  "diff-tree": gitReadGrammar({
    exact: [
      ...GIT_DIFF_READ_OPTIONS,
      "-r", "-t", "--root", "--no-commit-id", "--commit-id", "--cc",
      "-c", "-m", "--first-parent",
    ],
    patterns: GIT_DIFF_READ_OPTION_PATTERNS,
    minOperands: 1,
  }),
  "for-each-ref": gitReadGrammar({
    exact: ["--ignore-case", "--omit-empty", "--include-root-refs"],
    patterns: [
      /^--count=[1-9][0-9]*$/u,
      /^--sort=-?(?:refname|objectname|authordate|committerdate|creatordate|taggerdate|version:refname)$/u,
      /^--format=%\((?:refname(?::short)?|objectname|objecttype|upstream:short|HEAD)\)$/u,
      /^--color=(?:always|auto|never)$/u,
      /^--(?:points-at|merged|no-merged|contains|no-contains)=[A-Za-z0-9._/@{}^~:+\-]+$/u,
    ],
  }),
  grep: gitReadGrammar({
    exact: [
      "-n", "--line-number", "-l", "--files-with-matches", "-L",
      "--files-without-match", "-i", "--ignore-case", "-w", "--word-regexp",
      "-v", "--invert-match", "-F", "--fixed-strings", "-E",
      "--extended-regexp", "-G", "--basic-regexp", "-P", "--perl-regexp",
      "--all-match", "--break", "--heading", "--full-name", "--cached",
      "--untracked", "--exclude-standard", "--no-exclude-standard", "--text",
      "-a", "-I", "--ignore-binary",
    ],
    patterns: [
      /^-[ABC][0-9]+$/u,
      /^--(?:after-context|before-context|context|threads)=[0-9]+$/u,
      /^--max-depth=-?[0-9]+$/u,
    ],
    minOperands: 1,
  }),
  log: gitReadGrammar({
    exact: [...GIT_HISTORY_READ_OPTIONS, ...GIT_DIFF_READ_OPTIONS],
    patterns: [...GIT_HISTORY_READ_OPTION_PATTERNS, ...GIT_DIFF_READ_OPTION_PATTERNS],
  }),
  "ls-files": gitReadGrammar({
    exact: [
      "-c", "--cached", "-d", "--deleted", "-m", "--modified", "-o",
      "--others", "-i", "--ignored", "-s", "--stage", "-u", "--unmerged",
      "-k", "--killed", "--directory", "--no-empty-directory", "--eol",
      "--deduplicate", "--error-unmatch", "-t", "-v", "-f", "-z",
      "--full-name", "--sparse", "--resolve-undo", "--exclude-standard",
    ],
    patterns: [],
  }),
  "ls-tree": gitReadGrammar({
    exact: [
      "-r", "-d", "-t", "-l", "--name-only", "--name-status",
      "--object-only", "--full-name", "--full-tree", "-z", "--abbrev",
    ],
    patterns: [
      /^--abbrev=[0-9]+$/u,
    ],
    minOperands: 1,
  }),
  "merge-base": gitReadGrammar({
    exact: ["--all", "--octopus", "--independent", "--is-ancestor", "--fork-point"],
    minOperands: 1,
  }),
  "rev-list": gitReadGrammar({
    exact: [
      ...GIT_HISTORY_READ_OPTIONS,
      "--objects", "--objects-edge", "--objects-edge-aggressive", "--disk-usage",
      "--count", "--timestamp", "--header",
    ],
    patterns: GIT_HISTORY_READ_OPTION_PATTERNS,
  }),
  "rev-parse": gitReadGrammar({
    exact: [
      "--verify", "-q", "--quiet", "--short", "--symbolic",
      "--symbolic-full-name", "--abbrev-ref", "--show-toplevel", "--show-prefix",
      "--show-cdup", "--show-superproject-working-tree", "--git-dir",
      "--git-common-dir", "--is-inside-git-dir", "--is-inside-work-tree",
      "--is-bare-repository", "--is-shallow-repository", "--show-object-format",
      "--show-ref-format", "--end-of-options", "--revs-only", "--no-revs",
      "--flags", "--no-flags",
    ],
    patterns: [
      /^--short=[0-9]+$/u,
      /^--abbrev-ref=(?:strict|loose)$/u,
      /^--path-format=(?:absolute|relative)$/u,
      /^--show-object-format=(?:storage|input|output)$/u,
    ],
  }),
  show: gitReadGrammar({
    exact: [...GIT_HISTORY_READ_OPTIONS, ...GIT_DIFF_READ_OPTIONS],
    patterns: [...GIT_HISTORY_READ_OPTION_PATTERNS, ...GIT_DIFF_READ_OPTION_PATTERNS],
  }),
  "show-ref": gitReadGrammar({
    exact: [
      "--head", "--branches", "--tags", "--dereference", "-d", "--hash",
      "-s", "--verify", "--exists", "--exclude-existing", "--quiet", "-q",
    ],
    patterns: [/^--abbrev=[0-9]+$/u, /^--hash=[0-9]+$/u],
  }),
  status: gitReadGrammar({
    exact: [
      "--short", "-s", "--porcelain", "--branch", "-b", "--show-stash",
      "--ahead-behind", "--no-ahead-behind", "--untracked-files", "-uno",
      "-unormal", "-uall", "--ignored", "--renames", "--no-renames", "-z",
      "--column", "--no-column", "--ignore-submodules=all",
    ],
    patterns: [
      /^--porcelain=(?:v1|v2)$/u,
      /^--untracked-files=(?:no|normal|all)$/u,
      /^--ignored=(?:traditional|matching|no)$/u,
      /^--find-renames(?:=[0-9]+%?)?$/u,
      /^--column=(?:always|never|auto|column|row|plain|dense|nodense)(?:,[a-z]+)*$/u,
    ],
  }),
});
const GIT_DIFF_HELPER_SENSITIVE_SUBCOMMANDS = new Set([
  "diff",
  "diff-tree",
  "log",
  "show",
]);
const GIT_IDENTITY_HELPER_SENSITIVE_SUBCOMMANDS = new Set(["log", "show"]);
const GIT_SUBMODULE_SENSITIVE_SUBCOMMANDS = new Set([
  "diff",
  "diff-tree",
  "log",
  "show",
  "status",
]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const TRUSTED_GIT_EXECUTABLE = "/usr/bin/git";
const GIT_ENVIRONMENT = Object.freeze({
  HOME: "/nonexistent",
  LANG: "C",
  LC_ALL: "C",
  PATH: "/usr/bin:/bin",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_SYSTEM: "/dev/null",
  GIT_NO_LAZY_FETCH: "1",
  GIT_NO_REPLACE_OBJECTS: "1",
  GIT_OPTIONAL_LOCKS: "0",
  GIT_TERMINAL_PROMPT: "0",
});
const UNSAFE_LOCAL_GIT_CONFIG = /^(?:alias\.|include(?:if)?\.|url\.|credential\.|http\.|filter\.|submodule\.|protocol\.|gpg\.|mailmap\.|pager\.|remote\..*\.(?:uploadpack|receivepack|proxy|promisor|partialclonefilter)$|extensions\.worktreeconfig$|log\.(?:showsignature|mailmap)$|interactive\.difffilter$|core\.(?:hookspath|sshcommand|fsmonitor|askpass|attributesfile|excludesfile|editor|pager)$|diff\.(?:external$|.*\.(?:command|textconv)$))/iu;

function sha256(contents) {
  return `sha256:${createHash("sha256").update(contents).digest("hex")}`;
}

export function canonicalizeCodingAgentJson(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalizeCodingAgentJson(entry));
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalizeCodingAgentJson(value[key])]),
    );
  }
  return value;
}

function canonicalJsonString(value) {
  return JSON.stringify(canonicalizeCodingAgentJson(value));
}

function assertExact(actual, expected, message) {
  if (canonicalJsonString(actual) !== canonicalJsonString(expected)) {
    throw new Error(message);
  }
}

function assertUnique(values, label) {
  const observed = new Set();
  for (const value of values) {
    if (observed.has(value)) throw new Error(`duplicate ${label} ${value}`);
    observed.add(value);
  }
}

function ensureBuffer(value, label) {
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === "string") return Buffer.from(value);
  if (value?.contents !== undefined) return ensureBuffer(value.contents, label);
  throw new Error(`${label} resolver did not return bytes`);
}

function parseJsonBytes(contents, label) {
  try {
    return JSON.parse(contents.toString("utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

function assertObjectWithExactKeys(value, keys, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  assertExact(
    Object.keys(value).sort(),
    [...keys].sort(),
    `${label} has missing or unsupported properties`,
  );
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || !/\S/u.test(value)) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertStringList(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  for (const entry of value) assertNonEmptyString(entry, `${label} entry`);
  assertUnique(value, `${label} entry`);
}

function assertEnumValue(value, allowed, label) {
  if (!allowed.includes(value)) {
    throw new Error(`${label} must be one of ${allowed.join(", ")}`);
  }
}

function assertCodingAgentTaskPacketSchema(packet) {
  if (validateTaskPacketSchema(packet)) return;
  const details = TASK_PACKET_SCHEMA_VALIDATOR.errorsText(
    validateTaskPacketSchema.errors,
    { separator: "; " },
  );
  throw new Error(`task packet violates the closed JSON Schema: ${details}`);
}

export function computeCodingAgentTaskPacketDigest(packet) {
  const payload = structuredClone(packet);
  // packet_digest is necessarily outside its own digest. Project status is the
  // sole mutable packet payload field excluded because Project status is visual
  // metadata and grants no implementation authority.
  delete payload.packet_digest;
  if (payload.project_tracking) delete payload.project_tracking.status;
  return sha256(Buffer.from(canonicalJsonString(payload)));
}

export function sealCodingAgentTaskPacket(packet) {
  packet.packet_digest = computeCodingAgentTaskPacketDigest(packet);
  return packet;
}

export function computeCodingAgentStateApprovalSubjectDigest(approvalSubject) {
  return sha256(Buffer.from(canonicalJsonString(approvalSubject)));
}

export const computeCodingAgentApprovalSubjectDigest =
  computeCodingAgentStateApprovalSubjectDigest;

export function resolveCodingAgentJsonPointer(document, pointer) {
  if (pointer === "") return document;
  if (typeof pointer !== "string" || !pointer.startsWith("/")) {
    throw new Error(`invalid JSON Pointer ${String(pointer)}`);
  }
  let current = document;
  for (const rawToken of pointer.slice(1).split("/")) {
    if (/~(?:[^01]|$)/u.test(rawToken)) {
      throw new Error(`invalid JSON Pointer escape in ${pointer}`);
    }
    const token = rawToken.replace(/~1/gu, "/").replace(/~0/gu, "~");
    if (
      current === null ||
      typeof current !== "object" ||
      !Object.prototype.hasOwnProperty.call(current, token)
    ) {
      throw new Error(`JSON Pointer ${pointer} does not resolve at token ${token}`);
    }
    current = current[token];
  }
  return current;
}

function normalizeRepositoryPath(path, label) {
  if (typeof path !== "string" || path.length === 0 || isAbsolute(path)) {
    throw new Error(`${label} must be a non-empty repository-relative path`);
  }
  if (path.includes("\0") || path.includes("\\") || /[\r\n]/u.test(path)) {
    throw new Error(`${label} contains an unsafe path character`);
  }
  const normalized = posix.normalize(path);
  if (
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.startsWith("/") ||
    (normalized !== path && !(path === "." && normalized === "."))
  ) {
    throw new Error(`${label} escapes or is not a canonical repository path`);
  }
  return normalized;
}

function pathContains(parent, child) {
  return parent === "." || child === parent || child.startsWith(`${parent}/`);
}

function assertFilesystemContainment(root, path, label) {
  const rootReal = realpathSync(root);
  const candidate = resolve(rootReal, path);
  const candidateReal = realpathSync(candidate);
  const relation = relative(rootReal, candidateReal);
  if (relation === ".." || relation.startsWith(`..${sep}`) || isAbsolute(relation)) {
    throw new Error(`${label} resolves outside its repository root`);
  }
  if (!lstatSync(candidateReal).isFile()) throw new Error(`${label} is not a file`);
  return candidateReal;
}

function assertCheckoutPathBoundary(
  root,
  repositoryPath,
  label,
  { mustExistDirectory = false } = {},
) {
  const normalized = normalizeRepositoryPath(repositoryPath, label);
  const rootReal = realpathSync(root);
  let current = rootReal;
  const components = normalized === "." ? [] : normalized.split("/");
  let missing = false;
  for (const component of components) {
    const candidate = resolve(current, component);
    if (!existsSync(candidate)) {
      missing = true;
      current = candidate;
      continue;
    }
    current = lstatSync(candidate).isSymbolicLink()
      ? realpathSync(candidate)
      : candidate;
    const relation = relative(rootReal, current);
    if (relation === ".." || relation.startsWith(`..${sep}`) || isAbsolute(relation)) {
      throw new Error(`${label} traverses a symlink outside the target repository`);
    }
  }
  const lexicalRelation = relative(rootReal, resolve(rootReal, normalized));
  if (
    lexicalRelation === ".." ||
    lexicalRelation.startsWith(`..${sep}`) ||
    isAbsolute(lexicalRelation)
  ) {
    throw new Error(`${label} escapes the target repository`);
  }
  if (mustExistDirectory) {
    if (missing || !existsSync(current) || !statSync(current).isDirectory()) {
      throw new Error(`${label} must resolve to an existing directory`);
    }
  }
  return normalized;
}

function referenceKey(reference) {
  return [
    reference.repository,
    reference.revision,
    reference.path,
    reference.content_digest,
  ].join("\0");
}

function addReference(references, seen, reference) {
  if (!reference) return;
  const key = referenceKey(reference);
  if (!seen.has(key)) {
    seen.add(key);
    references.push(reference);
  }
}

function projectionWithout(value, excludedKeys) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !excludedKeys.includes(key)),
  );
}

function approvalSubject(workspaceId, subjectType, subjectId, state, claim) {
  return {
    workspace_id: workspaceId,
    subject_type: subjectType,
    subject_id: subjectId,
    state,
    claim,
  };
}

function assertedSubjectId(binding) {
  return binding?.assertions?.find((assertion) => assertion.pointer === "/subject_id")
    ?.expected;
}

export function collectCodingAgentTaskPacketStateBindings(packet) {
  const bindings = [];
  for (const document of packet.curve_binding?.governance_documents ?? []) {
    const claim = projectionWithout(document, ["approval_binding"]);
    bindings.push({
      binding: document.approval_binding,
      subjectType: "GOVERNANCE_DOCUMENT",
      subjectId: document.document_id,
      state: document.status,
      label: `governance document ${document.document_id}`,
      approvalSubject: approvalSubject(
        packet.workspace_id,
        "GOVERNANCE_DOCUMENT",
        document.document_id,
        document.status,
        claim,
      ),
    });
  }
  for (const dependency of packet.dependencies ?? []) {
    const claim = projectionWithout(dependency, ["state_binding"]);
    bindings.push({
      binding: dependency.state_binding,
      subjectType: "DEPENDENCY",
      subjectId: dependency.id,
      state: dependency.satisfaction,
      label: `dependency ${dependency.id}`,
      approvalSubject: approvalSubject(
        packet.workspace_id,
        "DEPENDENCY",
        dependency.id,
        dependency.satisfaction,
        claim,
      ),
    });
  }
  for (const decision of packet.decisions ?? []) {
    const claim = projectionWithout(decision, ["state_binding"]);
    bindings.push({
      binding: decision.state_binding,
      subjectType: "DECISION",
      subjectId: decision.decision_id,
      state: decision.status,
      label: `decision ${decision.decision_id}`,
      approvalSubject: approvalSubject(
        packet.workspace_id,
        "DECISION",
        decision.decision_id,
        decision.status,
        claim,
      ),
    });
  }
  for (const applicability of packet.contract_applicability ?? []) {
    if (applicability.applicability !== "APPLICABLE" || !applicability.contract) continue;
    const claim = projectionWithout(applicability.contract, ["approval_binding"]);
    bindings.push({
      binding: applicability.contract.approval_binding,
      subjectType: "CONTRACT",
      subjectId: applicability.contract.contract_id,
      state: applicability.contract.status,
      label: `contract ${applicability.contract.contract_id}`,
      approvalSubject: approvalSubject(
        packet.workspace_id,
        "CONTRACT",
        applicability.contract.contract_id,
        applicability.contract.status,
        claim,
      ),
    });
  }
  for (const contract of packet.external_effects?.controller_contracts ?? []) {
    const claim = projectionWithout(contract, ["approval_binding"]);
    bindings.push({
      binding: contract.approval_binding,
      subjectType: "CONTRACT",
      subjectId: contract.contract_id,
      state: contract.status,
      label: `controller contract ${contract.contract_id}`,
      approvalSubject: approvalSubject(
        packet.workspace_id,
        "CONTRACT",
        contract.contract_id,
        contract.status,
        claim,
      ),
    });
  }
  for (const field of POLICY_FIELDS) {
    const policy = packet[field];
    if (!policy) continue;
    const claim = projectionWithout(policy, ["state_binding"]);
    bindings.push({
      binding: policy.state_binding,
      subjectType: "POLICY",
      subjectId: policy.policy_id,
      state: policy.status,
      label: `policy ${policy.policy_id}`,
      approvalSubject: approvalSubject(
        packet.workspace_id,
        "POLICY",
        policy.policy_id,
        policy.status,
        claim,
      ),
    });
  }
  if (packet.ux_evidence) {
    const subjectId = assertedSubjectId(packet.ux_evidence) ?? packet.work_package_id;
    const claim = {
      packet_id: packet.packet_id,
      work_package_id: packet.work_package_id,
      user_facing: packet.user_facing,
    };
    bindings.push({
      binding: packet.ux_evidence,
      subjectType: "UX",
      subjectId,
      state: "APPROVED",
      label: `UX evidence for ${packet.work_package_id}`,
      approvalSubject: approvalSubject(
        packet.workspace_id,
        "UX",
        subjectId,
        "APPROVED",
        claim,
      ),
    });
  }
  return bindings;
}

export function collectCodingAgentTaskPacketEvidenceReferences(packet) {
  const references = [];
  const seen = new Set();
  if (packet.source_catalog_binding?.resolution === "RESOLVED") {
    addReference(references, seen, packet.source_catalog_binding.evidence);
  }
  if (packet.curve_binding?.context_pack?.resolution === "RESOLVED") {
    addReference(references, seen, packet.curve_binding.context_pack.manifest);
  }
  for (const document of packet.curve_binding?.governance_documents ?? []) {
    addReference(references, seen, document);
  }
  for (const binding of collectCodingAgentTaskPacketStateBindings(packet)) {
    if (binding.binding?.resolution === "RESOLVED") {
      addReference(references, seen, binding.binding.evidence);
    }
  }
  for (const test of packet.requirements?.acceptance_tests ?? []) {
    addReference(references, seen, test.trace_evidence);
  }
  for (const instruction of packet.repository_instructions ?? []) {
    addReference(references, seen, instruction);
  }
  for (const applicability of packet.contract_applicability ?? []) {
    if (applicability.applicability === "APPLICABLE") {
      addReference(references, seen, applicability.contract);
    }
  }
  for (const contract of packet.external_effects?.controller_contracts ?? []) {
    addReference(references, seen, contract);
    if (contract.approval_binding?.resolution === "RESOLVED") {
      addReference(references, seen, contract.approval_binding.evidence);
    }
  }
  return references;
}

function collectCodingAgentTaskPacketNormativeReferences(packet) {
  const references = [];
  const seen = new Set();
  for (const document of packet.curve_binding?.governance_documents ?? []) {
    addReference(references, seen, document);
  }
  for (const test of packet.requirements?.acceptance_tests ?? []) {
    addReference(references, seen, test.trace_evidence);
  }
  for (const instruction of packet.repository_instructions ?? []) {
    addReference(references, seen, instruction);
  }
  for (const applicability of packet.contract_applicability ?? []) {
    if (applicability.applicability === "APPLICABLE") {
      addReference(references, seen, applicability.contract);
    }
  }
  for (const contract of packet.external_effects?.controller_contracts ?? []) {
    addReference(references, seen, contract);
  }
  return references;
}

export function projectCodingAgentSourceCatalogRecord(packet) {
  return {
    work_package_id: packet.work_package_id,
    packet_id: packet.packet_id,
    workspace_id: packet.workspace_id,
    packet_projection_digest:
      computeCodingAgentSourceCatalogPacketProjectionDigest(packet),
    size: packet.size,
    user_facing: packet.user_facing,
    risk_tier: packet.objective.risk_tier,
    repository: {
      url: packet.repository.url,
      target_branch: packet.repository.target_branch,
    },
    requirements: {
      functional_requirement_ids: [...packet.requirements.functional_requirement_ids],
      non_functional_requirement_ids: [
        ...packet.requirements.non_functional_requirement_ids,
      ],
    },
    dependencies: packet.dependencies.map((dependency) => dependency.id),
    decisions: packet.decisions.map((decision) => decision.decision_id),
    project_tracking: {
      project_number: packet.project_tracking.project_number,
      item_node_id: packet.project_tracking.item_node_id,
      tracking_kind: packet.project_tracking.tracking_kind,
    },
    commands: packet.commands.map((command) => ({
      id: command.id,
      phase: command.phase,
      argv: [...command.argv],
      working_directory: command.working_directory,
      timeout_seconds: command.timeout_seconds,
      availability: command.availability,
      tool_id: command.tool_id,
      network_destination_ids: [...command.network_destination_ids],
      external_effect_ids: [...command.external_effect_ids],
    })),
    contract_applicability: packet.contract_applicability.map((entry) => ({
      category: entry.category,
      applicability: entry.applicability,
      contract_id: entry.contract?.contract_id ?? null,
    })),
  };
}

export const buildCodingAgentSourceCatalogProjection =
  projectCodingAgentSourceCatalogRecord;

export function computeCodingAgentSourceCatalogPacketProjectionDigest(packet) {
  const projection = structuredClone(packet);
  delete projection.packet_digest;
  delete projection.source_catalog_binding;
  if (projection.project_tracking) delete projection.project_tracking.status;
  return sha256(Buffer.from(canonicalJsonString(projection)));
}

export function buildCodingAgentImplementationAuthorizationBinding(packet) {
  return {
    workspace_id: packet.workspace_id,
    packet_id: packet.packet_id,
    packet_version: packet.packet_version,
    packet_digest: packet.packet_digest,
    curve_revision: packet.curve_binding.curve_revision,
    context_digest: packet.curve_binding.context_pack.context_digest,
    repository_url: packet.repository.url,
    target_branch: packet.repository.target_branch,
    base_sha: packet.repository.base_sha,
  };
}

export function validateCodingAgentImplementationAuthorizationBinding(
  packet,
  authorizationBinding,
) {
  assertExact(
    authorizationBinding,
    buildCodingAgentImplementationAuthorizationBinding(packet),
    "implementation authorization does not exactly bind the packet workspace and revision tuple",
  );
  return { workspaceId: packet.workspace_id, packetId: packet.packet_id };
}

function assertUnresolvedBinding(binding, blockerIds, label) {
  if (!binding || binding.resolution !== "REQUIRED_UNRESOLVED") return;
  if (!blockerIds.has(binding.unresolved_blocker_id)) {
    throw new Error(
      `${label} references missing blocker ${String(binding.unresolved_blocker_id)}`,
    );
  }
}

function decisionFor(packet, decisionId, governs) {
  return packet.decisions.find(
    (decision) =>
      decision.decision_id === decisionId &&
      decision.status === "DECIDED" &&
      decision.governs.includes(governs),
  );
}

function requireDecision(packet, decisionId, governs, reason) {
  if (!decisionFor(packet, decisionId, governs)) {
    throw new Error(
      `${reason} requires ${decisionId} with status DECIDED governing ${governs}`,
    );
  }
}

function dependencyFor(packet, dependencyId) {
  return packet.dependencies.find(
    (dependency) =>
      dependency.id === dependencyId && dependency.satisfaction === "SATISFIED",
  );
}

function requireDependency(packet, dependencyId, reason) {
  if (!dependencyFor(packet, dependencyId)) {
    throw new Error(`${reason} requires ${dependencyId} with satisfaction SATISFIED`);
  }
}

function parseIpv4(address, label) {
  const parts = address.split(".");
  if (
    parts.length !== 4 ||
    parts.some(
      (part) =>
        !/^(?:0|[1-9][0-9]{0,2})$/u.test(part) || Number(part) > 255,
    )
  ) {
    throw new Error(`${label} has an invalid IPv4 address`);
  }
  return {
    family: 4,
    bits: 32,
    value: parts.reduce((result, part) => (result << 8n) | BigInt(part), 0n),
    canonical: parts.map((part) => String(Number(part))).join("."),
  };
}

function parseIpv6(address, label) {
  if ((address.match(/::/gu) ?? []).length > 1) {
    throw new Error(`${label} has an invalid IPv6 address`);
  }
  let normalized = address.toLowerCase();
  if (normalized.includes(".")) {
    const finalSeparator = normalized.lastIndexOf(":");
    if (finalSeparator < 0) throw new Error(`${label} has an invalid embedded IPv4 address`);
    const ipv4 = parseIpv4(normalized.slice(finalSeparator + 1), label);
    const high = Number((ipv4.value >> 16n) & 0xffffn).toString(16);
    const low = Number(ipv4.value & 0xffffn).toString(16);
    normalized = `${normalized.slice(0, finalSeparator)}:${high}:${low}`;
  }
  const hasCompression = normalized.includes("::");
  const [leftText, rightText = ""] = normalized.split("::");
  const left = leftText === "" ? [] : leftText.split(":");
  const right = rightText === "" ? [] : rightText.split(":");
  const groups = [...left, ...right];
  if (
    groups.some((group) => !/^[0-9a-f]{1,4}$/u.test(group)) ||
    (!hasCompression && groups.length !== 8) ||
    (hasCompression && groups.length >= 8)
  ) {
    throw new Error(`${label} has an invalid IPv6 address`);
  }
  const zeros = hasCompression ? 8 - groups.length : 0;
  const expanded = [
    ...left.map((group) => Number.parseInt(group, 16)),
    ...Array.from({ length: zeros }, () => 0),
    ...right.map((group) => Number.parseInt(group, 16)),
  ];
  if (expanded.length !== 8) throw new Error(`${label} has an invalid IPv6 width`);
  const value = expanded.reduce((result, group) => (result << 16n) | BigInt(group), 0n);

  let bestStart = -1;
  let bestLength = 0;
  for (let index = 0; index < expanded.length; ) {
    if (expanded[index] !== 0) {
      index += 1;
      continue;
    }
    let end = index;
    while (end < expanded.length && expanded[end] === 0) end += 1;
    if (end - index > bestLength && end - index >= 2) {
      bestStart = index;
      bestLength = end - index;
    }
    index = end;
  }
  const rendered = expanded.map((group) => group.toString(16));
  let canonical;
  if (bestStart === -1) {
    canonical = rendered.join(":");
  } else {
    const before = rendered.slice(0, bestStart).join(":");
    const after = rendered.slice(bestStart + bestLength).join(":");
    canonical = `${before}::${after}`;
  }
  return { family: 6, bits: 128, value, canonical };
}

function parseIpAddress(address, label) {
  const family = isIP(address);
  if (family === 4) return parseIpv4(address, label);
  if (family === 6) return parseIpv6(address, label);
  throw new Error(`${label} has an invalid IP address`);
}

function cidrRange(address, prefix) {
  const hostBits = BigInt(address.bits - prefix);
  const size = 1n << hostBits;
  const start = (address.value >> hostBits) << hostBits;
  return { family: address.family, start, end: start + size - 1n };
}

function rangesOverlap(left, right) {
  return left.family === right.family && left.start <= right.end && right.start <= left.end;
}

const FORBIDDEN_CIDRS = Object.freeze([
  "0.0.0.0/8",
  "100.64.0.0/10",
  "127.0.0.0/8",
  "169.254.0.0/16",
  "192.0.0.0/24",
  "192.0.2.0/24",
  "198.18.0.0/15",
  "198.51.100.0/24",
  "203.0.113.0/24",
  "224.0.0.0/4",
  "240.0.0.0/4",
  "::/128",
  "::1/128",
  "::ffff:0:0/96",
  "100::/64",
  "2001:db8::/32",
  "fe80::/10",
  "fec0::/10",
  "ff00::/8",
  "fd00:ec2::254/128",
]);

function parseCidr(value, label, { rejectSensitive = true } = {}) {
  if (typeof value !== "string") throw new Error(`${label} is not a CIDR string`);
  const separator = value.lastIndexOf("/");
  if (separator <= 0 || separator === value.length - 1) {
    throw new Error(`${label} is not a valid CIDR`);
  }
  const addressText = value.slice(0, separator);
  const prefixText = value.slice(separator + 1);
  if (!/^(?:0|[1-9][0-9]*)$/u.test(prefixText)) {
    throw new Error(`${label} is not a valid CIDR`);
  }
  const address = parseIpAddress(addressText, label);
  const prefix = Number(prefixText);
  if (prefix < 0 || prefix > address.bits) {
    throw new Error(`${label} prefix exceeds IPv${address.family} width`);
  }
  const range = cidrRange(address, prefix);
  if (range.start !== address.value) throw new Error(`${label} contains non-zero host bits`);
  const canonical = `${address.canonical}/${prefix}`;
  if (canonical !== value) throw new Error(`${label} is not canonical; use ${canonical}`);
  if (rejectSensitive) {
    for (const forbidden of FORBIDDEN_CIDRS) {
      const forbiddenRange = parseCidr(forbidden, "internal forbidden CIDR", {
        rejectSensitive: false,
      }).range;
      if (rangesOverlap(range, forbiddenRange)) {
        throw new Error(`${label} overlaps prohibited sensitive or reserved range ${forbidden}`);
      }
    }
  }
  return { address, prefix, range, canonical };
}

function validateHostDestination(destination) {
  const host = destination.host.toLowerCase();
  if (
    isIP(host) !== 0 ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "metadata" ||
    host.startsWith("metadata.") ||
    host === "169.254.169.254"
  ) {
    throw new Error(
      `network destination ${destination.destination_id} uses prohibited host ${destination.host}`,
    );
  }
  if (destination.host !== host) {
    throw new Error(`network destination ${destination.destination_id} host must be canonical lowercase`);
  }
  if (!Array.isArray(destination.allowed_cidrs) || destination.allowed_cidrs.length === 0) {
    throw new Error(`HOST destination ${destination.destination_id} requires allowed_cidrs`);
  }
  for (const cidr of destination.allowed_cidrs) {
    parseCidr(cidr, `network destination ${destination.destination_id}`);
  }
}

function validateSandbox(packet) {
  const sandbox = packet.sandbox_policy;
  if (sandbox.max_active_attempts !== 1) {
    throw new Error("sandbox max_active_attempts must be exactly 1");
  }
  if (!Number.isInteger(sandbox.max_attempts) || sandbox.max_attempts < 1) {
    throw new Error("sandbox max_attempts must be a positive integer");
  }
  const readOnly = sandbox.read_only_paths.map((path) =>
    normalizeRepositoryPath(path, "sandbox read-only path"),
  );
  const writable = sandbox.writable_paths.map((path) =>
    normalizeRepositoryPath(path, "sandbox writable path"),
  );
  assertUnique(readOnly, "sandbox read-only path");
  assertUnique(writable, "sandbox writable path");
  if (!readOnly.some((path) => path === ".git" || pathContains(path, ".git"))) {
    throw new Error("sandbox read_only_paths must protect .git");
  }
  for (const writablePath of writable) {
    if (writablePath === ".git" || pathContains(writablePath, ".git")) {
      throw new Error(`sandbox writable path ${writablePath} contains .git`);
    }
    for (const readOnlyPath of readOnly) {
      if (
        pathContains(writablePath, readOnlyPath) ||
        pathContains(readOnlyPath, writablePath)
      ) {
        throw new Error(
          `sandbox writable path ${writablePath} overlaps read-only path ${readOnlyPath}`,
        );
      }
    }
  }

  const destinationIds = sandbox.network_destinations.map(
    (destination) => destination.destination_id,
  );
  assertUnique(destinationIds, "network destination ID");
  for (const destination of sandbox.network_destinations) {
    if (destination.kind === "HOST") {
      validateHostDestination(destination);
    } else {
      parseCidr(destination.cidr, `network destination ${destination.destination_id}`);
    }
  }
  if (sandbox.network_mode === "ALLOWLIST") {
    requireDecision(
      packet,
      sandbox.network_policy_decision_id,
      "NETWORK_ALLOWLIST",
      "ALLOWLIST sandbox networking",
    );
  }
  return new Set(destinationIds);
}

function prohibitedClassification(executable, category, reason, extras = {}) {
  return {
    executable,
    category,
    network_capable: false,
    external_mutation: false,
    direct_vcs_mutation: false,
    sandboxed_repository_code: false,
    prohibited_reason: reason,
    ...extras,
  };
}

function assertSafeOpaqueArguments(argv, label) {
  for (const argument of argv) {
    if (
      typeof argument !== "string" ||
      argument.length === 0 ||
      SHELL_OPERATOR_PATTERN.test(argument) ||
      /(?:^|[\\/])\.\.(?:[\\/]|$)/u.test(argument)
    ) {
      throw new Error(`${label} contains an unsafe argument`);
    }
  }
}

function classifyPackageManager(command, tool, executable) {
  const expectedKind = {
    pnpm: "PNPM_PACKAGE_MANAGER",
    npm: "NPM_PACKAGE_MANAGER",
    yarn: "YARN_PACKAGE_MANAGER",
  }[executable];
  if (tool.tool_kind !== expectedKind) {
    return prohibitedClassification(
      executable,
      "PACKAGE_MANAGER",
      `tool kind ${tool.tool_kind} cannot invoke ${executable}`,
    );
  }
  const argv = command.argv;
  let index = 1;
  if (executable === "pnpm") {
    while (
      index < argv.length &&
      /^--filter=[A-Za-z0-9@][A-Za-z0-9@._-]{0,127}$/u.test(argv[index])
    ) {
      index += 1;
    }
  }
  const subcommand = argv[index];
  if (!subcommand) {
    return prohibitedClassification(executable, "PACKAGE_MANAGER", "package-manager subcommand is missing");
  }
  if (["exec", "dlx", "x", "create", "publish", "deploy", "release"].includes(subcommand)) {
    return prohibitedClassification(
      executable,
      "PACKAGE_MANAGER",
      `package-manager subcommand ${subcommand} is not dispatch-safe`,
      { network_capable: true, external_mutation: true },
    );
  }
  if (["install", "i", "ci", "fetch"].includes(subcommand)) {
    const flags = argv.slice(index + 1);
    const supportedOfflineInstall =
      executable === "pnpm" &&
      index === 1 &&
      subcommand === "install" &&
      canonicalJsonString(flags) === canonicalJsonString([
        "--frozen-lockfile",
        "--offline",
        "--ignore-scripts",
      ]);
    if (!supportedOfflineInstall) {
      return prohibitedClassification(
        executable,
        "PACKAGE_MANAGER",
        "only exact pnpm install --frozen-lockfile --offline --ignore-scripts is dispatch-safe",
        { network_capable: !flags.includes("--offline") },
      );
    }
    return prohibitedClassification(executable, "PACKAGE_MANAGER", null, {
      sandboxed_repository_code: true,
    });
  }

  let script = subcommand;
  let scriptArguments = argv.slice(index + 1);
  if (subcommand === "run") {
    script = argv[index + 1];
    scriptArguments = argv.slice(index + 2);
  }
  if (
    !script ||
    !SAFE_PACKAGE_SCRIPTS.has(script) ||
    FORBIDDEN_PACKAGE_SCRIPT_PATTERN.test(script)
  ) {
    return prohibitedClassification(
      executable,
      "PACKAGE_MANAGER",
      `package script ${script ?? "<missing>"} is outside the recognized dispatch grammar`,
    );
  }
  if (scriptArguments.length > 0) {
    const selectors = scriptArguments.slice(1);
    if (
      script !== "test" ||
      scriptArguments[0] !== "--" ||
      selectors.length === 0 ||
      selectors.some((selector) =>
        !/^[A-Za-z0-9@][A-Za-z0-9@._/-]{0,255}$/u.test(selector)
      )
    ) {
      return prohibitedClassification(
        executable,
        "PACKAGE_MANAGER",
        "package scripts accept only repository-local test selectors after exact --",
      );
    }
    try {
      assertSafeOpaqueArguments(selectors, `package script ${script}`);
    } catch (error) {
      return prohibitedClassification(executable, "PACKAGE_MANAGER", error.message);
    }
  }
  return prohibitedClassification(executable, "PACKAGE_MANAGER", null, {
    sandboxed_repository_code: true,
  });
}

function classifyGitReadOnly(command, tool, executable) {
  if (tool.tool_kind !== "GIT_READ_ONLY") {
    return prohibitedClassification(executable, "GIT", `tool kind ${tool.tool_kind} cannot invoke git`);
  }
  if (
    command.argv.slice(1).some((argument) =>
      argument === "-c" ||
      argument.startsWith("-c=") ||
      argument === "--exec-path" ||
      argument.startsWith("--exec-path=") ||
      argument === "--config-env" ||
      argument.startsWith("--config-env=") ||
      argument === "--git-dir" ||
      argument.startsWith("--git-dir=") ||
      argument === "--work-tree" ||
      argument.startsWith("--work-tree=")
    )
  ) {
    return prohibitedClassification(
      executable,
      "GIT",
      "git configuration, alias, exec-path, and alternate-worktree options are prohibited",
      { direct_vcs_mutation: true },
    );
  }
  if (command.argv[1] !== "--no-pager") {
    return prohibitedClassification(
      executable,
      "GIT",
      "git inspection requires the exact global --no-pager control",
    );
  }
  // Git dispatches subcommands case-sensitively and may resolve an unknown
  // spelling through an external git-<subcommand> helper. Keep the approved
  // grammar bound to the exact canonical lowercase command token.
  const subcommand = command.argv[2];
  const grammar = GIT_READ_ONLY_GRAMMARS[subcommand];
  if (!subcommand || !SAFE_GIT_READ_SUBCOMMANDS.has(subcommand) || !grammar) {
    return prohibitedClassification(
      executable,
      "GIT",
      `git subcommand ${subcommand ?? "<missing>"} is outside the recognized read-only grammar`,
      { direct_vcs_mutation: true, external_mutation: true },
    );
  }
  const argumentsAfterSubcommand = command.argv.slice(3);
  try {
    assertSafeOpaqueArguments(argumentsAfterSubcommand, `git ${subcommand}`);
  } catch (error) {
    return prohibitedClassification(executable, "GIT", error.message);
  }
  if (argumentsAfterSubcommand.length > 128) {
    return prohibitedClassification(
      executable,
      "GIT",
      `git ${subcommand} exceeds the bounded read-only argument count`,
    );
  }
  let optionsTerminated = false;
  let operandCount = 0;
  for (const argument of argumentsAfterSubcommand) {
    if (argument.length > 1024 || argument.includes("\0")) {
      return prohibitedClassification(
        executable,
        "GIT",
        `git ${subcommand} contains an unbounded or invalid argument`,
      );
    }
    if (!optionsTerminated && argument === "--") {
      optionsTerminated = true;
      continue;
    }
    if (!optionsTerminated && argument.startsWith("-")) {
      const recognized =
        grammar.exact.has(argument) ||
        grammar.patterns.some((pattern) => pattern.test(argument));
      if (!recognized) {
        return prohibitedClassification(
          executable,
          "GIT",
          `git ${subcommand} option ${argument} is outside its closed read-only grammar`,
        );
      }
      continue;
    }
    if (
      argument.startsWith("/") ||
      argument.startsWith("~") ||
      /^[A-Za-z]:[\\/]/u.test(argument) ||
      /(?:^|[\\/])\.\.(?:[\\/]|$)/u.test(argument) ||
      /(?:^[A-Za-z][A-Za-z0-9+.-]*:\/\/|^[^/\s]+@[^/\s]+:)/u.test(argument)
    ) {
      return prohibitedClassification(
        executable,
        "GIT",
        `git ${subcommand} operand ${argument} escapes the repository-local read boundary`,
      );
    }
    operandCount += 1;
  }
  if (operandCount < grammar.minOperands || operandCount > grammar.maxOperands) {
    return prohibitedClassification(
      executable,
      "GIT",
      `git ${subcommand} requires ${grammar.minOperands}-${grammar.maxOperands} repository-local operands`,
    );
  }
  if (
    GIT_DIFF_HELPER_SENSITIVE_SUBCOMMANDS.has(subcommand) &&
    (!grammar.exact.has("--no-ext-diff") ||
      !argumentsAfterSubcommand.includes("--no-ext-diff") ||
      !grammar.exact.has("--no-textconv") ||
      !argumentsAfterSubcommand.includes("--no-textconv"))
  ) {
    return prohibitedClassification(
      executable,
      "GIT",
      `git ${subcommand} requires exact --no-ext-diff and --no-textconv controls`,
    );
  }
  if (
    GIT_IDENTITY_HELPER_SENSITIVE_SUBCOMMANDS.has(subcommand) &&
    (!argumentsAfterSubcommand.includes("--no-show-signature") ||
      !argumentsAfterSubcommand.includes("--no-use-mailmap"))
  ) {
    return prohibitedClassification(
      executable,
      "GIT",
      `git ${subcommand} requires exact --no-show-signature and --no-use-mailmap controls`,
    );
  }
  if (
    GIT_SUBMODULE_SENSITIVE_SUBCOMMANDS.has(subcommand) &&
    !argumentsAfterSubcommand.includes("--ignore-submodules=all")
  ) {
    return prohibitedClassification(
      executable,
      "GIT",
      `git ${subcommand} requires exact --ignore-submodules=all isolation`,
    );
  }
  return prohibitedClassification(executable, "GIT", null, {
    sandboxed_repository_code: true,
  });
}

function classifyGitHubReadOnly(command, tool, executable) {
  if (tool.tool_kind !== "GH_READ_ONLY") {
    return prohibitedClassification(executable, "GITHUB_CLI", `tool kind ${tool.tool_kind} cannot invoke gh`);
  }
  return prohibitedClassification(
    executable,
    "GITHUB_CLI",
    "GH_READ_ONLY requires a reviewed repository-bound argv, helper, and environment contract",
    { network_capable: true },
  );
}

export function classifyCodingAgentCommand(command, tool = null) {
  if (!Array.isArray(command?.argv) || command.argv.length === 0) {
    throw new Error(`command ${String(command?.id)} has no structured argv`);
  }
  const executable = basename(command.argv[0]);
  if (!tool || typeof tool.tool_kind !== "string") {
    return prohibitedClassification(
      executable,
      "UNKNOWN_TOOL",
      "command lacks an approved recognized tool kind",
    );
  }
  const expectedExecutable = TOOL_KIND_EXECUTABLE[tool.tool_kind];
  if (!expectedExecutable || expectedExecutable !== executable || tool.executable !== executable) {
    return prohibitedClassification(
      executable,
      "TOOL_IDENTITY_MISMATCH",
      `tool kind ${tool.tool_kind} is not bound to executable ${executable}`,
    );
  }
  if (SHELL_WRAPPERS.has(executable)) {
    return prohibitedClassification(executable, "SHELL_WRAPPER", `prohibited shell wrapper ${executable}`);
  }
  if (["pnpm", "npm", "yarn"].includes(executable)) {
    return classifyPackageManager(command, tool, executable);
  }
  if (executable === "git") return classifyGitReadOnly(command, tool, executable);
  if (executable === "gh") return classifyGitHubReadOnly(command, tool, executable);
  if (executable === "codeql") {
    return prohibitedClassification(
      executable,
      "CODEQL_ANALYZER",
      "CODEQL_ANALYZER requires a reviewed no-download path, output, helper, and environment contract",
    );
  }
  if (executable === "docker") {
    return prohibitedClassification(
      executable,
      "LOCAL_CONTAINER_TOOL",
      "DOCKER_LOCAL requires a pinned Compose helper and reviewed argv and environment contract",
    );
  }
  if (executable === "node") {
    return prohibitedClassification(
      executable,
      "NODE_RUNTIME",
      "NODE_RUNTIME requires a repository-contained operand and reviewed preload-free environment contract",
    );
  }
  if (executable === "python") {
    return prohibitedClassification(
      executable,
      "PYTHON_RUNTIME",
      "PYTHON_RUNTIME requires an isolated stdlib binding and reviewed path and environment contract",
    );
  }
  return prohibitedClassification(
    executable,
    "UNRECOGNIZED_INVOCATION",
    `executable ${executable} has no recognized dispatch grammar`,
  );
}

function validateCommands(packet, destinationIds, effectIds) {
  assertUnique(packet.commands.map((command) => command.id), "command ID");
  const phases = new Set(packet.commands.map((command) => command.phase));
  const mandatoryIds = new Map([
    ["CMD-LINT", "LINT"],
    ["CMD-BUILD", "BUILD"],
    ["CMD-TEST", "TEST"],
    ["CMD-SECURITY", "SECURITY"],
    ["CMD-LOCAL-RUN", "LOCAL_RUN"],
  ]);
  for (const phase of MANDATORY_COMMAND_PHASES) {
    if (!phases.has(phase)) {
      throw new Error(`command phases must include mandatory ${phase}`);
    }
  }
  for (const [commandId, phase] of mandatoryIds) {
    const command = packet.commands.find((candidate) => candidate.id === commandId);
    if (!command || command.phase !== phase) {
      throw new Error(`mandatory command ${commandId} must map to phase ${phase}`);
    }
  }

  const tools = new Map();
  for (const tool of packet.tool_policy.tools) {
    if (tools.has(tool.tool_id)) throw new Error(`duplicate tool ID ${tool.tool_id}`);
    const expectedExecutable = TOOL_KIND_EXECUTABLE[tool.tool_kind];
    if (!expectedExecutable || expectedExecutable !== tool.executable) {
      throw new Error(
        `tool ${tool.tool_id} kind ${String(tool.tool_kind)} is not bound to executable ${tool.executable}`,
      );
    }
    if (!tool.canonical_executable_name || !tool.launcher_mode) {
      throw new Error(`tool ${tool.tool_id} lacks canonical launcher identity`);
    }
    tools.set(tool.tool_id, tool);
  }
  const usedDestinationIds = new Set();
  for (const command of packet.commands) {
    normalizeRepositoryPath(
      command.working_directory,
      `command ${command.id} working_directory`,
    );
    const tool = tools.get(command.tool_id);
    if (!tool) throw new Error(`command ${command.id} references unknown tool ${command.tool_id}`);
    if (command.argv[0] !== tool.executable) {
      throw new Error(
        `command ${command.id} argv[0] ${command.argv[0]} does not match tool executable ${tool.executable}`,
      );
    }
    const executable = command.argv[0].toLowerCase();
    if (SHELL_WRAPPERS.has(executable)) {
      throw new Error(`command ${command.id} uses prohibited shell wrapper ${command.argv[0]}`);
    }
    for (const argument of command.argv) {
      if (SHELL_OPERATOR_PATTERN.test(argument)) {
        throw new Error(`command ${command.id} contains a prohibited shell operator`);
      }
    }
    const plannedUnresolved =
      packet.status === "BLOCKED" &&
      command.availability === "PLANNED" &&
      command.argv.length === 2 &&
      command.argv[1] === "UNRESOLVED";
    const classification = plannedUnresolved
      ? prohibitedClassification(command.argv[0], "PLANNED_UNRESOLVED", null)
      : classifyCodingAgentCommand(command, tool);
    if (classification.prohibited_reason) {
      throw new Error(`command ${command.id} ${classification.prohibited_reason}`);
    }
    if (
      packet.status === "READY" &&
      classification.sandboxed_repository_code &&
      (
        packet.sandbox_policy.runtime !== "GVISOR_CONTAINER" ||
        packet.sandbox_policy.image_digest === null ||
        packet.sandbox_policy.credential_mode !== "NONE" ||
        packet.sandbox_policy.network_mode !== "NONE"
      )
    ) {
      throw new Error(
        `command ${command.id} executes repository code and requires a digest-pinned gVisor sandbox with no credentials or network destinations`,
      );
    }
    if (
      classification.network_capable &&
      command.network_destination_ids.length === 0
    ) {
      throw new Error(
        `command ${command.id} is network-capable but declares no network destination`,
      );
    }
    if (
      classification.external_mutation &&
      command.external_effect_ids.length === 0
    ) {
      throw new Error(
        `command ${command.id} can mutate external state but declares no external effect`,
      );
    }
    for (const destinationId of command.network_destination_ids) {
      if (!destinationIds.has(destinationId)) {
        throw new Error(
          `command ${command.id} references unknown network destination ${destinationId}`,
        );
      }
      usedDestinationIds.add(destinationId);
    }
    for (const effectId of command.external_effect_ids) {
      if (!effectIds.has(effectId)) {
        throw new Error(`command ${command.id} references unknown external effect ${effectId}`);
      }
      const effect = effectIds.get(effectId);
      if (VCS_EFFECT_TYPES.has(effect.effect_type)) {
        throw new Error(
          `command ${command.id} cannot directly invoke trusted-controller VCS effect ${effectId}`,
        );
      }
    }
    if (packet.status === "READY") {
      if (command.availability !== "AVAILABLE") {
        throw new Error(`READY command ${command.id} is not AVAILABLE`);
      }
      if (/^(?:UNRESOLVED|PLANNED)$/iu.test(tool.version)) {
        throw new Error(`READY command ${command.id} uses unresolved tool ${tool.tool_id}`);
      }
      if (!/^sha256:[0-9a-f]{64}$/u.test(tool.executable_digest ?? "")) {
        throw new Error(`READY command ${command.id} lacks a pinned executable digest`);
      }
      if (
        !tool.version_probe ||
        !Array.isArray(tool.version_probe.argv) ||
        tool.version_probe.argv[0] !== tool.executable ||
        tool.version_probe.timeout_seconds < 1 ||
        tool.version_probe.timeout_seconds > 10 ||
        typeof tool.version_probe.expected_output !== "string" ||
        !tool.version_probe.expected_output.includes(tool.version)
      ) {
        throw new Error(`READY command ${command.id} has an invalid pinned version probe`);
      }
      for (const argument of tool.version_probe.argv) {
        if (SHELL_OPERATOR_PATTERN.test(argument)) {
          throw new Error(`READY tool ${tool.tool_id} version probe contains shell syntax`);
        }
      }
      for (const value of [
        tool.executable,
        tool.executable_digest,
        tool.version,
        tool.version_probe.expected_output,
        ...tool.version_probe.argv,
        ...command.argv,
      ]) {
        if (/(?:^|[^A-Z0-9])(?:UNRESOLVED|TBD|TO[-_ ]?DO|PLANNED)(?:$|[^A-Z0-9])/iu.test(value)) {
          throw new Error(`READY command ${command.id} contains unresolved tool or argv value`);
        }
      }
    }
  }
  if (packet.sandbox_policy.network_mode === "NONE" && usedDestinationIds.size > 0) {
    throw new Error("network-disabled sandbox cannot bind command destinations");
  }
  for (const destinationId of destinationIds) {
    if (!usedDestinationIds.has(destinationId)) {
      throw new Error(`declared network destination ${destinationId} is unused`);
    }
  }
}

function validateRequirements(packet) {
  const declared = new Set([
    ...packet.requirements.functional_requirement_ids,
    ...packet.requirements.non_functional_requirement_ids,
  ]);
  const traced = new Set();
  const commandIds = new Set(packet.commands.map((command) => command.id));
  assertUnique(
    packet.requirements.acceptance_tests.map((test) => test.id),
    "acceptance test ID",
  );
  for (const test of packet.requirements.acceptance_tests) {
    for (const requirementId of test.requirement_ids) {
      if (!declared.has(requirementId)) {
        throw new Error(`acceptance test ${test.id} references undeclared requirement ${requirementId}`);
      }
      traced.add(requirementId);
    }
    for (const commandId of test.command_ids) {
      if (!commandIds.has(commandId)) {
        throw new Error(`acceptance test ${test.id} references unknown command ${commandId}`);
      }
    }
  }
  for (const requirementId of declared) {
    if (!traced.has(requirementId)) {
      throw new Error(`${requirementId} has no acceptance trace`);
    }
  }
}

function validateContracts(packet, blockerIds) {
  assertUnique(
    packet.contract_applicability.map((entry) => entry.category),
    "contract category",
  );
  assertExact(
    [...packet.contract_applicability.map((entry) => entry.category)].sort(),
    [...CONTRACT_CATEGORIES].sort(),
    "contract applicability must contain each required category exactly once",
  );
  const contractIds = [];
  for (const entry of packet.contract_applicability) {
    if (entry.applicability === "APPLICABLE") contractIds.push(entry.contract.contract_id);
    if (
      entry.applicability === "REQUIRED_UNRESOLVED" &&
      !blockerIds.has(entry.unresolved_blocker_id)
    ) {
      throw new Error(
        `contract category ${entry.category} references missing blocker ${entry.unresolved_blocker_id}`,
      );
    }
  }
  assertUnique(contractIds, "contract ID");
}

function validateExternalEffects(packet) {
  const effects = new Map();
  for (const effect of packet.external_effects.effects) {
    if (effects.has(effect.effect_id)) throw new Error(`duplicate external effect ID ${effect.effect_id}`);
    effects.set(effect.effect_id, effect);
  }
  const contracts = new Map();
  for (const contract of packet.external_effects.controller_contracts) {
    if (contracts.has(contract.contract_id)) {
      throw new Error(`duplicate controller contract ID ${contract.contract_id}`);
    }
    contracts.set(contract.contract_id, contract);
  }
  for (const effect of effects.values()) {
    for (const contractId of effect.controller_contract_ids) {
      const contract = contracts.get(contractId);
      if (!contract || contract.status !== "APPROVED") {
        throw new Error(
          `external effect ${effect.effect_id} lacks approved controller contract ${contractId}`,
        );
      }
    }
  }
  const vcsEffects = [...effects.values()].filter((effect) =>
    VCS_EFFECT_TYPES.has(effect.effect_type),
  );
  if (vcsEffects.length > 0) {
    if (packet.external_effects.mode !== "TRUSTED_CONTROLLER_ONLY") {
      throw new Error("VCS effects require TRUSTED_CONTROLLER_ONLY mode");
    }
    requireDecision(packet, "D-008", "TRUSTED_VCS", "VCS external effects");
    requireDependency(packet, "P0-10", "VCS external effects");
  }
  return effects;
}

function validateDecisionGates(packet) {
  if (
    packet.data_policy.classification === "RESTRICTED" ||
    packet.data_policy.protected_data_allowed
  ) {
    requireDecision(
      packet,
      "D-009",
      "RETENTION_AND_PROTECTED_STORAGE",
      "restricted or protected data",
    );
    requireDependency(packet, "M0-04", "restricted or protected data");
  }
  if (packet.model_policy.mode === "PINNED") {
    requireDecision(packet, "D-004", "MODEL_GATEWAY", "PINNED model policy");
    requireDecision(packet, "D-005", "MODEL_DATA_POLICY", "PINNED model policy");
    requireDecision(packet, "D-014", "BUDGET", "PINNED model policy");
    requireDependency(packet, "M0-S9C", "PINNED model policy");
  }
  if (packet.budget.maximum_external_spend > 0) {
    requireDecision(packet, "D-014", "BUDGET", "positive external spend");
  }
}

function validateBlockers(packet) {
  const blockerIds = new Set(packet.blockers.map((blocker) => blocker.blocker_id));
  if (blockerIds.size !== packet.blockers.length) throw new Error("duplicate blocker ID");
  assertUnresolvedBinding(packet.source_catalog_binding, blockerIds, "source catalog binding");
  assertUnresolvedBinding(
    packet.curve_binding.context_pack,
    blockerIds,
    "context-pack binding",
  );
  for (const item of collectCodingAgentTaskPacketStateBindings(packet)) {
    assertUnresolvedBinding(item.binding, blockerIds, item.label);
  }
  if (
    packet.repository.stale_base_policy === "REQUIRED_UNRESOLVED" &&
    !packet.blockers.some((blocker) => blocker.category === "REPOSITORY")
  ) {
    throw new Error("unresolved stale-base policy requires a REPOSITORY blocker");
  }
  if (packet.status === "READY" && packet.blockers.length > 0) {
    throw new Error("READY packet cannot retain blockers");
  }
  if (packet.status === "BLOCKED" && packet.blockers.length === 0) {
    throw new Error("BLOCKED packet requires at least one blocker");
  }
  return blockerIds;
}

export function validateCodingAgentTaskPacketSemantics(packet) {
  assertCodingAgentTaskPacketSchema(packet);
  const expectedDigest = computeCodingAgentTaskPacketDigest(packet);
  if (packet.packet_digest !== expectedDigest) {
    throw new Error(`packet_digest is not canonical: expected ${expectedDigest}`);
  }
  if (!UUID_PATTERN.test(packet.workspace_id ?? "")) {
    throw new Error("workspace_id must be a canonical UUID");
  }
  if (packet.repository.target_branch === packet.repository.feature_branch) {
    throw new Error("repository target_branch and feature_branch must differ");
  }
  if (packet.project_tracking.work_package_id !== packet.work_package_id) {
    throw new Error("project tracking work_package_id does not match packet work_package_id");
  }
  if (packet.user_facing && packet.ux_evidence === null) {
    throw new Error("user-facing packet requires UX evidence binding");
  }
  if (!packet.user_facing && packet.ux_evidence !== null) {
    throw new Error("non-user-facing packet must set ux_evidence to null");
  }
  const blockerIds = validateBlockers(packet);
  assertUnique(
    packet.curve_binding.governance_documents.map((document) => document.document_id),
    "governance document ID",
  );
  const roles = new Set(
    packet.curve_binding.governance_documents.map((document) => document.role),
  );
  if (packet.status === "READY") {
    for (const role of REQUIRED_GOVERNANCE_ROLES) {
      if (!roles.has(role)) {
        throw new Error(
          "READY governance documents require PRD, ARCHITECTURE, ADR, and TECHNICAL_PLAN roles",
        );
      }
    }
    if (!["S", "M"].includes(packet.size)) {
      throw new Error("only size S or M packets can be READY");
    }
    if (packet.source_catalog_binding.resolution !== "RESOLVED") {
      throw new Error("READY packet requires a resolved source catalog binding");
    }
    if (packet.curve_binding.context_pack.resolution !== "RESOLVED") {
      throw new Error("READY packet requires a resolved context-pack binding");
    }
    if (packet.project_tracking.tracking_kind !== "WORK_PACKAGE") {
      throw new Error("READY packet requires a distinct WORK_PACKAGE Project item");
    }
    if (packet.repository.stale_base_policy === "REQUIRED_UNRESOLVED") {
      throw new Error("READY packet requires a selected stale-base policy");
    }
    for (const document of packet.curve_binding.governance_documents) {
      if (document.status !== "APPROVED") {
        throw new Error(`READY governance document ${document.document_id} is not APPROVED`);
      }
    }
    for (const dependency of packet.dependencies) {
      if (dependency.satisfaction !== "SATISFIED") {
        throw new Error(`READY dependency ${dependency.id} is not SATISFIED`);
      }
    }
    for (const decision of packet.decisions) {
      if (decision.status !== "DECIDED") {
        throw new Error(`READY decision ${decision.decision_id} is not DECIDED`);
      }
    }
    for (const applicability of packet.contract_applicability) {
      if (applicability.applicability === "REQUIRED_UNRESOLVED") {
        throw new Error(`READY contract category ${applicability.category} remains unresolved`);
      }
      if (
        applicability.applicability === "APPLICABLE" &&
        applicability.contract.status !== "APPROVED"
      ) {
        throw new Error(
          `READY contract ${applicability.contract.contract_id} is not APPROVED`,
        );
      }
    }
    for (const field of POLICY_FIELDS) {
      if (packet[field].status !== "APPROVED") {
        throw new Error(`READY ${field} is not APPROVED`);
      }
    }
    if (packet.commands.some((command) => command.availability !== "AVAILABLE")) {
      throw new Error("READY packet requires every command to be AVAILABLE");
    }
    for (const item of collectCodingAgentTaskPacketStateBindings(packet)) {
      if (item.binding.resolution !== "RESOLVED") {
        throw new Error(`READY packet requires resolved ${item.label} state evidence`);
      }
    }
  }
  if (packet.size === "L") {
    if (packet.status !== "BLOCKED" || !packet.decomposition) {
      throw new Error("size L packet must be BLOCKED and decomposed");
    }
  } else if (packet.decomposition !== null) {
    throw new Error("only size L packets may carry decomposition");
  }
  validateRequirements(packet);
  validateContracts(packet, blockerIds);
  const effects = validateExternalEffects(packet);
  const destinations = validateSandbox(packet);
  validateCommands(packet, destinations, effects);
  validateDecisionGates(packet);
  return {
    packetId: packet.packet_id,
    status: packet.status,
    commandCount: packet.commands.length,
  };
}

export function validateCodingAgentTaskPacketSetSemantics(packets) {
  assertUnique(packets.map((packet) => packet.packet_id), "packet ID");
  assertUnique(packets.map((packet) => packet.work_package_id), "work-package ID");
  assertUnique(
    packets.map((packet) => packet.project_tracking.item_node_id),
    "Project item node ID",
  );
  const byId = new Map(packets.map((packet) => [packet.packet_id, packet]));
  for (const packet of packets) validateCodingAgentTaskPacketSemantics(packet);
  for (const packet of packets) {
    if (!packet.decomposition) continue;
    for (const childId of packet.decomposition.child_packet_ids) {
      if (childId === packet.packet_id) {
        throw new Error(`packet ${packet.packet_id} decomposition references itself`);
      }
      if (!byId.has(childId)) {
        throw new Error(`packet ${packet.packet_id} decomposition child ${childId} is missing`);
      }
    }
  }
  const visiting = new Set();
  const visited = new Set();
  function visit(packetId) {
    if (visiting.has(packetId)) throw new Error(`decomposition cycle at ${packetId}`);
    if (visited.has(packetId)) return;
    visiting.add(packetId);
    for (const childId of byId.get(packetId)?.decomposition?.child_packet_ids ?? []) {
      visit(childId);
    }
    visiting.delete(packetId);
    visited.add(packetId);
  }
  for (const packet of packets) visit(packet.packet_id);
  return { packetCount: packets.length };
}

const CURVE_REFERENCE_ROLES = Object.freeze({
  NORMATIVE_SOURCE: "NORMATIVE_SOURCE",
  PUBLISHED_EVIDENCE: "PUBLISHED_EVIDENCE",
  SOURCE_CATALOG: "SOURCE_CATALOG",
});
const CURVE_PUBLICATION_ROOTS = Object.freeze({
  AUTHORITY_SOURCE: "contracts/authority/",
  STATE_EVIDENCE: "contracts/state/",
  CONTEXT_MANIFEST: "contracts/context/",
  SOURCE_CATALOG: "contracts/task-packet-sources/",
});

function assertCurvePublicationRoot(reference, publicationRoot, label) {
  const path = normalizeRepositoryPath(reference.path, `${label} path`);
  if (!path.startsWith(publicationRoot)) {
    throw new Error(`${label} must be published under ${publicationRoot}`);
  }
}

function referenceRepository(reference) {
  return reference.repository ?? "CURVE";
}

function validateReferenceRevision(
  packet,
  reference,
  curveRole = CURVE_REFERENCE_ROLES.NORMATIVE_SOURCE,
) {
  const repository = referenceRepository(reference);
  if (repository === "TARGET") {
    if (reference.revision !== packet.repository.base_sha) {
      throw new Error(
        `TARGET:${reference.path} revision ${reference.revision} does not match target base ${packet.repository.base_sha}`,
      );
    }
    return;
  }
  if (repository !== "CURVE") {
    throw new Error(`${repository}:${reference.path} uses an unsupported evidence repository`);
  }
  if (
    curveRole === CURVE_REFERENCE_ROLES.NORMATIVE_SOURCE &&
    reference.revision !== packet.curve_binding.curve_revision
  ) {
    throw new Error(
      `CURVE:${reference.path} revision ${reference.revision} does not match normative Curve source ${packet.curve_binding.curve_revision}`,
    );
  }
}

function resolveAndVerifyReference(
  packet,
  reference,
  resolveReference,
  label,
  curveRole = CURVE_REFERENCE_ROLES.NORMATIVE_SOURCE,
) {
  if (typeof resolveReference !== "function") {
    throw new Error("an evidence resolver is required");
  }
  normalizeRepositoryPath(reference.path, `${label} path`);
  validateReferenceRevision(packet, reference, curveRole);
  const contents = ensureBuffer(resolveReference(reference), label);
  const actualDigest = sha256(contents);
  if (actualDigest !== reference.content_digest) {
    throw new Error(
      `${label} digest mismatch: expected ${reference.content_digest}, got ${actualDigest}`,
    );
  }
  return contents;
}

function validateSourceCatalogRecordShape(record, label) {
  assertObjectWithExactKeys(
    record,
    [
      "work_package_id",
      "packet_id",
      "workspace_id",
      "packet_projection_digest",
      "size",
      "user_facing",
      "risk_tier",
      "repository",
      "requirements",
      "dependencies",
      "decisions",
      "project_tracking",
      "commands",
      "contract_applicability",
    ],
    label,
  );
  if (!/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/u.test(record.work_package_id)) {
    throw new Error(`${label} work_package_id is invalid`);
  }
  if (!/^CURVE-[A-Z0-9]+(?:-[A-Z0-9]+)*$/u.test(record.packet_id)) {
    throw new Error(`${label} packet_id is invalid`);
  }
  if (!UUID_PATTERN.test(record.workspace_id)) {
    throw new Error(`${label} workspace_id is not a UUID`);
  }
  if (!/^sha256:[0-9a-f]{64}$/u.test(record.packet_projection_digest)) {
    throw new Error(`${label} packet_projection_digest is invalid`);
  }
  assertEnumValue(record.size, ["S", "M", "L"], `${label} size`);
  if (typeof record.user_facing !== "boolean") {
    throw new Error(`${label} user_facing must be boolean`);
  }
  assertEnumValue(record.risk_tier, ["LOW", "STANDARD", "HIGH"], `${label} risk_tier`);
  assertObjectWithExactKeys(record.repository, ["url", "target_branch"], `${label} repository`);
  assertNonEmptyString(record.repository.url, `${label} repository url`);
  assertNonEmptyString(record.repository.target_branch, `${label} repository target_branch`);
  assertObjectWithExactKeys(
    record.requirements,
    ["functional_requirement_ids", "non_functional_requirement_ids"],
    `${label} requirements`,
  );
  assertStringList(
    record.requirements.functional_requirement_ids,
    `${label} functional_requirement_ids`,
  );
  assertStringList(
    record.requirements.non_functional_requirement_ids,
    `${label} non_functional_requirement_ids`,
  );
  assertStringList(record.dependencies, `${label} dependencies`);
  assertStringList(record.decisions, `${label} decisions`);
  assertObjectWithExactKeys(
    record.project_tracking,
    ["project_number", "item_node_id", "tracking_kind"],
    `${label} project_tracking`,
  );
  if (!Number.isInteger(record.project_tracking.project_number) || record.project_tracking.project_number < 1) {
    throw new Error(`${label} project number must be a positive integer`);
  }
  if (!/^PVTI_[A-Za-z0-9_-]+$/u.test(record.project_tracking.item_node_id)) {
    throw new Error(`${label} Project item node ID is invalid`);
  }
  assertEnumValue(
    record.project_tracking.tracking_kind,
    ["WORK_PACKAGE", "DEFINITION_EVIDENCE"],
    `${label} tracking_kind`,
  );
  if (!Array.isArray(record.commands) || record.commands.length < 5) {
    throw new Error(`${label} commands must contain at least five entries`);
  }
  for (const command of record.commands) {
    assertObjectWithExactKeys(
      command,
      [
        "id",
        "phase",
        "argv",
        "working_directory",
        "timeout_seconds",
        "availability",
        "tool_id",
        "network_destination_ids",
        "external_effect_ids",
      ],
      `${label} command`,
    );
    assertNonEmptyString(command.id, `${label} command id`);
    assertNonEmptyString(command.phase, `${label} command phase`);
    if (!Array.isArray(command.argv) || command.argv.length === 0) {
      throw new Error(`${label} command argv must be non-empty`);
    }
    for (const argument of command.argv) {
      if (typeof argument !== "string") throw new Error(`${label} command argv must contain strings`);
    }
    assertNonEmptyString(command.working_directory, `${label} command working_directory`);
    if (!Number.isInteger(command.timeout_seconds) || command.timeout_seconds < 1) {
      throw new Error(`${label} command timeout_seconds must be positive`);
    }
    assertEnumValue(
      command.availability,
      ["AVAILABLE", "PLANNED"],
      `${label} command availability`,
    );
    assertNonEmptyString(command.tool_id, `${label} command tool_id`);
    assertStringList(command.network_destination_ids, `${label} command network destinations`);
    assertStringList(command.external_effect_ids, `${label} command external effects`);
  }
  assertUnique(record.commands.map((command) => command.id), `${label} command ID`);
  if (!Array.isArray(record.contract_applicability) || record.contract_applicability.length !== 7) {
    throw new Error(`${label} contract_applicability must contain seven entries`);
  }
  for (const entry of record.contract_applicability) {
    assertObjectWithExactKeys(
      entry,
      ["category", "applicability", "contract_id"],
      `${label} contract applicability`,
    );
    assertEnumValue(
      entry.category,
      CONTRACT_CATEGORIES,
      `${label} contract category`,
    );
    assertEnumValue(
      entry.applicability,
      ["APPLICABLE", "NOT_APPLICABLE", "REQUIRED_UNRESOLVED"],
      `${label} contract applicability`,
    );
    if (entry.applicability === "APPLICABLE") {
      if (
        typeof entry.contract_id !== "string" ||
        !/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/u.test(entry.contract_id)
      ) {
        throw new Error(
          `${label} APPLICABLE contract applicability requires a canonical contract_id`,
        );
      }
    } else if (entry.contract_id !== null) {
      throw new Error(
        `${label} ${entry.applicability} contract applicability requires a null contract_id`,
      );
    }
  }
  assertUnique(
    record.contract_applicability.map((entry) => entry.category),
    `${label} contract category`,
  );
}

function validateSourceCatalogBinding(packet, resolveReference) {
  const binding = packet.source_catalog_binding;
  if (binding.resolution !== "RESOLVED") return { resolved: false };
  if (binding.evidence.repository !== "CURVE") {
    throw new Error("source catalog must be stored in CURVE");
  }
  assertCurvePublicationRoot(
    binding.evidence,
    CURVE_PUBLICATION_ROOTS.SOURCE_CATALOG,
    "source catalog",
  );
  const contents = resolveAndVerifyReference(
    packet,
    binding.evidence,
    resolveReference,
    "source catalog",
    CURVE_REFERENCE_ROLES.SOURCE_CATALOG,
  );
  const catalog = parseJsonBytes(contents, "source catalog");
  assertObjectWithExactKeys(
    catalog,
    ["schema_version", "catalog_id", "catalog_version", "work_packages"],
    "source catalog",
  );
  if (catalog.schema_version !== "curve.coding-agent-source-catalog/v1") {
    throw new Error("source catalog has an unsupported schema_version");
  }
  if (
    typeof catalog.catalog_id !== "string" ||
    catalog.catalog_id.trim() === "" ||
    !Number.isInteger(catalog.catalog_version) ||
    catalog.catalog_version < 1 ||
    !Array.isArray(catalog.work_packages) ||
    catalog.work_packages.length === 0
  ) {
    throw new Error("source catalog lacks a non-empty identity, version, or work-package set");
  }
  for (const [index, record] of catalog.work_packages.entries()) {
    validateSourceCatalogRecordShape(record, `source catalog work_packages/${index}`);
  }
  assertUnique(
    catalog.work_packages.map((record) => record.work_package_id),
    "source catalog work_package_id",
  );
  assertUnique(
    catalog.work_packages.map((record) => record.packet_id),
    "source catalog packet_id",
  );
  assertUnique(
    catalog.work_packages.map((record) => record.project_tracking.item_node_id),
    "source catalog Project item node ID",
  );
  if (!/^\/work_packages\/(?:0|[1-9][0-9]*)$/u.test(binding.record_pointer)) {
    throw new Error("source catalog record_pointer must select one work_packages array entry");
  }
  const record = resolveCodingAgentJsonPointer(catalog, binding.record_pointer);
  assertExact(
    record,
    projectCodingAgentSourceCatalogRecord(packet),
    `source catalog record ${binding.record_pointer} does not exactly project packet ${packet.packet_id}`,
  );
  return {
    resolved: true,
    catalogId: catalog.catalog_id,
    revision: binding.evidence.revision,
  };
}

function validateContextPackBinding(packet, resolveReference) {
  const binding = packet.curve_binding.context_pack;
  if (binding.resolution !== "RESOLVED") return { resolved: false, entryCount: 0 };
  if (binding.manifest.repository !== "CURVE") {
    throw new Error("context-pack manifest must be stored in CURVE");
  }
  assertCurvePublicationRoot(
    binding.manifest,
    CURVE_PUBLICATION_ROOTS.CONTEXT_MANIFEST,
    "context-pack manifest",
  );
  const manifestContents = resolveAndVerifyReference(
    packet,
    binding.manifest,
    resolveReference,
    "context-pack manifest",
    CURVE_REFERENCE_ROLES.PUBLISHED_EVIDENCE,
  );
  const manifest = parseJsonBytes(manifestContents, "context-pack manifest");
  assertObjectWithExactKeys(
    manifest,
    [
      "schema_version",
      "context_pack_id",
      "version",
      "workspace_id",
      "work_package_id",
      "curve_revision",
      "entries",
    ],
    "context-pack manifest",
  );
  if (manifest.schema_version !== "curve.coding-agent-context-pack-manifest/v1") {
    throw new Error("context-pack manifest has an unsupported schema_version");
  }
  if (manifest.work_package_id !== packet.work_package_id) {
    throw new Error("context-pack manifest work_package_id does not match the packet");
  }
  if (manifest.workspace_id !== packet.workspace_id) {
    throw new Error("context-pack manifest workspace_id does not match the packet");
  }
  if (manifest.curve_revision !== packet.curve_binding.curve_revision) {
    throw new Error("context-pack manifest curve_revision does not match the packet");
  }
  if (
    typeof manifest.context_pack_id !== "string" ||
    manifest.context_pack_id.trim() === "" ||
    !Number.isInteger(manifest.version) ||
    manifest.version < 1 ||
    !Array.isArray(manifest.entries) ||
    manifest.entries.length === 0
  ) {
    throw new Error("context-pack manifest lacks a non-empty identity, version, or entry set");
  }
  assertUnique(manifest.entries.map((entry) => entry.path), "context-pack path");
  const entries = manifest.entries.map((entry) => {
    assertObjectWithExactKeys(
      entry,
      ["repository", "path", "revision", "content_digest"],
      `context-pack entry ${entry?.path ?? "<unknown>"}`,
    );
    if (entry.repository !== "CURVE") {
      throw new Error(`context-pack entry ${entry.path} must use repository CURVE`);
    }
    const contents = resolveAndVerifyReference(
      packet,
      entry,
      resolveReference,
      `context-pack entry ${entry.path}`,
      CURVE_REFERENCE_ROLES.NORMATIVE_SOURCE,
    );
    return { path: entry.path, contents };
  });
  const actualDigest = digestContextEntries(entries);
  if (actualDigest !== binding.context_digest) {
    throw new Error(
      `context-pack digest mismatch: expected ${binding.context_digest}, got ${actualDigest}`,
    );
  }
  return {
    resolved: true,
    entryCount: entries.length,
    manifestRevision: binding.manifest.revision,
  };
}

const HUMAN_STATE_AUTHORITY_ROLES = Object.freeze({
  GOVERNANCE_DOCUMENT: new Set([
    "CURVE_ENGINEERING_APPROVER", "PRODUCT_APPROVER", "LICENSING_REVIEWER",
  ]),
  DEPENDENCY: new Set([
    "CURVE_ENGINEERING_APPROVER", "TECHNICAL_APPROVER", "PLATFORM_OPERATIONS_APPROVER",
  ]),
  DECISION: new Set([
    "CURVE_ENGINEERING_APPROVER", "PRODUCT_APPROVER", "TECHNICAL_APPROVER",
    "PLATFORM_OPERATIONS_APPROVER", "SECURITY_APPROVER", "PRIVACY_LEGAL_APPROVER",
    "LICENSING_REVIEWER",
  ]),
  CONTRACT: new Set([
    "CURVE_ENGINEERING_APPROVER", "TECHNICAL_APPROVER", "SECURITY_APPROVER",
  ]),
  POLICY: new Set([
    "CURVE_ENGINEERING_APPROVER", "PLATFORM_OPERATIONS_APPROVER",
    "SECURITY_APPROVER", "PRIVACY_LEGAL_APPROVER", "LICENSING_REVIEWER",
  ]),
  UX: new Set(["PRODUCT_APPROVER", "CURVE_ENGINEERING_APPROVER"]),
});

function stateAuthorityScope(subjectType, subjectId, state) {
  return `STATE:${subjectType}:${subjectId}:${state}`;
}

function validateStateAuthoritySource(packet, attestation, label, resolveReference) {
  const source = attestation.authority_source;
  assertObjectWithExactKeys(
    source,
    [
      "source_type", "source_id", "repository", "title", "path", "revision",
      "content_digest",
    ],
    `${label} authority source`,
  );
  assertEnumValue(
    source.source_type,
    ["CURVE_APPROVAL_RECORD", "WORKSPACE_ROLE_BINDING", "SYSTEM_DERIVATION_CONTRACT"],
    `${label} authority source type`,
  );
  assertNonEmptyString(source.source_id, `${label} authority source ID`);
  if (source.repository !== "CURVE") {
    throw new Error(`${label} authority source must be a CURVE evidence blob`);
  }
  assertCurvePublicationRoot(
    source,
    CURVE_PUBLICATION_ROOTS.AUTHORITY_SOURCE,
    `${label} authority source`,
  );
  const contents = resolveAndVerifyReference(
    packet,
    source,
    resolveReference,
    `${label} authority source ${source.source_id}`,
    CURVE_REFERENCE_ROLES.PUBLISHED_EVIDENCE,
  );
  return { contents, revision: source.revision };
}

function validateStateRecord(packet, item, resolveReference) {
  const { binding, subjectType, subjectId, state, label, approvalSubject: expectedSubject } =
    item;
  if (binding.resolution !== "RESOLVED") return false;
  if (binding.evidence.repository !== "CURVE") {
    throw new Error(`${label} state evidence must be stored in CURVE`);
  }
  assertCurvePublicationRoot(
    binding.evidence,
    CURVE_PUBLICATION_ROOTS.STATE_EVIDENCE,
    `${label} state evidence`,
  );
  const contents = resolveAndVerifyReference(
    packet,
    binding.evidence,
    resolveReference,
    `${label} state evidence`,
    CURVE_REFERENCE_ROLES.PUBLISHED_EVIDENCE,
  );
  const document = parseJsonBytes(contents, `${label} state evidence`);
  const record = resolveCodingAgentJsonPointer(document, binding.record_pointer);
  assertObjectWithExactKeys(
    record,
    [
      "schema_version",
      "workspace_id",
      "subject_type",
      "subject_id",
      "state",
      "approval_subject",
      "approval_subject_digest",
      "attestations",
    ],
    `${label} state record`,
  );
  if (record?.schema_version !== "curve.coding-agent-state-evidence/v1") {
    throw new Error(`${label} has an unsupported state-evidence schema_version`);
  }
  if (record.workspace_id !== packet.workspace_id) {
    throw new Error(`${label} state record workspace_id does not match the packet`);
  }
  if (record.subject_type !== subjectType) {
    throw new Error(`${label} state subject_type does not match ${subjectType}`);
  }
  if (record.subject_id !== subjectId) {
    throw new Error(`${label} state subject_id does not match ${subjectId}`);
  }
  if (record.state !== state) {
    throw new Error(`${label} authoritative state ${record.state} does not match packet claim ${state}`);
  }
  const requiredAssertions = new Map([
    ["/subject_type", subjectType],
    ["/subject_id", subjectId],
    ["/state", state],
  ]);
  assertUnique(
    binding.assertions.map((assertion) => assertion.pointer),
    `${label} assertion pointer`,
  );
  for (const [pointer, expected] of requiredAssertions) {
    const assertion = binding.assertions.find((candidate) => candidate.pointer === pointer);
    if (!assertion || canonicalJsonString(assertion.expected) !== canonicalJsonString(expected)) {
      throw new Error(`${label} binding lacks exact ${pointer} assertion`);
    }
  }
  for (const assertion of binding.assertions) {
    const actual = resolveCodingAgentJsonPointer(record, assertion.pointer);
    assertExact(
      actual,
      assertion.expected,
      `${label} assertion ${assertion.pointer} does not match authoritative state`,
    );
  }
  assertExact(
    record.approval_subject,
    expectedSubject,
    `${label} approval_subject does not exactly bind the packet claim`,
  );
  const actualSubjectDigest = computeCodingAgentStateApprovalSubjectDigest(
    record.approval_subject,
  );
  if (record.approval_subject_digest !== actualSubjectDigest) {
    throw new Error(`${label} approval_subject_digest is not canonical`);
  }
  if (binding.approval_subject_digest !== actualSubjectDigest) {
    throw new Error(`${label} binding does not carry the authoritative approval_subject_digest`);
  }
  if (!Array.isArray(record.attestations) || record.attestations.length === 0) {
    throw new Error(`${label} requires at least one attestation`);
  }
  assertUnique(
    record.attestations.map(
      (attestation) => `${attestation.actor_type}:${attestation.actor_id}`,
    ),
    `${label} attestation actor`,
  );
  const authoritySourceRevisions = new Set();
  for (const attestation of record.attestations) {
    assertObjectWithExactKeys(
      attestation,
      [
        "actor_type", "actor_id", "actor_role", "authority_source",
        "workspace_id", "authority_scope", "attested_at", "subject_digest",
        "derivation",
      ],
      `${label} attestation`,
    );
    if (!["HUMAN", "SYSTEM"].includes(attestation.actor_type)) {
      throw new Error(`${label} attestation actor_type is invalid`);
    }
    assertNonEmptyString(attestation.actor_id, `${label} attestation actor_id`);
    assertNonEmptyString(attestation.actor_role, `${label} attestation actor_role`);
    if (attestation.workspace_id !== packet.workspace_id) {
      throw new Error(`${label} attestation workspace_id does not match the packet`);
    }
    const requiredScope = stateAuthorityScope(subjectType, subjectId, state);
    assertExact(
      attestation.authority_scope,
      [requiredScope],
      `${label} attestation authority_scope is not exact`,
    );
    if (typeof attestation.attested_at !== "string" || Number.isNaN(Date.parse(attestation.attested_at))) {
      throw new Error(`${label} attestation attested_at is invalid`);
    }
    if (attestation.subject_digest !== actualSubjectDigest) {
      throw new Error(`${label} attestation does not bind the approval subject`);
    }
    const authoritySource = validateStateAuthoritySource(
      packet,
      attestation,
      label,
      resolveReference,
    );
    authoritySourceRevisions.add(authoritySource.revision);
    if (attestation.actor_type === "HUMAN") {
      const allowedRoles = HUMAN_STATE_AUTHORITY_ROLES[subjectType];
      if (!allowedRoles?.has(attestation.actor_role)) {
        throw new Error(
          `${label} human role ${attestation.actor_role} cannot attest ${subjectType}`,
        );
      }
      if (attestation.derivation !== null) {
        throw new Error(`${label} human attestation cannot carry a system derivation`);
      }
      if (
        ["APPROVED", "DECIDED"].includes(state) &&
        attestation.authority_source.source_type !== "CURVE_APPROVAL_RECORD"
      ) {
        throw new Error(`${label} ${state} requires a CURVE_APPROVAL_RECORD`);
      }
      if (attestation.authority_source.source_type === "SYSTEM_DERIVATION_CONTRACT") {
        throw new Error(`${label} human attestation cannot use a system derivation source`);
      }
    } else {
      if (
        subjectType !== "DEPENDENCY" ||
        state !== "SATISFIED" ||
        expectedSubject.claim?.machine_derived !== true
      ) {
        throw new Error(`${label} SYSTEM may attest only an explicitly machine-derived dependency`);
      }
      if (
        attestation.actor_role !== "SYSTEM_DERIVER" ||
        attestation.authority_source.source_type !== "SYSTEM_DERIVATION_CONTRACT"
      ) {
        throw new Error(`${label} SYSTEM attestation lacks its derivation authority`);
      }
      assertObjectWithExactKeys(
        attestation.derivation,
        ["contract_id", "contract_digest", "input_digest"],
        `${label} system derivation`,
      );
      if (
        attestation.derivation.contract_id !== attestation.authority_source.source_id ||
        attestation.derivation.contract_digest !== attestation.authority_source.content_digest ||
        attestation.derivation.input_digest !==
          sha256(Buffer.from(canonicalJsonString(expectedSubject.claim)))
      ) {
        throw new Error(`${label} SYSTEM derivation does not exactly bind contract and inputs`);
      }
    }
  }
  if (
    ["APPROVED", "DECIDED"].includes(state) &&
    !record.attestations.some((attestation) => attestation.actor_type === "HUMAN")
  ) {
    throw new Error(`${label} ${state} requires an authorized HUMAN attestation`);
  }
  return {
    resolved: true,
    evidenceRevision: binding.evidence.revision,
    authoritySourceRevisions: [...authoritySourceRevisions].sort(),
  };
}

export function validateCodingAgentTaskPacketEvidence(
  packet,
  { resolveReference } = {},
) {
  validateCodingAgentTaskPacketSemantics(packet);
  const references = collectCodingAgentTaskPacketEvidenceReferences(packet);
  const referenceRoles = new Map();
  const assignReferenceRole = (reference, role, label) => {
    const key = referenceKey(reference);
    const assigned = referenceRoles.get(key);
    if (assigned && assigned.role !== role) {
      throw new Error(
        `${label} reuses evidence already assigned to ${assigned.label}; one blob cannot serve multiple Curve publication roles`,
      );
    }
    referenceRoles.set(key, { role, label });
  };
  for (const reference of collectCodingAgentTaskPacketNormativeReferences(packet)) {
    assignReferenceRole(
      reference,
      CURVE_REFERENCE_ROLES.NORMATIVE_SOURCE,
      `${referenceRepository(reference)}:${reference.path}`,
    );
  }
  if (packet.curve_binding.context_pack.resolution === "RESOLVED") {
    assignReferenceRole(
      packet.curve_binding.context_pack.manifest,
      CURVE_REFERENCE_ROLES.PUBLISHED_EVIDENCE,
      "context-pack manifest",
    );
  }
  for (const item of collectCodingAgentTaskPacketStateBindings(packet)) {
    if (item.binding.resolution === "RESOLVED") {
      assignReferenceRole(
        item.binding.evidence,
        CURVE_REFERENCE_ROLES.PUBLISHED_EVIDENCE,
        `${item.label} state evidence`,
      );
    }
  }
  if (packet.source_catalog_binding.resolution === "RESOLVED") {
    assignReferenceRole(
      packet.source_catalog_binding.evidence,
      CURVE_REFERENCE_ROLES.SOURCE_CATALOG,
      "source catalog",
    );
  }
  for (const reference of references) {
    const key = referenceKey(reference);
    const curveRole = referenceRoles.get(key)?.role;
    if (!curveRole) {
      throw new Error(
        `${referenceRepository(reference)}:${reference.path} has no Curve publication role`,
      );
    }
    resolveAndVerifyReference(
      packet,
      reference,
      resolveReference,
      `${referenceRepository(reference)}:${reference.path}`,
      curveRole,
    );
  }
  const catalog = validateSourceCatalogBinding(packet, resolveReference);
  const context = validateContextPackBinding(packet, resolveReference);
  let stateRecordCount = 0;
  const stateEvidenceRevisions = new Set();
  const authoritySourceRevisions = new Set();
  const authorityToStateEdges = [];
  for (const item of collectCodingAgentTaskPacketStateBindings(packet)) {
    const stateRecord = validateStateRecord(packet, item, resolveReference);
    if (!stateRecord) continue;
    stateRecordCount += 1;
    stateEvidenceRevisions.add(stateRecord.evidenceRevision);
    for (const authorityRevision of stateRecord.authoritySourceRevisions) {
      authoritySourceRevisions.add(authorityRevision);
      authorityToStateEdges.push({
        ancestor: authorityRevision,
        descendant: stateRecord.evidenceRevision,
        relationship: "AUTHORITY_SOURCE_TO_STATE_EVIDENCE",
      });
    }
  }
  const evidencePublicationRevisions = new Set([
    ...authoritySourceRevisions,
    ...stateEvidenceRevisions,
  ]);
  if (context.manifestRevision) {
    evidencePublicationRevisions.add(context.manifestRevision);
  }
  const normativeSourceRevision = packet.curve_binding.curve_revision;
  const sourceCatalogRevision = catalog.revision ?? null;
  const requiredAncestryEdges = [];
  for (const revision of evidencePublicationRevisions) {
    requiredAncestryEdges.push({
      ancestor: normativeSourceRevision,
      descendant: revision,
      relationship: "NORMATIVE_SOURCE_TO_EVIDENCE",
    });
    if (sourceCatalogRevision) {
      requiredAncestryEdges.push({
        ancestor: revision,
        descendant: sourceCatalogRevision,
        relationship: "EVIDENCE_TO_SOURCE_CATALOG",
      });
    }
  }
  if (sourceCatalogRevision) {
    requiredAncestryEdges.push({
      ancestor: normativeSourceRevision,
      descendant: sourceCatalogRevision,
      relationship: "NORMATIVE_SOURCE_TO_SOURCE_CATALOG",
    });
  }
  requiredAncestryEdges.push(...authorityToStateEdges);
  const curveRevisions = new Set([normativeSourceRevision]);
  for (const reference of references) {
    if (referenceRepository(reference) === "CURVE") {
      curveRevisions.add(reference.revision);
    }
  }
  for (const revision of authoritySourceRevisions) curveRevisions.add(revision);
  const uniqueAncestryEdges = [
    ...new Map(
      requiredAncestryEdges.map((edge) => [
        `${edge.relationship}\0${edge.ancestor}\0${edge.descendant}`,
        edge,
      ]),
    ).values(),
  ];
  return {
    referenceCount: references.length,
    stateRecordCount,
    contextEntryCount: context.entryCount,
    sourceCatalogResolved: catalog.resolved,
    revisionModel: {
      normativeSourceRevision,
      evidencePublicationRevisions: [...evidencePublicationRevisions].sort(),
      sourceCatalogRevision,
      curveRevisions: [...curveRevisions].sort(),
      requiredAncestryEdges: uniqueAncestryEdges,
    },
  };
}

export function createFilesystemEvidenceResolver(repositoryBindings) {
  return (reference) => {
    const binding = repositoryBindings[reference.repository];
    if (!binding) throw new Error(`no filesystem binding for ${reference.repository}`);
    if (binding.revision !== reference.revision) {
      throw new Error(
        `${reference.repository}:${reference.path} requested revision ${reference.revision}, bound revision is ${binding.revision}`,
      );
    }
    const path = normalizeRepositoryPath(reference.path, "evidence path");
    return readFileSync(
      assertFilesystemContainment(binding.root, path, `${reference.repository}:${path}`),
    );
  };
}

function gitArguments(args) {
  return ["--no-replace-objects", ...args];
}

function runGit(repository, args, { encoding = "utf8" } = {}) {
  return execFileSync(TRUSTED_GIT_EXECUTABLE, gitArguments(["-C", repository, ...args]), {
    encoding,
    env: GIT_ENVIRONMENT,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function runGitStatus(repository, args) {
  return spawnSync(TRUSTED_GIT_EXECUTABLE, gitArguments(["-C", repository, ...args]), {
    encoding: "utf8",
    env: GIT_ENVIRONMENT,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function assertGitObjectTrust(repository, label) {
  const localConfig = runGit(repository, [
    "config",
    "--local",
    "--no-includes",
    "--null",
    "--name-only",
    "--list",
  ]);
  for (const name of localConfig.split("\0").filter(Boolean)) {
    const normalizedName = name.trim().toLowerCase();
    if (UNSAFE_LOCAL_GIT_CONFIG.test(normalizedName)) {
      throw new Error(`${label} has unsafe local Git config ${normalizedName}`);
    }
  }
  const replacements = runGit(repository, [
    "for-each-ref",
    "--format=%(refname)",
    "refs/replace",
  ]).trim();
  if (replacements !== "") throw new Error(`${label} contains prohibited replace refs`);
  for (const alternateKind of ["alternates", "http-alternates"]) {
    const alternatePath = runGit(repository, [
      "rev-parse",
      "--path-format=absolute",
      "--git-path",
      `objects/info/${alternateKind}`,
    ]).trim();
    if (alternatePath !== "" && existsSync(alternatePath)) {
      throw new Error(
        `${label} contains prohibited persistent Git object ${alternateKind}`,
      );
    }
  }
  for (const args of [
    ["config", "--local", "--get", "extensions.partialClone"],
    ["config", "--local", "--get-regexp", "^remote\\..*\\.promisor$"],
  ]) {
    const result = runGitStatus(repository, args);
    if (result.status === 0 && result.stdout.trim() !== "") {
      throw new Error(`${label} is a promisor or partial clone and cannot prove local evidence`);
    }
    if (![0, 1].includes(result.status)) {
      throw new Error(`${label} Git configuration could not be inspected`);
    }
  }
}

function assertGitCommit(repository, revision, label) {
  let type;
  try {
    type = runGit(repository, ["cat-file", "-t", revision]).trim();
  } catch (error) {
    throw new Error(`${label} commit ${revision} is unavailable: ${error.stderr?.toString().trim() ?? error.message}`);
  }
  if (type !== "commit") throw new Error(`${label} ${revision} is ${type}, not a commit`);
}

export function createGitEvidenceResolver(repositoryBindings) {
  const roots = Object.fromEntries(
    Object.entries(repositoryBindings).map(([name, value]) => [
      name,
      realpathSync(typeof value === "string" ? value : value.root),
    ]),
  );
  for (const [name, repository] of Object.entries(roots)) {
    assertGitObjectTrust(repository, `${name} repository`);
  }
  return (reference) => {
    const repositoryName = reference.repository ?? "CURVE";
    const repository = roots[repositoryName];
    if (!repository) throw new Error(`no Git binding for ${repositoryName}`);
    const path = normalizeRepositoryPath(reference.path, "Git evidence path");
    assertGitCommit(repository, reference.revision, repositoryName);
    const objectSpec = `${reference.revision}:${path}`;
    let listing;
    try {
      listing = runGit(repository, ["ls-tree", reference.revision, "--", path]).trim();
    } catch (error) {
      throw new Error(
        `${repositoryName}:${path} is unavailable at ${reference.revision}: ${error.stderr?.toString().trim() ?? error.message}`,
      );
    }
    const lines = listing === "" ? [] : listing.split("\n");
    if (lines.length !== 1) {
      throw new Error(`${repositoryName}:${path} does not resolve to one Git tree entry`);
    }
    const match = lines[0].match(/^(100644|100755|120000|160000|040000) (blob|commit|tree) ([0-9a-f]+)\t(.+)$/u);
    if (!match) {
      throw new Error(`${repositoryName}:${path} has an unsupported Git tree entry`);
    }
    const [, mode, type, , listedPath] = match;
    if (listedPath !== path || !["100644", "100755"].includes(mode) || type !== "blob") {
      throw new Error(
        `${repositoryName}:${path} must be a regular file; mode ${mode} ${type}`,
      );
    }
    const objectType = runGit(repository, ["cat-file", "-t", objectSpec]).trim();
    if (objectType !== "blob") {
      throw new Error(`${repositoryName}:${path} object is ${objectType}, not a blob`);
    }
    return runGit(repository, ["show", objectSpec], { encoding: null });
  };
}

export function normalizeCodingAgentRepositoryUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("repository URL is empty");
  }
  let host;
  let path;
  const scp = value.match(/^git@([^:]+):(.+)$/u);
  if (scp) {
    [, host, path] = scp;
  } else {
    let parsed;
    try {
      parsed = new URL(value);
    } catch {
      throw new Error(`unsupported repository URL ${value}`);
    }
    if (!["https:", "ssh:"].includes(parsed.protocol)) {
      throw new Error(`unsupported repository URL protocol ${parsed.protocol}`);
    }
    if (parsed.password || (parsed.username && parsed.protocol === "https:")) {
      throw new Error("repository URL must not embed HTTP credentials");
    }
    host = parsed.hostname;
    path = parsed.pathname;
  }
  const normalizedHost = host.toLowerCase();
  let normalizedPath = path.replace(/^\/+|\/+$/gu, "").replace(/\.git$/iu, "");
  if (normalizedHost === "github.com" || normalizedHost === "gitlab.com") {
    normalizedPath = normalizedPath.toLowerCase();
  }
  if (!normalizedPath || normalizedPath.includes("..")) {
    throw new Error(`repository URL ${value} has an invalid path`);
  }
  return `${normalizedHost}/${normalizedPath}`;
}

function assertRepositoryRemote(repository, expectedUrl, label) {
  let remote;
  try {
    remote = runGit(repository, ["remote", "get-url", "origin"]).trim();
  } catch (error) {
    throw new Error(`${label} has no readable origin remote: ${error.stderr?.toString().trim() ?? error.message}`);
  }
  const actual = normalizeCodingAgentRepositoryUrl(remote);
  const expected = normalizeCodingAgentRepositoryUrl(expectedUrl);
  if (actual !== expected) {
    throw new Error(
      `${label} remote URL ${actual} does not match packet repository URL ${expected}`,
    );
  }
  return actual;
}

const TRUSTED_REMOTE_TIP_TEST_CONTROLLER = Symbol(
  "Curve trusted remote-tip test controller",
);

function normalizeTrustedRemoteTipObservation(
  observation,
  branch,
  repositoryIdentity,
  label,
  { now = Date.now(), maximumAgeMs = 300_000, maximumFutureSkewMs = 30_000 } = {},
) {
  if (observation === null || typeof observation !== "object" || Array.isArray(observation)) {
    throw new Error(`${label} trusted live remote-tip resolver returned no observation`);
  }
  assertObjectWithExactKeys(
    observation,
    ["commit", "repository_identity", "branch", "remote", "observed_at", "source"],
    `${label} trusted live remote-tip observation`,
  );
  if (!/^[0-9a-f]{40}$/u.test(observation.commit ?? "")) {
    throw new Error(`${label} trusted live remote-tip resolver returned an invalid commit`);
  }
  if (observation.repository_identity !== repositoryIdentity) {
    throw new Error(`${label} trusted live remote-tip observation is for another repository`);
  }
  if (observation.branch !== branch) {
    throw new Error(`${label} trusted live remote-tip observation is for another branch`);
  }
  if (observation.remote !== "origin") {
    throw new Error(`${label} trusted live remote-tip observation is not for origin`);
  }
  if (observation.source !== "GIT_LS_REMOTE") {
    throw new Error(`${label} remote-tip observation source must be GIT_LS_REMOTE`);
  }
  const observedAt = Date.parse(observation.observed_at);
  if (Number.isNaN(observedAt)) {
    throw new Error(`${label} trusted live remote-tip observation timestamp is invalid`);
  }
  if (observedAt < now - maximumAgeMs || observedAt > now + maximumFutureSkewMs) {
    throw new Error(`${label} trusted live remote-tip observation is stale or from the future`);
  }
  return {
    commit: observation.commit,
    repository_identity: repositoryIdentity,
    branch,
    remote: "origin",
    observed_at: observation.observed_at,
    source: "GIT_LS_REMOTE",
  };
}

export function createCodingAgentRemoteTipTestController(resolver, options = {}) {
  if (typeof resolver !== "function") {
    throw new Error("test remote-tip controller requires a resolver function");
  }
  const controller = (request) => resolver(structuredClone(request));
  Object.defineProperty(controller, TRUSTED_REMOTE_TIP_TEST_CONTROLLER, {
    value: Object.freeze({ now: options.now ?? Date.now() }),
  });
  return controller;
}

export function resolveCodingAgentTrustedRemoteTip(
  repository,
  branch,
  label,
  options = {},
) {
  const resolvedRepository = realpathSync(repository);
  assertNonEmptyString(label, "trusted remote-tip label");
  if (!/^(?!\/)(?!.*\.\.)(?!.*[~^:?*\[\\\s])[^/]+(?:\/[^/]+)*$/u.test(branch)) {
    throw new Error(`${label} branch ${String(branch)} is not a safe full branch name`);
  }
  const repositoryIdentity = normalizeCodingAgentRepositoryUrl(
    options.expectedRepositoryUrl ?? runGit(resolvedRepository, ["remote", "get-url", "origin"]).trim(),
  );
  const testController = options.testOnlyRemoteTipController;
  if (testController !== undefined) {
    const controllerMetadata = testController?.[TRUSTED_REMOTE_TIP_TEST_CONTROLLER];
    if (!controllerMetadata) {
      throw new Error(`${label} remote-tip test seam requires a tagged test-only controller`);
    }
    return normalizeTrustedRemoteTipObservation(
      testController({
        repository: resolvedRepository,
        repository_identity: repositoryIdentity,
        branch,
        remote: "origin",
        source: "GIT_LS_REMOTE",
      }),
      branch,
      repositoryIdentity,
      label,
      { now: controllerMetadata.now },
    );
  }
  const result = spawnSync(
    TRUSTED_GIT_EXECUTABLE,
    gitArguments([
      "-C",
      resolvedRepository,
      "ls-remote",
      "--exit-code",
      "origin",
      `refs/heads/${branch}`,
    ]),
    {
      encoding: "utf8",
      env: GIT_ENVIRONMENT,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: options.timeoutMs ?? 10_000,
      maxBuffer: 16 * 1024,
    },
  );
  if (result.error || result.status !== 0) {
    const detail = result.stderr?.trim() || result.error?.message || `exit ${result.status}`;
    throw new Error(`${label} live origin/${branch} could not be observed: ${detail}`);
  }
  const lines = result.stdout.trim() === "" ? [] : result.stdout.trim().split("\n");
  if (lines.length !== 1) {
    throw new Error(`${label} live origin/${branch} resolved ${lines.length} refs`);
  }
  const match = lines[0].match(/^([0-9a-f]{40})\trefs\/heads\/(.+)$/u);
  if (!match || match[2] !== branch) {
    throw new Error(`${label} live origin/${branch} returned an unexpected ref`);
  }
  return normalizeTrustedRemoteTipObservation(
    {
      commit: match[1],
      repository_identity: repositoryIdentity,
      branch,
      remote: "origin",
      observed_at: new Date().toISOString(),
      source: "GIT_LS_REMOTE",
    },
    branch,
    repositoryIdentity,
    label,
  );
}

export function validateCodingAgentTargetRepositoryPreflight(
  packet,
  targetRepository,
  { testOnlyRemoteTipController } = {},
) {
  assertCodingAgentTaskPacketSchema(packet);
  const repository = realpathSync(targetRepository);
  assertGitObjectTrust(repository, "target repository");
  const topLevel = realpathSync(runGit(repository, ["rev-parse", "--show-toplevel"]).trim());
  if (topLevel !== repository) {
    throw new Error("target repository path must be the checkout root");
  }
  const remote = assertRepositoryRemote(repository, packet.repository.url, "target repository");
  assertGitCommit(repository, packet.repository.base_sha, "target base");
  const head = runGit(repository, ["rev-parse", "HEAD"]).trim();
  if (head !== packet.repository.base_sha) {
    throw new Error(`target HEAD ${head} does not equal packet base ${packet.repository.base_sha}`);
  }
  const status = runGit(repository, ["status", "--porcelain=v1", "--untracked-files=all"]);
  if (status !== "") throw new Error("target repository worktree is not clean");
  for (const path of packet.sandbox_policy.read_only_paths) {
    assertCheckoutPathBoundary(repository, path, `sandbox read-only path ${path}`);
  }
  for (const path of packet.sandbox_policy.writable_paths) {
    assertCheckoutPathBoundary(repository, path, `sandbox writable path ${path}`);
  }
  for (const command of packet.commands) {
    assertCheckoutPathBoundary(
      repository,
      command.working_directory,
      `command ${command.id} working_directory`,
      { mustExistDirectory: true },
    );
  }
  const remoteTipObservation = resolveCodingAgentTrustedRemoteTip(
    repository,
    packet.repository.target_branch,
    "target repository",
    {
      testOnlyRemoteTipController,
      expectedRepositoryUrl: packet.repository.url,
    },
  );
  const remoteTip = remoteTipObservation.commit;
  assertGitCommit(repository, remoteTip, "target live remote tip");
  const ancestry = runGitStatus(repository, [
    "merge-base",
    "--is-ancestor",
    packet.repository.base_sha,
    remoteTip,
  ]);
  if (ancestry.status !== 0) {
    throw new Error("packet base is not an ancestor of the origin target branch");
  }
  if (
    packet.repository.stale_base_policy === "REQUIRE_EXACT_REMOTE_TIP" &&
    packet.repository.base_sha !== remoteTip
  ) {
    throw new Error(
      `packet base ${packet.repository.base_sha} is stale; origin target is ${remoteTip}`,
    );
  }
  if (packet.repository.stale_base_policy === "REQUIRED_UNRESOLVED") {
    throw new Error("packet stale-base policy is unresolved");
  }
  return { remote, head, remoteTip, remoteTipObservation, clean: true };
}

export const validateCodingAgentRepositoryPreflight =
  validateCodingAgentTargetRepositoryPreflight;

function buildTopLevelCurveRevisionModel(packet) {
  const normativeSourceRevision = packet.curve_binding.curve_revision;
  for (const reference of collectCodingAgentTaskPacketNormativeReferences(packet)) {
    validateReferenceRevision(
      packet,
      reference,
      CURVE_REFERENCE_ROLES.NORMATIVE_SOURCE,
    );
  }
  const evidencePublicationRevisions = new Set();
  if (packet.curve_binding.context_pack.resolution === "RESOLVED") {
    if (packet.curve_binding.context_pack.manifest.repository !== "CURVE") {
      throw new Error("context-pack manifest must be stored in CURVE");
    }
    evidencePublicationRevisions.add(
      packet.curve_binding.context_pack.manifest.revision,
    );
  }
  for (const item of collectCodingAgentTaskPacketStateBindings(packet)) {
    if (item.binding.resolution === "RESOLVED") {
      if (item.binding.evidence.repository !== "CURVE") {
        throw new Error(`${item.label} state evidence must be stored in CURVE`);
      }
      evidencePublicationRevisions.add(item.binding.evidence.revision);
    }
  }
  const sourceCatalogRevision = packet.source_catalog_binding.resolution === "RESOLVED"
    ? packet.source_catalog_binding.evidence.revision
    : null;
  if (
    packet.source_catalog_binding.resolution === "RESOLVED" &&
    packet.source_catalog_binding.evidence.repository !== "CURVE"
  ) {
    throw new Error("source catalog must be stored in CURVE");
  }
  const curveRevisions = new Set([normativeSourceRevision]);
  for (const reference of collectCodingAgentTaskPacketEvidenceReferences(packet)) {
    if (referenceRepository(reference) === "CURVE") {
      curveRevisions.add(reference.revision);
    }
  }
  const requiredAncestryEdges = [];
  for (const revision of evidencePublicationRevisions) {
    requiredAncestryEdges.push({
      ancestor: normativeSourceRevision,
      descendant: revision,
      relationship: "NORMATIVE_SOURCE_TO_EVIDENCE",
    });
    if (sourceCatalogRevision) {
      requiredAncestryEdges.push({
        ancestor: revision,
        descendant: sourceCatalogRevision,
        relationship: "EVIDENCE_TO_SOURCE_CATALOG",
      });
    }
  }
  if (sourceCatalogRevision) {
    requiredAncestryEdges.push({
      ancestor: normativeSourceRevision,
      descendant: sourceCatalogRevision,
      relationship: "NORMATIVE_SOURCE_TO_SOURCE_CATALOG",
    });
  }
  return {
    normativeSourceRevision,
    evidencePublicationRevisions: [...evidencePublicationRevisions].sort(),
    sourceCatalogRevision,
    curveRevisions: [...curveRevisions].sort(),
    requiredAncestryEdges,
  };
}

function assertGitAncestry(repository, ancestor, descendant, label) {
  assertGitCommit(repository, ancestor, `${label} ancestor`);
  assertGitCommit(repository, descendant, `${label} descendant`);
  const ancestry = runGitStatus(repository, [
    "merge-base",
    "--is-ancestor",
    ancestor,
    descendant,
  ]);
  if (ancestry.status !== 0) {
    throw new Error(`${label} requires ${ancestor} to be an ancestor of ${descendant}`);
  }
}

function validateCurvePublicationRevisionModel(
  packet,
  repository,
  liveMain,
  revisionModel,
) {
  const topLevelRevisionModel = buildTopLevelCurveRevisionModel(packet);
  if (revisionModel.normativeSourceRevision !== packet.curve_binding.curve_revision) {
    throw new Error("Curve publication model does not bind the packet normative source revision");
  }
  if (revisionModel.sourceCatalogRevision !== topLevelRevisionModel.sourceCatalogRevision) {
    throw new Error("Curve publication model omits or changes the packet source-catalog revision");
  }
  for (const [property, label] of [
    ["evidencePublicationRevisions", "evidence publication revision"],
    ["curveRevisions", "Curve revision"],
    ["requiredAncestryEdges", "required ancestry edge"],
  ]) {
    if (!Array.isArray(revisionModel[property])) {
      throw new Error(`Curve publication model ${property} must be an array`);
    }
    const supplied = new Set(
      revisionModel[property].map((value) => canonicalJsonString(value)),
    );
    for (const required of topLevelRevisionModel[property]) {
      if (!supplied.has(canonicalJsonString(required))) {
        throw new Error(`Curve publication model omits required ${label}`);
      }
    }
  }
  const revisions = new Set([
    packet.curve_binding.curve_revision,
    ...(revisionModel.curveRevisions ?? []),
    ...(revisionModel.evidencePublicationRevisions ?? []),
  ]);
  if (revisionModel.sourceCatalogRevision) {
    revisions.add(revisionModel.sourceCatalogRevision);
  }
  for (const revision of revisions) {
    assertGitAncestry(
      repository,
      revision,
      liveMain,
      "Curve published evidence must be merged into live main",
    );
  }
  for (const edge of revisionModel.requiredAncestryEdges ?? []) {
    assertGitAncestry(
      repository,
      edge.ancestor,
      edge.descendant,
      `Curve publication order ${edge.relationship}`,
    );
  }
  if (revisionModel.sourceCatalogRevision) {
    assertGitAncestry(
      repository,
      revisionModel.sourceCatalogRevision,
      liveMain,
      "Curve source catalog must precede registry publication",
    );
  }
  return {
    normativeSourceRevision: packet.curve_binding.curve_revision,
    evidencePublicationRevisions: [
      ...new Set(revisionModel.evidencePublicationRevisions ?? []),
    ].sort(),
    sourceCatalogRevision: revisionModel.sourceCatalogRevision ?? null,
    registryPublicationRevision: liveMain,
    curveRevisions: [...revisions].sort(),
  };
}

function validateCodingAgentCurveRepositoryPreflightInternal(
  packet,
  curveRepository,
  { testOnlyRemoteTipController, revisionModel } = {},
) {
  const repository = realpathSync(curveRepository);
  assertGitObjectTrust(repository, "Curve repository");
  const remote = assertRepositoryRemote(
    repository,
    packet.curve_binding.repository,
    "Curve repository",
  );
  assertGitCommit(repository, packet.curve_binding.curve_revision, "Curve revision");
  const head = runGit(repository, ["rev-parse", "HEAD"]).trim();
  const contractAncestry = runGitStatus(repository, [
    "merge-base",
    "--is-ancestor",
    packet.curve_binding.curve_revision,
    head,
  ]);
  if (contractAncestry.status !== 0) {
    throw new Error("packet Curve contract revision is not an ancestor of the Curve checkout");
  }
  const status = runGit(repository, ["status", "--porcelain=v1", "--untracked-files=all"]);
  if (status !== "") throw new Error("Curve repository worktree is not clean");
  const remoteTipObservation = resolveCodingAgentTrustedRemoteTip(
    repository,
    "main",
    "Curve repository",
    {
      testOnlyRemoteTipController,
      expectedRepositoryUrl: packet.curve_binding.repository,
    },
  );
  const remoteMain = remoteTipObservation.commit;
  assertGitCommit(repository, remoteMain, "Curve live main tip");
  if (remoteMain !== head) {
    throw new Error(
      `Curve checkout ${head} is not the exact live origin/main tip ${remoteMain}`,
    );
  }
  const publication = validateCurvePublicationRevisionModel(
    packet,
    repository,
    remoteMain,
    revisionModel,
  );
  return {
    remote,
    head,
    clean: true,
    curveRevision: packet.curve_binding.curve_revision,
    normativeSourceRevision: packet.curve_binding.curve_revision,
    remoteMain,
    remoteTipObservation,
    publication,
  };
}

export function validateCodingAgentCurveRepositoryPreflight(
  packet,
  curveRepository,
  options = {},
) {
  assertCodingAgentTaskPacketSchema(packet);
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new Error("Curve repository preflight options must be an object");
  }
  const unsupportedOptions = Object.keys(options).filter(
    (key) => key !== "testOnlyRemoteTipController",
  );
  if (unsupportedOptions.length > 0) {
    throw new Error(
      `Curve repository preflight does not accept caller-supplied option ${unsupportedOptions[0]}`,
    );
  }
  return validateCodingAgentCurveRepositoryPreflightInternal(
    packet,
    curveRepository,
    {
      testOnlyRemoteTipController: options.testOnlyRemoteTipController,
      revisionModel: buildTopLevelCurveRevisionModel(packet),
    },
  );
}

export function validateCodingAgentRegistryFilesPreflight(
  packets,
  packetPaths,
  curveRepository,
  { testOnlyRemoteTipController } = {},
) {
  if (!Array.isArray(packets) || !Array.isArray(packetPaths) || packets.length === 0) {
    throw new Error("canonical task-packet registry must be non-empty");
  }
  if (packets.length !== packetPaths.length) {
    throw new Error("task-packet registry paths do not match parsed packet records");
  }
  for (const packet of packets) assertCodingAgentTaskPacketSchema(packet);
  const repository = realpathSync(curveRepository);
  const head = runGit(repository, ["rev-parse", "HEAD"]).trim();
  const baseline = validateCodingAgentCurveRepositoryPreflight(
    packets[0],
    repository,
    {
      testOnlyRemoteTipController,
    },
  );
  const resolveGitEvidence = createGitEvidenceResolver({ CURVE: repository });
  const publicationModels = [];
  const files = packetPaths.map((path, index) => {
    const packet = packets[index];
    const absolutePath = realpathSync(path);
    const relation = relative(repository, absolutePath).split(sep).join("/");
    if (
      relation === ".." ||
      relation.startsWith("../") ||
      !relation.startsWith("contracts/task-packets/") ||
      !relation.endsWith(".json")
    ) {
      throw new Error(`registry packet ${packet.packet_id} is outside contracts/task-packets`);
    }
    if (!lstatSync(absolutePath).isFile()) {
      throw new Error(`registry packet ${packet.packet_id} is not a regular checkout file`);
    }
    const localBytes = readFileSync(absolutePath);
    const reference = {
      repository: "CURVE",
      title: `Canonical registry packet ${packet.packet_id}`,
      path: relation,
      revision: head,
      content_digest: sha256(localBytes),
    };
    const committedBytes = resolveGitEvidence(reference);
    if (!localBytes.equals(committedBytes)) {
      throw new Error(`registry packet ${packet.packet_id} local bytes differ from Curve ${head}`);
    }
    const committedPacket = parseJsonBytes(
      committedBytes,
      `registry packet ${packet.packet_id} committed bytes`,
    );
    assertExact(
      committedPacket,
      packet,
      `registry packet ${packet.packet_id} supplied object does not exactly match committed registry bytes`,
    );
    publicationModels.push(
      validateCurvePublicationRevisionModel(
        packet,
        repository,
        head,
        buildTopLevelCurveRevisionModel(packet),
      ),
    );
    return {
      packet_id: packet.packet_id,
      path: relation,
      revision: head,
      content_digest: reference.content_digest,
    };
  });
  return {
    ...baseline,
    registryPublicationRevision: head,
    publicationModels,
    files,
  };
}

function normalizeToolVersionOutput(value) {
  return String(value).replace(/\r\n?/gu, "\n").trim();
}

function assertExecutableFile(path, label) {
  const resolvedPath = realpathSync(path);
  const metadata = statSync(resolvedPath);
  if (!metadata.isFile() || (metadata.mode & 0o111) === 0) {
    throw new Error(`${label} is not a regular executable file`);
  }
  return { resolvedPath, metadata };
}

function inspectExecutableLauncher(path, label) {
  const launcherPath = resolve(path);
  const launcherMetadata = lstatSync(launcherPath);
  const launcherMode = launcherMetadata.isSymbolicLink()
    ? "SYMLINK_TO_CANONICAL"
    : "REGULAR_FILE_ONLY";
  if (!launcherMetadata.isSymbolicLink() && !launcherMetadata.isFile()) {
    throw new Error(`${label} is not a regular file or declared symlink launcher`);
  }
  const { resolvedPath } = assertExecutableFile(launcherPath, label);
  return {
    launcher_path: launcherPath,
    launcher_mode: launcherMode,
    canonical_executable_path: resolvedPath,
    canonical_executable_name: basename(resolvedPath),
  };
}

export function createLocalCodingAgentToolResolver(options = {}) {
  const pathValue = options.path ?? process.env.PATH ?? "";
  const pathEntries = pathValue.split(delimiter);
  if (
    pathEntries.length === 0 ||
    pathEntries.some((entry) => entry === "" || !isAbsolute(entry))
  ) {
    throw new Error("trusted tool PATH must contain only non-empty absolute entries");
  }
  return (tool) => {
    const candidates = [];
    for (const directory of pathEntries) {
      const candidate = resolve(directory, tool.executable);
      if (!existsSync(candidate)) continue;
      const identity = inspectExecutableLauncher(
        candidate,
        `tool ${tool.tool_id} PATH candidate`,
      );
      candidates.push(identity);
    }
    if (candidates.length === 0) {
      throw new Error(`tool ${tool.tool_id} executable ${tool.executable} was not found`);
    }
    if (candidates.length !== 1) {
      throw new Error(
        `tool ${tool.tool_id} executable is shadowed by ${candidates.length} distinct PATH candidates`,
      );
    }
    const identity = candidates[0];
    const executablePath = identity.launcher_path;
    const probe = tool.version_probe;
    const spawnOptions = {
      encoding: "utf8",
      env: {
        CI: "1",
        LANG: "C",
        LC_ALL: "C",
        NO_PROXY: "*",
        no_proxy: "*",
        PATH: dirname(executablePath),
        npm_config_offline: "true",
      },
      stdio: ["ignore", "pipe", "pipe"],
      timeout: Math.min(probe.timeout_seconds * 1000, options.timeoutMs ?? 10_000),
      maxBuffer: 8 * 1024,
    };
    let result;
    let networkIsolation;
    if (typeof options.runVersionProbe === "function") {
      result = options.runVersionProbe({
        executablePath,
        argv: [...probe.argv],
        spawnOptions,
      });
      networkIsolation = result?.network_isolation;
    } else if (process.platform === "darwin" && existsSync("/usr/bin/sandbox-exec")) {
      result = spawnSync(
        "/usr/bin/sandbox-exec",
        ["-p", "(version 1)(allow default)(deny network*)", executablePath, ...probe.argv.slice(1)],
        spawnOptions,
      );
      networkIsolation = "MACOS_SANDBOX_DENY_NETWORK";
    } else if (process.platform === "linux" && existsSync("/usr/bin/unshare")) {
      result = spawnSync(
        "/usr/bin/unshare",
        ["--net", "--", executablePath, ...probe.argv.slice(1)],
        spawnOptions,
      );
      networkIsolation = "LINUX_UNSHARE_NETWORK_NAMESPACE";
    } else {
      throw new Error(
        `tool ${tool.tool_id} has no trusted deny-network version-probe runner`,
      );
    }
    if (result.error || result.status !== 0) {
      const detail = result.stderr?.trim() || result.error?.message || `exit ${result.status}`;
      throw new Error(`tool ${tool.tool_id} version probe failed: ${detail}`);
    }
    const versionOutput = normalizeToolVersionOutput(
      result.stdout.trim() !== "" ? result.stdout : result.stderr,
    );
    return {
      ...identity,
      path_candidates: candidates.map((candidate) => ({ ...candidate })),
      content_digest: sha256(readFileSync(identity.canonical_executable_path)),
      probe_argv: [...probe.argv],
      version_output: versionOutput,
      network_isolation: networkIsolation,
      observed_at: new Date().toISOString(),
      source: "LOCAL_EXECUTABLE_PROBE",
    };
  };
}

function validateToolObservation(tool, observation) {
  if (observation === null || typeof observation !== "object" || Array.isArray(observation)) {
    throw new Error(`tool ${tool.tool_id} trusted resolver returned no observation`);
  }
  assertObjectWithExactKeys(
    observation,
    [
      "launcher_path", "launcher_mode", "canonical_executable_path",
      "canonical_executable_name", "path_candidates", "content_digest",
      "probe_argv", "version_output", "network_isolation", "observed_at", "source",
    ],
    `tool ${tool.tool_id} trusted observation`,
  );
  const executablePath = observation.launcher_path;
  if (typeof executablePath !== "string" || !isAbsolute(executablePath)) {
    throw new Error(`tool ${tool.tool_id} resolver did not return an absolute launcher path`);
  }
  const identity = inspectExecutableLauncher(executablePath, `tool ${tool.tool_id} executable`);
  assertExact(
    {
      launcher_path: observation.launcher_path,
      launcher_mode: observation.launcher_mode,
      canonical_executable_path: observation.canonical_executable_path,
      canonical_executable_name: observation.canonical_executable_name,
    },
    identity,
    `tool ${tool.tool_id} resolver identity differs from the canonical filesystem identity`,
  );
  if (basename(identity.launcher_path) !== tool.executable) {
    throw new Error(`tool ${tool.tool_id} launcher basename does not match ${tool.executable}`);
  }
  if (
    identity.launcher_mode !== tool.launcher_mode ||
    identity.canonical_executable_name !== tool.canonical_executable_name
  ) {
    throw new Error(`tool ${tool.tool_id} launcher or canonical executable identity is not approved`);
  }
  if (!Array.isArray(observation.path_candidates) || observation.path_candidates.length === 0) {
    throw new Error(`tool ${tool.tool_id} resolver did not report PATH candidates`);
  }
  const candidateIdentities = observation.path_candidates.map((candidate) => {
    assertObjectWithExactKeys(
      candidate,
      ["launcher_path", "launcher_mode", "canonical_executable_path", "canonical_executable_name"],
      `tool ${tool.tool_id} PATH candidate`,
    );
    return inspectExecutableLauncher(candidate.launcher_path, `tool ${tool.tool_id} PATH candidate`);
  });
  if (candidateIdentities.length !== 1) {
    throw new Error(`tool ${tool.tool_id} executable is shadowed or resolver path is inconsistent`);
  }
  assertExact(
    candidateIdentities[0],
    identity,
    `tool ${tool.tool_id} PATH candidate identity differs from the selected launcher`,
  );
  const contentDigest = sha256(readFileSync(identity.canonical_executable_path));
  if (
    observation.content_digest !== contentDigest ||
    contentDigest !== tool.executable_digest
  ) {
    throw new Error(`tool ${tool.tool_id} executable digest does not match the approved binding`);
  }
  assertExact(
    observation.probe_argv,
    tool.version_probe.argv,
    `tool ${tool.tool_id} resolver did not run the approved version probe`,
  );
  const actualVersion = normalizeToolVersionOutput(observation.version_output);
  if (actualVersion !== tool.version_probe.expected_output || !actualVersion.includes(tool.version)) {
    throw new Error(`tool ${tool.tool_id} version output does not match the approved version`);
  }
  if (![
    "MACOS_SANDBOX_DENY_NETWORK",
    "LINUX_UNSHARE_NETWORK_NAMESPACE",
    "TRUSTED_RUNNER_NETWORK_NONE",
  ].includes(observation.network_isolation)) {
    throw new Error(`tool ${tool.tool_id} version probe lacks trusted network isolation`);
  }
  if (typeof observation.observed_at !== "string" || Number.isNaN(Date.parse(observation.observed_at))) {
    throw new Error(`tool ${tool.tool_id} observation timestamp is invalid`);
  }
  assertNonEmptyString(observation.source, `tool ${tool.tool_id} observation source`);
  return {
    tool_id: tool.tool_id,
    tool_kind: tool.tool_kind,
    launcher_path: identity.launcher_path,
    canonical_executable_path: identity.canonical_executable_path,
    content_digest: contentDigest,
    version: tool.version,
    network_isolation: observation.network_isolation,
    observed_at: observation.observed_at,
    source: observation.source,
  };
}

export function validateCodingAgentToolsPreflight(packet, resolveTool) {
  assertCodingAgentTaskPacketSchema(packet);
  if (typeof resolveTool !== "function") {
    throw new Error("dispatch requires a trusted tool resolver");
  }
  const tools = new Map(packet.tool_policy.tools.map((tool) => [tool.tool_id, tool]));
  const toolIds = [...new Set(
    packet.commands
      .filter((command) => command.availability === "AVAILABLE")
      .map((command) => command.tool_id),
  )].sort();
  return toolIds.map((toolId) => {
    const tool = tools.get(toolId);
    if (!tool) throw new Error(`AVAILABLE command references unknown tool ${toolId}`);
    return validateToolObservation(
      tool,
      resolveTool(tool, {
        packet_id: packet.packet_id,
        workspace_id: packet.workspace_id,
        sandbox_runtime: packet.sandbox_policy.runtime,
        sandbox_image_digest: packet.sandbox_policy.image_digest,
      }),
    );
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function hasStableWorkPackageMarker(value, workPackageId) {
  if (typeof value !== "string") return false;
  const expression = new RegExp(
    `(?:^|[^A-Z0-9-])${escapeRegExp(workPackageId)}(?=$|[^A-Z0-9-])`,
    "iu",
  );
  return expression.test(value);
}

export function createGitHubProjectItemResolver(options = {}) {
  // A supplied immutable payload is a dependency-injection seam for contract
  // tests. Production callers omit it and use the read-only gh resolver below.
  if (Array.isArray(options.items)) {
    const items = structuredClone(options.items);
    return ({ itemNodeId }) => items.find((item) => item.id === itemNodeId) ?? null;
  }
  const { owner = "faocampo" } = options;
  const cache = new Map();
  return ({ projectNumber, itemNodeId }) => {
    if (!cache.has(projectNumber)) {
      const output = execFileSync(
        "gh",
        [
          "project",
          "item-list",
          String(projectNumber),
          "--owner",
          owner,
          "--format",
          "json",
          "--limit",
          "1000",
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
      const payload = JSON.parse(output);
      cache.set(projectNumber, payload.items ?? []);
    }
    return cache.get(projectNumber).find((item) => item.id === itemNodeId) ?? null;
  };
}

export function validateCodingAgentProjectTracking(packet, resolveProjectItem) {
  assertCodingAgentTaskPacketSchema(packet);
  if (typeof resolveProjectItem !== "function") {
    throw new Error("live GitHub Project resolution is required for dispatch");
  }
  const item = resolveProjectItem({
    projectNumber: packet.project_tracking.project_number,
    itemNodeId: packet.project_tracking.item_node_id,
    workPackageId: packet.work_package_id,
  });
  if (!item) {
    throw new Error(`Project item ${packet.project_tracking.item_node_id} was not found`);
  }
  if (item.id !== packet.project_tracking.item_node_id) {
    throw new Error("live Project item node ID does not match the packet");
  }
  if (packet.project_tracking.tracking_kind !== "WORK_PACKAGE") {
    throw new Error("dispatch Project item must be classified as WORK_PACKAGE");
  }
  const contentType = item.content?.type ?? item.content_type ?? item.type ?? null;
  if (contentType === "PullRequest" || contentType === "PULL_REQUEST") {
    throw new Error("a pull request is definition evidence, not a WORK_PACKAGE Project item");
  }
  const texts = [item.title, item.body, item.content?.title, item.content?.body];
  if (!texts.some((value) => hasStableWorkPackageMarker(value, packet.work_package_id))) {
    throw new Error(
      `Project item ${item.id} lacks stable work-package marker ${packet.work_package_id}`,
    );
  }
  // Live and packet status are intentionally not compared: Project status is
  // visual metadata and has no readiness or implementation-authority effect.
  return {
    itemNodeId: item.id,
    contentType,
    liveStatus: item.status ?? null,
  };
}

function validateCodingAgentTaskPacketForReadinessPreflightInternal(
  packet,
  {
    resolveReference,
    resolveProjectItem,
    curveRepository,
    targetRepository,
    targetRepositoryRoot,
    resolveTool,
  } = {},
  {
    testOnlyRemoteTipController,
  } = {},
) {
  validateCodingAgentTaskPacketSemantics(packet);
  if (packet.status !== "READY") throw new Error("only READY packets enter readiness preflight");
  const evidence = validateCodingAgentTaskPacketEvidence(packet, { resolveReference });
  const targetRoot = targetRepository ?? targetRepositoryRoot;
  if (!curveRepository || !targetRoot) {
    throw new Error("Curve and target repository preflight bindings are required");
  }
  const repositories = {
    curve: validateCodingAgentCurveRepositoryPreflightInternal(packet, curveRepository, {
      testOnlyRemoteTipController,
      revisionModel: evidence.revisionModel,
    }),
    target: validateCodingAgentTargetRepositoryPreflight(packet, targetRoot, {
      testOnlyRemoteTipController,
    }),
  };
  const tools = validateCodingAgentToolsPreflight(packet, resolveTool);
  const project = validateCodingAgentProjectTracking(packet, resolveProjectItem);
  return {
    packet_digest: packet.packet_digest,
    context_digest: packet.curve_binding.context_pack.context_digest,
    evidence,
    repositories,
    tools,
    project,
    readiness_preflight_passed: true,
    state_authority_verification: "REQUIRED_BEFORE_IMPLEMENTATION",
    blockers: ["B-CODING-AUTHORITY-01"],
    implementation_authority_granted: false,
  };
}

function assertProductionReadinessOptions(options) {
  for (const prohibitedOption of [
    "repositoryPreflight",
    "resolveRemoteTip",
    "testOnlyRemoteTipController",
  ]) {
    if (Object.prototype.hasOwnProperty.call(options, prohibitedOption)) {
      throw new Error(
        `production dispatch does not accept ${prohibitedOption}; repository trust is validated internally`,
      );
    }
  }
}

export function validateCodingAgentTaskPacketForReadinessPreflight(
  packet,
  options = {},
) {
  assertProductionReadinessOptions(options);
  return validateCodingAgentTaskPacketForReadinessPreflightInternal(packet, options);
}

export function validateCodingAgentTaskPacketForDispatch(packet, options = {}) {
  validateCodingAgentTaskPacketSemantics(packet);
  if (packet.status !== "READY") throw new Error("only READY packets dispatch");
  assertProductionReadinessOptions(options);
  throw new Error(
    "dispatch is fail-closed until a trusted external state-authority and deterministic-derivation verifier contract is approved and implemented",
  );
}

export function validateCodingAgentTaskPacketForDispatchWithTestControllers(
  packet,
  options,
  { remoteTipController } = {},
) {
  if (!remoteTipController?.[TRUSTED_REMOTE_TIP_TEST_CONTROLLER]) {
    throw new Error("dispatch test seam requires a tagged remote-tip test controller");
  }
  return validateCodingAgentTaskPacketForReadinessPreflightInternal(packet, options, {
    testOnlyRemoteTipController: remoteTipController,
  });
}

export function validateCodingAgentTaskPacketForReadinessPreflightWithTestControllers(
  packet,
  options,
  { remoteTipController } = {},
) {
  if (!remoteTipController?.[TRUSTED_REMOTE_TIP_TEST_CONTROLLER]) {
    throw new Error("readiness-preflight test seam requires a tagged remote-tip test controller");
  }
  return validateCodingAgentTaskPacketForReadinessPreflightInternal(packet, options, {
    testOnlyRemoteTipController: remoteTipController,
  });
}

export function discoverCodingAgentTaskPacketFiles(directory) {
  const discovered = [];
  if (!existsSync(directory)) return discovered;
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && entry.name.endsWith(".json")) discovered.push(path);
    }
  }
  walk(directory);
  return discovered.sort((left, right) => left.localeCompare(right));
}
