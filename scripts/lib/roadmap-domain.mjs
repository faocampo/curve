import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schema = JSON.parse(readFileSync(new URL(
  "../../contracts/candidates/roadmap-domain-v1/graph.schema.json", import.meta.url,
), "utf8"));
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
const validShape = ajv.compile(schema);

function requireRule(condition, message) {
  if (!condition) throw new Error(message);
}

function index(records, graph) {
  const result = new Map();
  for (const record of records) {
    requireRule(record.workspace_id === graph.workspace_id, "Roadmap workspace mismatch");
    requireRule(record.product_id === graph.product_id, "Roadmap Product mismatch");
    requireRule(!result.has(record.id), "Duplicate aggregate identity");
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
  for (const milestone of milestones.values()) {
    requireRule(roadmaps.has(milestone.roadmap_id), "Missing Milestone Roadmap");
    const key = `${milestone.roadmap_id}:${milestone.position}`;
    requireRule(!positions.has(key), "Duplicate Milestone position");
    positions.add(key);
  }
  const featurePlacements = new Set();
  const initiatives = new Set();
  for (const item of graph.items) {
    requireRule(roadmaps.has(item.roadmap_id), "Missing item Roadmap");
    const milestone = milestones.get(item.milestone_id);
    requireRule(milestone?.roadmap_id === item.roadmap_id, "Item Milestone/Roadmap mismatch");
    requireRule(features.has(item.feature_id), "Missing item Feature");
    const key = `${item.milestone_id}:${item.feature_id}`;
    requireRule(!featurePlacements.has(key), "Feature occurs twice in one Milestone");
    featurePlacements.add(key);
    requireRule(!initiatives.has(item.initiative_id), "Initiative defines more than one item");
    initiatives.add(item.initiative_id);
    const unscheduled = item.planned_start === null && item.planned_end === null;
    requireRule(unscheduled || (item.planned_start !== null && item.planned_end !== null), "Incomplete item schedule");
    requireRule(!unscheduled || item.status === "PROPOSED", "Only PROPOSED items may be unscheduled");
    requireRule(unscheduled || item.planned_start <= item.planned_end, "Item schedule ends before it starts");
    requireRule(item.status !== "COMMITTED" || item.approved_prd_revision_id !== null, "Committed item requires exact PRD reference");
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
