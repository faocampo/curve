import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schema = JSON.parse(readFileSync(new URL(
  "../../contracts/candidates/roadmap-domain-v1/graph.schema.json", import.meta.url,
), "utf8"));
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
const validShape = ajv.compile(schema);
const validHistory = ajv.compile({ $ref: `${schema.$id}#/$defs/itemHistory` });

function requireRule(condition, message) {
  if (!condition) throw new Error(message);
}

function index(records, graph) {
  const result = new Map();
  for (const record of records) {
    requireRule(record.workspace_id === graph.workspace_id, "Roadmap workspace mismatch");
    requireRule(record.product_id === graph.product_id, "Roadmap Product mismatch");
    requireRule(!result.has(record.id), "Duplicate aggregate identity");
    if (record.tombstoned_at === null) {
      requireRule(record.tombstoned_by === null && record.tombstone_reason === null, "Unexpected tombstone attribution");
    } else {
      requireRule(record.tombstoned_by !== null && typeof record.tombstone_reason === "string"
        && record.tombstone_reason.trim().length > 0, "Tombstone requires actor and rationale");
    }
    result.set(record.id, record);
  }
  return result;
}

// Conformance only: callers must supply the complete, already-authorized scope.
// A valid graph supplies no authorization or proof of the referenced PRD approval.
export function validateRoadmapDomainGraph(graph) {
  requireRule(validShape(graph), "Invalid roadmap domain shape");
  const roadmaps = index(graph.roadmaps, graph);
  const milestones = index(graph.milestones, graph);
  const features = index(graph.features, graph);
  index(graph.items, graph);
  const positions = new Set();
  for (const roadmap of roadmaps.values()) {
    requireRule(roadmap.horizon_start === null || roadmap.horizon_end === null
      || roadmap.horizon_start <= roadmap.horizon_end, "Roadmap horizon ends before it starts");
  }
  for (const milestone of milestones.values()) {
    requireRule(roadmaps.has(milestone.roadmap_id), "Missing Milestone Roadmap");
    const key = `${milestone.roadmap_id}:${milestone.position}`;
    requireRule(!positions.has(key), "Duplicate Milestone position");
    positions.add(key);
    requireRule(milestone.target_start === null || milestone.target_end === null
      || milestone.target_start <= milestone.target_end, "Milestone target ends before it starts");
  }
  const featurePlacements = new Set();
  const initiatives = new Set();
  for (const item of graph.items) {
    requireRule(roadmaps.has(item.roadmap_id), "Missing item Roadmap");
    requireRule(item.owner.actor_id === roadmaps.get(item.roadmap_id).owner.actor_id,
      "Item owner must be the Roadmap owner");
    const milestone = milestones.get(item.milestone_id);
    requireRule(milestone?.roadmap_id === item.roadmap_id, "Item Milestone/Roadmap mismatch");
    requireRule(features.has(item.feature_id), "Missing item Feature");
    const key = `${item.milestone_id}:${item.feature_id}`;
    requireRule(!featurePlacements.has(key), "Feature occurs twice in one Milestone");
    featurePlacements.add(key);
    requireRule(!initiatives.has(item.defining_initiative_id), "Initiative defines more than one item");
    initiatives.add(item.defining_initiative_id);
    const unscheduled = item.planned_start === null && item.planned_end === null;
    requireRule(unscheduled || (item.planned_start !== null && item.planned_end !== null), "Incomplete item schedule");
    requireRule(!unscheduled || item.status === "PROPOSED", "Only PROPOSED items may be unscheduled");
    requireRule(unscheduled || item.planned_start <= item.planned_end, "Item schedule ends before it starts");
    requireRule(item.status !== "COMMITTED" || item.approved_prd_version_id !== null, "Committed item requires exact PRD reference");
  }
  return true;
}

// Pure product rule, not an authorization receipt. Current workspace membership,
// owner resolution, locking, audit and persistence belong to the command service.
export function validateDeclaredProgressChange({ before, after, roadmapOwnerId, actorId, note }) {
  requireRule(typeof roadmapOwnerId === "string" && roadmapOwnerId.length > 0 && actorId === roadmapOwnerId,
    "Declared progress requires the Roadmap owner");
  requireRule([before, after].every((value) => Number.isInteger(value) && value >= 0 && value <= 100),
    "Progress must be an integer from 0 through 100");
  requireRule(typeof note === "string" && note.length <= 10000, "Progress note must be bounded text");
  requireRule(!(after < before || Math.abs(after - before) >= 20) || note.trim().length > 0,
    "Progress decrease or change of at least 20 requires a note");
  return true;
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}

// Validate one proposed atomic state/history delta. This neither writes history
// nor implements the runtime idempotency, locking or authorization boundary.
export function validateRoadmapItemChange({ before, after, history, previousSequence }) {
  validateRoadmapDomainGraph(before);
  validateRoadmapDomainGraph(after);
  requireRule(validHistory(history), "Invalid item history shape");
  requireRule(Number.isSafeInteger(previousSequence) && previousSequence >= 0
    && history.sequence === previousSequence + 1, "History sequence must advance once");
  requireRule(history.workspace_id === before.workspace_id && history.product_id === before.product_id,
    "History scope mismatch");
  const oldItem = before.items.find((item) => item.id === history.roadmap_item_id);
  const newItem = after.items.find((item) => item.id === history.roadmap_item_id);
  requireRule(oldItem && newItem, "History target must exist before and after");
  requireRule(oldItem.tombstoned_at === null && newItem.tombstoned_at === null,
    "Retired item cannot receive scope or progress changes");
  requireRule(history.before_version === oldItem.version && history.after_version === newItem.version
    && newItem.version === oldItem.version + 1, "Item version must advance once from the expected version");
  const roadmap = before.roadmaps.find((value) => value.id === oldItem.roadmap_id);
  requireRule(same(history.recorded_by, roadmap.owner) && same(newItem.updated_by, history.recorded_by),
    "Item history requires current Roadmap owner attribution");
  const expected = structuredClone(before);
  const expectedItem = expected.items.find((item) => item.id === oldItem.id);
  Object.assign(expectedItem, { version: newItem.version, updated_at: newItem.updated_at, updated_by: newItem.updated_by });
  if (history.change_type === "PROGRESS_CHANGED") {
    validateDeclaredProgressChange({ before: oldItem.declared_progress, after: newItem.declared_progress,
      roadmapOwnerId: roadmap.owner.actor_id, actorId: history.recorded_by.actor_id, note: newItem.progress_note });
    for (const [side, item] of [["before", oldItem], ["after", newItem]]) {
      requireRule(same(history[side], { declared_progress: item.declared_progress, progress_note: item.progress_note }),
        "Progress history differs from the item delta");
    }
    Object.assign(expectedItem, { declared_progress: newItem.declared_progress, progress_note: newItem.progress_note });
  } else {
    requireRule(history.rationale.trim().length > 0 && history.expected_schedule_impact.trim().length > 0,
      "Movement requires rationale and expected schedule impact");
    requireRule(oldItem.milestone_id !== newItem.milestone_id, "Movement must change Milestone");
    requireRule(history.before.milestone_id === oldItem.milestone_id && history.after.milestone_id === newItem.milestone_id,
      "Movement history differs from the item delta");
    expectedItem.milestone_id = newItem.milestone_id;
  }
  requireRule(same(expected, after), "Item command changed unrelated fields or aggregates");
  return true;
}
