import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  executeValidatedSingleExistingItemStatusUpdate,
  extractLegacyProjectedStatus,
  extractNormativeSourceRevision,
  selectUniqueProjectItem,
  validateSingleApplyRequest,
} from "./lib/p0-06-policy.mjs";

const OWNER = "faocampo";
const PROJECT_NUMBER = "2";
const EXPECTED_TASK_COUNT = 70;
const DEVELOPMENT_PLAN = resolve("docs/technical/development-plan.md");
const P0_06_STAGE_RECORD_PATH = "docs/technical/proofs/p0-06-stage-record.json";
const MERGED_SOURCE_REF = "origin/main";
const CONTEXT_SOURCE_REF = process.env.CURVE_PROJECT_SOURCE_REF ?? MERGED_SOURCE_REF;
const VALID_STATUSES = new Set(["Backlog", "Ready", "In progress", "In review", "Done"]);

const initialStatus = new Map([
  ["P0-01", "Done"],
  ["P0-02", "In review"],
  ["P0-03", "In progress"],
  ["P0-04", "Done"],
  ["P0-05", "Ready"],
]);

const proofStageRecordPaths = new Map([["P0-06", P0_06_STAGE_RECORD_PATH]]);
const contextPaths = new Map([
  [
    "M0-03",
    [
      "contracts/database/m0-03-policy-contract.md",
      "contracts/policy/core-policy-v1.json",
      "contracts/schemas/core-policy-manifest.schema.json",
      "contracts/schemas/policy-decision.schema.json",
      "contracts/schemas/policy-evaluation.schema.json",
      "docs/curve-ai-native-sdlc-prd.md",
      "docs/technical/architecture.md",
      "docs/technical/domain-model.md",
      "docs/technical/m0-03-core-policy-task-packet.md",
      "docs/technical/m0-authorization-and-state-matrices.md",
      "docs/technical/m0-s2-implementation-evidence.md",
      "docs/technical/security-and-operations.md",
    ],
  ],
  [
    "P0-06",
    [
      "contracts/temporal/m0-workflow-contract.md",
      "docs/technical/adr-003-runtime-topology.md",
      "docs/technical/development-plan.md",
      "docs/technical/m0-readiness-board.md",
      "docs/technical/p0-06-local-temporal-proof-task-packet.md",
    ],
  ],
]);

function ghArguments(args) {
  return args[0] === "api"
    ? [
        "api",
        "-H",
        "Accept: application/vnd.github+json",
        "-H",
        "X-GitHub-Api-Version: 2026-03-10",
        ...args.slice(1),
      ]
    : args;
}

