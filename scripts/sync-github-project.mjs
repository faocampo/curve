import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const OWNER = "faocampo";
const PROJECT_NUMBER = "2";
const EXPECTED_TASK_COUNT = 70;
const DEVELOPMENT_PLAN = resolve("docs/technical/development-plan.md");
const SOURCE_REF = "origin/main";
const VALID_STATUSES = new Set(["Backlog", "Ready", "In progress", "In review", "Done"]);

const initialStatus = new Map([
  ["P0-01", "Done"],
  ["P0-02", "In review"],
  ["P0-03", "In progress"],
  ["P0-04", "Done"],
  ["P0-05", "Ready"],
]);

function gh(args) {
  const output = execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return output.trim() ? JSON.parse(output) : {};
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function parseArguments(argv) {
  const result = { apply: false, statuses: new Map() };
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
      result.statuses.set(taskId, status);
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  if (result.statuses.size > 0 && !result.apply) throw new Error("--status changes require --apply");
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
    tasks.push({ id, size, deliverable, dependencies, trace, completionEvidence, phase: phaseFor(id) });
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

function currentStatusFor(item) {
  return item?.status ?? item?.Status ?? "Backlog";
}

function bodyFor(task, status, sourceRevision) {
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

function fieldByName(fields, name) {
  const field = fields.find((candidate) => candidate.name === name);
  if (!field) throw new Error(`Project field '${name}' is required.`);
  return field;
}

function optionId(field, name) {
  const option = field.options?.find((candidate) => candidate.name === name);
  if (!option) throw new Error(`Project field '${field.name}' has no '${name}' option.`);
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

const args = parseArguments(process.argv.slice(2));
const tasks = parseTasks(readFileSync(DEVELOPMENT_PLAN, "utf8"));
for (const taskId of args.statuses.keys()) {
  if (!tasks.some((task) => task.id === taskId)) throw new Error(`Unknown task ID: ${taskId}`);
}

if (!args.apply) {
  const counts = tasks.reduce((result, task) => {
    const status = initialStatus.get(task.id) ?? "Backlog";
    result[status] = (result[status] ?? 0) + 1;
    return result;
  }, {});
  console.log(JSON.stringify({ mode: "dry-run", project: `${OWNER}/${PROJECT_NUMBER}`, tasks: tasks.length, counts }, null, 2));
  process.exit(0);
}

const project = gh(["project", "view", PROJECT_NUMBER, "--owner", OWNER, "--format", "json"]);
const fieldResult = gh(["project", "field-list", PROJECT_NUMBER, "--owner", OWNER, "--limit", "100", "--format", "json"]);
const statusField = fieldByName(fieldResult.fields, "Status");
const sizeField = fieldByName(fieldResult.fields, "Size");
for (const status of VALID_STATUSES) optionId(statusField, status);
for (const size of new Set(tasks.map((task) => task.size))) optionId(sizeField, size);

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
const existingById = new Map();
for (const item of listed.items) {
  const match = /^\[((?:P0|M[0-7]|R1)-\d{2})\]/.exec(item.title ?? "");
  if (match) {
    if (existingById.has(match[1])) throw new Error(`Duplicate project items for ${match[1]}`);
    const marker = `<!-- curve-project-sync:v1 id=${match[1]} -->`;
    if (!item.content?.body?.includes(marker)) {
      throw new Error(`Project item ${match[1]} is not owned by the Curve synchronizer.`);
    }
    existingById.set(match[1], item);
  }
}

const sourceRevision = git(["rev-parse", SOURCE_REF]);
const selectedTasks = args.statuses.size > 0 ? tasks.filter((task) => args.statuses.has(task.id)) : tasks;
let created = 0;
let updated = 0;

for (const task of selectedTasks) {
  let item = existingById.get(task.id);
  const isNew = item == null;
  const status = args.statuses.get(task.id) ?? (isNew ? initialStatus.get(task.id) ?? "Backlog" : currentStatusFor(item));
  const title = shortenedTitle(task);
  const body = bodyFor(task, status, sourceRevision);

  if (isNew) {
    item = gh([
      "project",
      "item-create",
      PROJECT_NUMBER,
      "--owner",
      OWNER,
      "--title",
      title,
      "--body",
      body,
      "--format",
      "json",
    ]);
    created += 1;
  } else {
    const contentId = item.content?.id;
    if (!contentId?.startsWith("DI_")) throw new Error(`Draft content ID missing for ${task.id}`);
    gh(["project", "item-edit", "--id", contentId, "--title", title, "--body", body, "--format", "json"]);
    updated += 1;
  }

  if (isNew || args.statuses.has(task.id)) setSingleSelect(item.id, project.id, statusField, status);
  if (isNew) setSingleSelect(item.id, project.id, sizeField, task.size);
  console.log(`${isNew ? "created" : "updated"} ${task.id}: ${status}`);
}

console.log(JSON.stringify({ mode: "apply", project: project.url, selected: selectedTasks.length, created, updated }, null, 2));