function gh(args) {
  const output = execFileSync("gh", ghArguments(args), {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return output.trim() ? JSON.parse(output) : {};
}

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function gitBytes(args) {
  return execFileSync("git", args, { stdio: ["ignore", "pipe", "pipe"] });
}

function gitObjectExists(object) {
  try {
    execFileSync("git", ["cat-file", "-e", object], {
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function isAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function parseArguments(argv) {
  const result = {
    apply: false,
    contextTaskId: null,
    validateStatus: null,
    statuses: new Map(),
    statusAssignments: [],
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    if (argument === "--apply") {
      result.apply = true;
      continue;
    }
    if (argument === "--status") {
      const assignment = argv[index + 1];
      index += 1;
      if (!assignment?.includes("=")) throw new Error("--status requires TASK-ID=STATUS");
      const separator = assignment.indexOf("=");
      const taskId = assignment.slice(0, separator);
      const status = assignment.slice(separator + 1);
      if (!VALID_STATUSES.has(status)) {
        throw new Error(`Unsupported status '${status}'. Use ${[...VALID_STATUSES].join(", ")}.`);
      }
      if (result.statuses.has(taskId)) throw new Error(`Duplicate --status assignment for ${taskId}.`);
      result.statuses.set(taskId, status);
      result.statusAssignments.push({ taskId, status });
      continue;
    }
    if (argument === "--context") {
      if (result.contextTaskId) throw new Error("--context may be specified only once.");
      result.contextTaskId = argv[index + 1] ?? null;
      index += 1;
      if (!result.contextTaskId) throw new Error("--context requires TASK-ID");
      continue;
    }
    if (argument === "--validate-status") {
      if (result.validateStatus) throw new Error("--validate-status may be specified only once.");
      const assignment = argv[index + 1];
      index += 1;
      if (!assignment?.includes("=")) throw new Error("--validate-status requires TASK-ID=STATUS");
      const separator = assignment.indexOf("=");
      const taskId = assignment.slice(0, separator);
      const status = assignment.slice(separator + 1);
      if (!VALID_STATUSES.has(status)) {
        throw new Error(`Unsupported status '${status}'. Use ${[...VALID_STATUSES].join(", ")}.`);
      }
      result.validateStatus = { taskId, status };
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  if (result.statuses.size > 0 && !result.apply) throw new Error("--status changes require --apply");
  if (result.contextTaskId && result.apply) throw new Error("--context is read-only and cannot be combined with --apply");
  if (result.validateStatus && result.apply) {
    throw new Error("--validate-status is read-only and cannot be combined with --apply");
  }
  if (result.contextTaskId && result.validateStatus) {
    throw new Error("Use only one of --context or --validate-status.");
  }
  return result;
}

function phaseFor(id) {
  if (id.startsWith("P0-")) return Number(id.slice(3)) <= 6 ? "P0A" : "P0B";
  return id.split("-")[0];
}

function parseTasks(markdown) {
  const tasks = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!/^\| (?:P0|M[0-7]|R1)-\d{2} \|/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 5 && cells.length !== 6) {
      throw new Error(`Unexpected work-package row shape: ${line}`);
    }
    const [id, size, deliverable, dependencies] = cells;
    const trace = cells.length === 6 ? cells[4] : "";
    const completionEvidence = cells.length === 6 ? cells[5] : cells[4];
    tasks.push({
      id,
      size,
      deliverable,
      dependencies,
      trace,
      completionEvidence,
      phase: phaseFor(id),
    });
  }
  const ids = new Set(tasks.map((task) => task.id));
  if (tasks.length !== EXPECTED_TASK_COUNT || ids.size !== EXPECTED_TASK_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_TASK_COUNT} unique work packages; found ${tasks.length} rows and ${ids.size} unique IDs.`,
    );
  }
  return tasks;
}

function shortenedTitle(task) {
  const prefix = `[${task.id}] `;
  const maximum = 240 - prefix.length;
  if (task.deliverable.length <= maximum) return `${prefix}${task.deliverable}`;
  const candidate = task.deliverable.slice(0, maximum - 1);
  const boundary = candidate.lastIndexOf(" ");
  return `${prefix}${candidate.slice(0, boundary > 80 ? boundary : candidate.length)}…`;
}

function contextDigestFor(taskId, sourceRevision, allowMissing = false) {
  const paths = contextPaths.get(taskId);
  if (!paths) return null;
  const digest = createHash("sha256");
  digest.update("curve-context-pack:v1\0");
  for (const path of [...paths].sort()) {
    const object = `${sourceRevision}:${path}`;
    if (allowMissing && !gitObjectExists(object)) return null;
    const contents = gitBytes(["show", object]);
    digest.update(path);
    digest.update("\0");
    digest.update(String(contents.length));
    digest.update("\0");
    digest.update(contents);
    digest.update("\0");
  }
  return `sha256:${digest.digest("hex")}`;
}

function parseProofStageProjection(taskId, path, contents) {
  let record;
  try {
    record = JSON.parse(contents.toString("utf8"));
  } catch (error) {
    throw new Error(`Invalid proof stage record JSON for ${taskId}: ${error.message}`);
  }
  const canonical = Buffer.from(`${JSON.stringify(record, null, 2)}\n`, "utf8");
  if (!contents.equals(canonical)) {
    throw new Error(`Proof stage record for ${taskId} must be canonical UTF-8 JSON.`);
  }
  if (record.schema_version !== "curve.proof-stage-projection/v2") {
    throw new Error(`Unsupported proof stage record schema for ${taskId}: ${record.schema_version}`);
  }
  if (record.task_id !== taskId) throw new Error(`Proof stage record task mismatch for ${taskId}.`);
  const stageKey = Object.keys(record.stages ?? {}).find((candidate) => record.current_stage?.startsWith(candidate));
  const stage = stageKey ? record.stages[stageKey] : null;
  if (!stageKey || !stage?.authorization || !stage?.claim || !stage?.review) {
    throw new Error(`Incomplete current proof stage record for ${taskId}.`);
  }
  return {
    path,
    digest: `sha256:${createHash("sha256").update(contents).digest("hex")}`,
    record,
    stageKey,
    stage,
  };
}

function proofStageProjectionFor(taskId, sourceRevision, allowMissing = false) {
  const path = proofStageRecordPaths.get(taskId);
  if (!path) return null;
  const object = `${sourceRevision}:${path}`;
  if (allowMissing && !gitObjectExists(object)) return null;
  return parseProofStageProjection(taskId, path, gitBytes(["show", object]));
}

function localProofStageProjectionFor(taskId) {
  const path = proofStageRecordPaths.get(taskId);
  if (!path) return null;
  return parseProofStageProjection(taskId, path, readFileSync(resolve(path)));
}

function stageSummary(projection) {
  const { path, digest, record, stageKey, stage } = projection;
  const readiness = Object.values(stage.readiness ?? {});
  return {
    path,
    digest,
    currentStage: record.current_stage,
    stageKey,
    description: stage.description,
    authorizationId: stage.authorization.id ?? null,
    authorizationState: stage.authorization.state,
    readinessPopulated: readiness.filter(Boolean).length,
    readinessTotal: readiness.length,
    claimState: stage.claim.state,
    reviewDisposition: stage.review.disposition,
    executionAuthorized: false,
    projectStatusMutable: true,
  };
}

function bodyFor(task, sourceRevision, allowMissingContext = false) {
  const traceLine = task.trace ? `- PRD trace: ${task.trace}\n` : "";
  const contextDigest = contextDigestFor(task.id, sourceRevision, allowMissingContext);
  const contextLine = contextDigest ? `- Context digest: \`${contextDigest}\`\n` : "";
  const projection = proofStageProjectionFor(task.id, sourceRevision, allowMissingContext);
  let proofLines = "";
  if (projection) {
    const summary = stageSummary(projection);
    proofLines =
      `- Proof stage record: \`${summary.path}\`\n` +
      `- Proof stage record digest: \`${summary.digest}\`\n` +
      `- Current proof stage: \`${summary.currentStage}\` (${summary.description})\n` +
      `- Authorization: \`${summary.authorizationId ?? "UNASSIGNED"}\` / \`${summary.authorizationState}\`\n` +
      `- Readiness fields: \`${summary.readinessPopulated}/${summary.readinessTotal}\` populated\n` +
      `- Claim state: \`${summary.claimState}\`\n` +
      `- Review disposition: \`${summary.reviewDisposition}\`\n` +
      `- Project status authority: \`INFORMATIONAL_ONLY\`\n` +
      `- Proof record source: https://github.com/${OWNER}/curve/blob/${sourceRevision}/${summary.path}\n`;
  }
  return `<!-- curve-project-sync:v1 id=${task.id} -->
## Curve work package

- ID: ${task.id}
- Phase: ${task.phase}
- Size: ${task.size}
- Dependencies: ${task.dependencies}
${traceLine}- Interim human reviewer: Federico Ocampo (\`faocampo\`)
- Normative source revision: \`${sourceRevision}\`
${contextLine}${proofLines}- Source: https://github.com/${OWNER}/curve/blob/${sourceRevision}/docs/technical/development-plan.md

## Deliverable

${task.deliverable}

## Completion evidence

${task.completionEvidence}

## Tracking rule

Use the Project status to show the team's current view of progress. It is visual tracking metadata and does not approve a product decision, authorize execution, waive a control, or replace the normative task packet and evidence.
`;
}

function legacyBodyFor(task, status, sourceRevision) {
  const traceLine = task.trace ? `- PRD trace: ${task.trace}\n` : "";
  return `<!-- curve-project-sync:v1 id=${task.id} -->
## Curve work package

- ID: ${task.id}
- Phase: ${task.phase}
- Size: ${task.size}
- Curve status: ${status}
- Dependencies: ${task.dependencies}
${traceLine}- Interim human reviewer: Federico Ocampo (\`faocampo\`)
- Normative source revision: \`${sourceRevision}\`
- Source: https://github.com/${OWNER}/curve/blob/${sourceRevision}/docs/technical/development-plan.md

## Deliverable

${task.deliverable}

## Completion evidence

${task.completionEvidence}

## Execution rule

Move this item to \`In progress\` immediately before an authorized execution step, to \`In review\` when its exact output is awaiting human review, and to \`Done\` only after its acceptance evidence and dependency gates are satisfied. Use \`Backlog\` for blocked or not-yet-ready work and \`Ready\` only when the package meets Curve's complete codeability definition.
`;
}

function priorBodyFor(task, observedBody, sourceRevision) {
  const synchronizerObject = `${sourceRevision}:scripts/sync-github-project.mjs`;
  const informationalBodySupported =
    gitObjectExists(synchronizerObject) &&
    gitBytes(["show", synchronizerObject]).includes(Buffer.from("INFORMATIONAL_ONLY", "utf8"));
  if (informationalBodySupported) return bodyFor(task, sourceRevision, true);
  return legacyBodyFor(task, extractLegacyProjectedStatus(observedBody), sourceRevision);
}

function currentStatusFor(item) {
  const status = item?.status ?? item?.Status;
  if (!VALID_STATUSES.has(status)) throw new Error(`Missing or unsupported Project status: ${status}`);
  return status;
}

function loadUniqueProjectItem(taskId) {
  const listed = gh([
    "project",
    "item-list",
    PROJECT_NUMBER,
    "--owner",
    OWNER,
    "--limit",
    "500",
    "--format",
    "json",
  ]);
  if (!Array.isArray(listed.items)) throw new Error("GitHub Project item list is missing.");
  return selectUniqueProjectItem(listed.items, taskId);
}

function assertOwnedDraftItem(taskId, item) {
  if (
    typeof item?.id !== "string" ||
    !item.id.startsWith("PVTI_") ||
    typeof item.content?.id !== "string" ||
    !item.content.id.startsWith("DI_") ||
    !item.content?.body?.includes(`<!-- curve-project-sync:v1 id=${taskId} -->`)
  ) {
    throw new Error(`${taskId} is not one existing synchronizer-owned draft item.`);
  }
}

function assertSameProjectIdentity(taskId, item, planned) {
  assertOwnedDraftItem(taskId, item);
  if (item.id !== planned.item.id || item.content.id !== planned.item.content.id) {
    throw new Error(`${taskId} Project item identity changed.`);
  }
}

function fieldByName(fields, name) {
  const field = fields.find((candidate) => candidate.name === name);
  if (!field) throw new Error(`Project field '${name}' is required.`);
  if (typeof field.id !== "string" || !/^PVT(?:SSF|F)_/.test(field.id)) {
    throw new Error(`Project field '${name}' has an invalid ID: ${field.id}`);
  }
  return field;
}

function optionId(field, name) {
  const option = field.options?.find((candidate) => candidate.name === name);
  if (!option || typeof option.id !== "string" || option.id.length === 0) {
    throw new Error(`Project field '${field.name}' has no valid '${name}' option.`);
  }
  return option.id;
}

function setSingleSelect(itemId, projectId, field, value) {
  gh([
    "project",
    "item-edit",
    "--id",
    itemId,
    "--project-id",
    projectId,
    "--field-id",
    field.id,
    "--single-select-option-id",
    optionId(field, value),
    "--format",
    "json",
  ]);
}

function refreshSingleItemState(taskId, planned, sourceRevision) {
  git(["fetch", "--quiet", "origin", "main"]);
  const refreshedSource = git(["rev-parse", "--verify", "--end-of-options", `${MERGED_SOURCE_REF}^{commit}`]);
  const refreshedHead = git(["rev-parse", "--verify", "--end-of-options", "HEAD^{commit}"]);
  const liveMain = gh(["api", `repos/${OWNER}/curve/git/ref/heads/main`]);
  if (
    refreshedSource !== sourceRevision ||
    refreshedHead !== sourceRevision ||
    liveMain.object?.sha !== sourceRevision
  ) {
    throw new Error(`${taskId} source or GitHub main changed during apply; the operation is fenced.`);
  }
  const item = loadUniqueProjectItem(taskId);
  assertSameProjectIdentity(taskId, item, planned);
  const status = currentStatusFor(item);
  if (status === planned.status && item.title === planned.title && item.content.body === planned.body) {
    return "COMPLETE_EXACT";
  }
  if (
    status === planned.initialStatus &&
    item.title === planned.initialTitle &&
    item.content.body === planned.initialBody
  ) {
    return "INITIAL_EXACT";
  }
  if (status === planned.initialStatus && item.title === planned.title && item.content.body === planned.body) {
    return "BODY_ONLY_EXACT";
  }
  return "UNEXPECTED";
}

const args = parseArguments(process.argv.slice(2));

if (args.validateStatus) {
  const tasks = parseTasks(readFileSync(DEVELOPMENT_PLAN, "utf8"));
  if (!tasks.some((task) => task.id === args.validateStatus.taskId)) {
    throw new Error(`Unknown task ID: ${args.validateStatus.taskId}`);
  }
  console.log(
    JSON.stringify(
      {
        mode: "validate-status",
        taskId: args.validateStatus.taskId,
        status: args.validateStatus.status,
        valid: true,
        projectStatusAuthority: "informational-only",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (args.contextTaskId) {
  const sourceRevision = git(["rev-parse", "--verify", "--end-of-options", `${CONTEXT_SOURCE_REF}^{commit}`]);
  const tasks = parseTasks(gitBytes(["show", `${sourceRevision}:docs/technical/development-plan.md`]).toString("utf8"));
  if (!tasks.some((task) => task.id === args.contextTaskId)) {
    throw new Error(`Unknown task ID: ${args.contextTaskId}`);
  }
  const contextDigest = contextDigestFor(args.contextTaskId, sourceRevision);
  if (!contextDigest) throw new Error(`No context-path manifest for ${args.contextTaskId}.`);
  const projection = proofStageProjectionFor(args.contextTaskId, sourceRevision);
  console.log(
    JSON.stringify(
      {
        mode: "context",
        taskId: args.contextTaskId,
        sourceRevision,
        contextDigest,
        proofStage: projection ? stageSummary(projection) : null,
        executionAuthorized: false,
        projectStatusMutable: true,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (!args.apply) {
  const tasks = parseTasks(readFileSync(DEVELOPMENT_PLAN, "utf8"));
  const proofStageRecords = [...proofStageRecordPaths.keys()].map((taskId) => ({
    taskId,
    ...stageSummary(localProofStageProjectionFor(taskId)),
  }));
  const counts = tasks.reduce((result, task) => {
    const status = initialStatus.get(task.id) ?? "Backlog";
    result[status] = (result[status] ?? 0) + 1;
    return result;
  }, {});
  console.log(
    JSON.stringify(
      {
        mode: "dry-run",
        project: `${OWNER}/${PROJECT_NUMBER}`,
        tasks: tasks.length,
        counts,
        proofStageRecords,
        applyPolicy: "single-existing-item-explicit-status-only",
        projectStatusAuthority: "informational-only",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const applyAssignment = validateSingleApplyRequest({
  assignments: args.statusAssignments,
});

if (process.env.CURVE_PROJECT_SOURCE_REF) {
  throw new Error("CURVE_PROJECT_SOURCE_REF is permitted only with read-only commands.");
}
if (git(["status", "--porcelain"])) {
  throw new Error("Write-mode synchronization requires a clean worktree.");
}
git(["fetch", "--quiet", "origin", "main"]);
const sourceRevision = git(["rev-parse", "--verify", "--end-of-options", `${MERGED_SOURCE_REF}^{commit}`]);
const currentHead = git(["rev-parse", "--verify", "--end-of-options", "HEAD^{commit}"]);
if (currentHead !== sourceRevision) {
  throw new Error(`Write-mode checkout HEAD ${currentHead} must equal origin/main ${sourceRevision}.`);
}
const liveMain = gh(["api", `repos/${OWNER}/curve/git/ref/heads/main`]);
if (liveMain.object?.sha !== sourceRevision) {
  throw new Error(`origin/main ${sourceRevision} does not match GitHub main ${liveMain.object?.sha ?? "<missing>"}.`);
}

const tasks = parseTasks(gitBytes(["show", `${sourceRevision}:docs/technical/development-plan.md`]).toString("utf8"));
const task = tasks.find((candidate) => candidate.id === applyAssignment.taskId);
if (!task) throw new Error(`Unknown task ID: ${applyAssignment.taskId}`);

const project = gh(["project", "view", PROJECT_NUMBER, "--owner", OWNER, "--format", "json"]);
if (typeof project.id !== "string" || !project.id.startsWith("PVT_")) {
  throw new Error(`GitHub Project has an invalid ID: ${project.id}`);
}
const fieldResult = gh([
  "project",
  "field-list",
  PROJECT_NUMBER,
  "--owner",
  OWNER,
  "--limit",
  "100",
  "--format",
  "json",
]);
if (!Array.isArray(fieldResult.fields)) throw new Error("GitHub Project field list is missing.");
const statusField = fieldByName(fieldResult.fields, "Status");
const targetOptionId = optionId(statusField, applyAssignment.status);

const item = loadUniqueProjectItem(task.id);
assertOwnedDraftItem(task.id, item);

const observedInitialStatus = currentStatusFor(item);
const targetTitle = shortenedTitle(task);
const targetBody = bodyFor(task, sourceRevision);
let priorSourceRevision = null;
let priorIsAncestor = null;
let priorTitle = null;
let priorBody = null;
let priorStatus = null;
if (item.title !== targetTitle || item.content.body !== targetBody) {
  priorSourceRevision = extractNormativeSourceRevision(item.content.body);
  let resolvedPriorSource;
  try {
    resolvedPriorSource = git(["rev-parse", "--verify", "--end-of-options", `${priorSourceRevision}^{commit}`]);
  } catch {
    throw new Error(`${task.id} prior normative source ${priorSourceRevision} is unavailable locally.`);
  }
  priorIsAncestor = resolvedPriorSource === priorSourceRevision && isAncestor(priorSourceRevision, sourceRevision);
  if (!priorIsAncestor) {
    throw new Error(`${task.id} prior normative source is not an exact ancestor of current merged source.`);
  }
  const priorTasks = parseTasks(
    gitBytes(["show", `${priorSourceRevision}:docs/technical/development-plan.md`]).toString("utf8"),
  );
  const priorTask = priorTasks.find((candidate) => candidate.id === task.id);
  if (!priorTask) throw new Error(`${task.id} is absent from its prior normative development plan.`);
  priorTitle = shortenedTitle(priorTask);
  priorBody = priorBodyFor(priorTask, item.content.body, priorSourceRevision);
  priorStatus = observedInitialStatus;
}
const preflightProjection = {
  taskId: task.id,
  currentSourceRevision: sourceRevision,
  priorSourceRevision,
  priorIsAncestor,
  priorTitle,
  priorBody,
  priorStatus,
  itemTitle: item.title,
  itemBody: item.content.body,
  itemStatus: observedInitialStatus,
  targetTitle,
  targetBody,
  targetStatus: applyAssignment.status,
};

const planned = {
  task,
  item,
  status: applyAssignment.status,
  title: targetTitle,
  body: targetBody,
  initialStatus: observedInitialStatus,
  initialTitle: priorTitle,
  initialBody: priorBody,
};

const result = executeValidatedSingleExistingItemStatusUpdate({
  initial: preflightProjection,
  io: {
    refresh() {
      return refreshSingleItemState(task.id, planned, sourceRevision);
    },
    writeBody() {
      gh([
        "project",
        "item-edit",
        "--id",
        item.content.id,
        "--title",
        planned.title,
        "--body",
        planned.body,
        "--format",
        "json",
      ]);
    },
    writeStatus() {
      const refreshedFields = gh([
        "project",
        "field-list",
        PROJECT_NUMBER,
        "--owner",
        OWNER,
        "--limit",
        "100",
        "--format",
        "json",
      ]);
      if (!Array.isArray(refreshedFields.fields)) throw new Error("GitHub Project field list is missing.");
      const refreshedStatusField = fieldByName(refreshedFields.fields, "Status");
      if (
        refreshedStatusField.id !== statusField.id ||
        optionId(refreshedStatusField, applyAssignment.status) !== targetOptionId
      ) {
        throw new Error(`${task.id} Project status field or option changed during apply; the operation is fenced.`);
      }
      if (refreshSingleItemState(task.id, planned, sourceRevision) !== "BODY_ONLY_EXACT") {
        throw new Error(`${task.id} changed immediately before its status write; the operation is fenced.`);
      }
      setSingleSelect(item.id, project.id, refreshedStatusField, applyAssignment.status);
    },
  },
});

console.log(
  JSON.stringify(
    {
      mode: "apply-single-existing-item",
      project: project.url,
      taskId: task.id,
      status: applyAssignment.status,
      sourceRevision,
      receipt: result.receipt,
      reconciled: result.reconciled,
    },
    null,
    2,
  ),
);
