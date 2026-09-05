// Synthetic conformance: consume trusted normalized documents and current
// workflow records. No browser request, storage, provider or policy activation.
import { readFileSync } from "node:fs";
import { contentDigest, validCheckpointTime } from "./google-docs-checkpoint.mjs";

export const PRD_READINESS_PROFILE = JSON.parse(readFileSync(new URL("../../contracts/policy/prd-readiness-profile-v1.json", import.meta.url), "utf8"));
for (const item of Object.values(PRD_READINESS_PROFILE)) if (item && typeof item === "object") Object.freeze(item);
Object.freeze(PRD_READINESS_PROFILE);
export const PRD_READINESS_PROFILE_DIGEST = contentDigest(PRD_READINESS_PROFILE);
const key = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const meaningful = (text) => {
  const cleaned = text.trim().replace(/[.!;:]+$/g, "").trim();
  return cleaned.length > 0 && !/^(tbd|todo|tbc|n\/?a|none|unknown|[-?.\s]+)$/i.test(cleaned);
};
const requireValue = (condition, code) => { if (!condition) throw new Error(code); };
const reference = (value) => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,511}$/.test(value);
const closed = (value, fields) => value && Object.getPrototypeOf(value) === Object.prototype && Object.keys(value).length === fields.length && fields.every((field) => Object.hasOwn(value, field));
const subjectFields = ["id", "workspace_id", "initiative_id", "initiative_version", "prd_binding_id", "provider_file_id", "provider_version", "content_digest", "idea_brief_version_id", "idea_brief_digest", "evidence_snapshot_id", "inventory_digest", "checked_at"];

function sections(content, expected, prefix) {
  requireValue(content?.normalization_version === "curve.google-docs.normalized/v1-candidate" && content.complete === true && content.unsupported_nodes === 0 && Array.isArray(content.tabs), "READINESS_CAPTURE_REQUIRED");
  // Also enforce the canonicalizer's traversal and non-JSON limits.
  contentDigest(content);
  const lookup = new Map(Object.entries(expected).map(([id, label]) => [key(label), id]));
  const found = new Map(), duplicates = new Set();
  const open = (label) => {
    const id = lookup.get(key(label));
    if (!id) return null;
    if (found.has(id)) duplicates.add(id); else found.set(id, []);
    return id;
  };
  const text = (paragraph) => (paragraph.elements ?? []).map((element) => element.textRun?.content ?? "").join("");
  function visit(nodes, active, inTable = false) {
    for (const node of nodes ?? []) {
      if (node.paragraph) {
        const value = text(node.paragraph);
        if (!inTable && /^HEADING_[1-6]$/.test(node.paragraph.paragraphStyle?.namedStyleType ?? "")) {
          const next = open(value);
          const level = Number(node.paragraph.paragraphStyle.namedStyleType.at(-1));
          if (next) active = { id: next, level };
          else if (active && level <= active.level) active = null;
        } else if (active) found.get(active.id).push(value);
      } else if (node.table) {
        for (const row of node.table.tableRows ?? []) for (const cell of row.tableCells ?? []) visit(cell.content, active, true);
      }
      // Table-of-contents, headers, footers and footnotes cannot satisfy a body section.
    }
  }
  function tabs(list, inherited = null) {
    for (const tab of list) {
      const id = open(tab.tabProperties?.title ?? "");
      const active = id ? { id, level: 0 } : inherited;
      visit(tab.documentTab?.body?.content, active);
      tabs(tab.childTabs ?? [], active);
    }
  }
  tabs(content.tabs);
  return { text: Object.fromEntries([...found].map(([id, chunks]) => [id, chunks.join("\n")])), reasons: Object.keys(expected).flatMap((id) => duplicates.has(id) ? [`${prefix}_SECTION_DUPLICATE:${id}`] : !found.has(id) ? [`${prefix}_SECTION_MISSING:${id}`] : !meaningful(found.get(id).join("\n")) ? [`${prefix}_SECTION_EMPTY:${id}`] : []) };
}

function traceability(sectionText) {
  const declarations = (value, pattern) => {
    const entries = []; let current;
    for (const line of (value ?? "").split("\n")) {
      const match = line.trim().match(pattern);
      if (match) { current = { id: match[1], text: match[2] }; entries.push(current); }
      else if (current) current.text += `\n${line}`;
    }
    return entries;
  };
  const requirements = declarations(sectionText.requirements, /^((?:FR|REQ)-[0-9]+)\s*:\s*(.*)$/);
  const acceptance = declarations(sectionText.acceptance, /^(AC-[0-9]+)\s*:\s*(.*)$/);
  const reasons = [], requirementIds = new Set(requirements.map((item) => item.id));
  for (const [kind, entries] of [["REQUIREMENT", requirements], ["ACCEPTANCE", acceptance]]) {
    if (!entries.length) reasons.push(`PRD_${kind}_ID_REQUIRED`);
    if (new Set(entries.map((item) => item.id)).size !== entries.length) reasons.push(`PRD_${kind}_DUPLICATE`);
    if (entries.some((item) => !meaningful(item.text))) reasons.push(`PRD_${kind}_EMPTY`);
  }
  const covered = new Set();
  for (const criterion of acceptance) {
    const refs = criterion.text.match(/\b(?:FR|REQ)-[0-9]+\b/g) ?? [];
    if (!refs.length) reasons.push("PRD_ACCEPTANCE_TRACE_REQUIRED");
    if (refs.some((ref) => !requirementIds.has(ref))) reasons.push("PRD_ACCEPTANCE_UNKNOWN_REQUIREMENT");
    refs.forEach((ref) => covered.add(ref));
  }
  if ([...requirementIds].some((id) => !covered.has(id))) reasons.push("PRD_REQUIREMENT_UNCOVERED");
  return [...new Set(reasons)];
}

export function evaluateSyntheticPrdReadiness(input) {
  const { synthetic, id, workspace_id, initiative_id, initiative_version, prd, idea_brief, evidence_snapshot_id, inventory, active_human_ids, checked_at } = input;
  requireValue(synthetic === true, "SYNTHETIC_ONLY");
  requireValue([id, workspace_id, initiative_id, prd?.binding_id, prd?.provider_version, idea_brief?.version_id, evidence_snapshot_id].every(reference) && Number.isSafeInteger(initiative_version) && initiative_version > 0 && validCheckpointTime(checked_at), "READINESS_CONTEXT_INVALID");
  requireValue([prd, idea_brief].every((document) => document.workspace_id === workspace_id && document.initiative_id === initiative_id && reference(document.provider_file_id) && document.content?.document_properties?.documentId === document.provider_file_id), "READINESS_SOURCE_MISMATCH");
  requireValue(inventory && Array.isArray(inventory.blockers) && Array.isArray(inventory.assumptions) && Array.isArray(active_human_ids), "READINESS_INVENTORY_INVALID");
  requireValue(closed(inventory, ["workspace_id", "initiative_id", "prd_digest", "idea_brief_digest", "checked_at", "complete", "blockers", "assumptions"]) && inventory.blockers.length <= 1000 && inventory.assumptions.length <= 1000 && active_human_ids.length <= 10000 && active_human_ids.every(reference), "READINESS_INVENTORY_INVALID");
  requireValue(inventory.blockers.every((item) => closed(item, ["id", "state", "resolution_ref"])) && inventory.assumptions.every((item) => closed(item, ["id", "owner_actor_id", "validation_plan_ref", "due_stage"])), "READINESS_INVENTORY_INVALID");
  const prdDigest = contentDigest(prd.content), ideaDigest = contentDigest(idea_brief.content);
  const briefSections = sections(idea_brief.content, PRD_READINESS_PROFILE.idea_brief_sections, "IDEA_BRIEF"), prdSections = sections(prd.content, PRD_READINESS_PROFILE.prd_sections, "PRD");
  const reasons = [...briefSections.reasons, ...prdSections.reasons, ...traceability(prdSections.text)];
  if (inventory.workspace_id !== workspace_id || inventory.initiative_id !== initiative_id || inventory.prd_digest !== prdDigest || inventory.idea_brief_digest !== ideaDigest || inventory.checked_at !== checked_at || inventory.complete !== true) reasons.push("READINESS_INVENTORY_STALE");
  const ids = [...inventory.blockers, ...inventory.assumptions].map((record) => record?.id);
  if (!ids.every(reference) || new Set(ids).size !== ids.length) reasons.push("READINESS_INVENTORY_INVALID");
  if (inventory.blockers.some((blocker) => blocker.state !== "RESOLVED" || !reference(blocker.resolution_ref))) reasons.push("BLOCKERS_UNRESOLVED");
  if (inventory.assumptions.some((assumption) => !reference(assumption.owner_actor_id) || !active_human_ids.includes(assumption.owner_actor_id) || !reference(assumption.validation_plan_ref) || !reference(assumption.due_stage))) reasons.push("ASSUMPTION_PLAN_REQUIRED");
  const report = { schema_version: "curve.prd-readiness/v1-candidate", id, workspace_id, initiative_id, initiative_version, profile_digest: PRD_READINESS_PROFILE_DIGEST, prd_binding_id: prd.binding_id, provider_file_id: prd.provider_file_id, provider_version: prd.provider_version, content_digest: prdDigest, idea_brief_version_id: idea_brief.version_id, idea_brief_digest: ideaDigest, evidence_snapshot_id, inventory_digest: contentDigest(inventory), checked_at, status: reasons.length ? "BLOCKED" : "READY", reasons };
  Object.freeze(report.reasons);
  return Object.freeze(report);
}

export function requireCurrentPrdReadiness(report, expected) {
  requireValue(closed(report, [...subjectFields, "schema_version", "status", "reasons", "profile_digest"]) && closed(expected, subjectFields), "PRD_READINESS_REQUIRED");
  requireValue(report.schema_version === "curve.prd-readiness/v1-candidate" && report.status === "READY" && Array.isArray(report.reasons) && report.reasons.length === 0 && report.profile_digest === PRD_READINESS_PROFILE_DIGEST && reference(report.id) && validCheckpointTime(report.checked_at), "PRD_READINESS_REQUIRED");
  requireValue(Number.isSafeInteger(report.initiative_version) && report.initiative_version > 0 && ["content_digest", "idea_brief_digest", "inventory_digest"].every((field) => /^sha256:[0-9a-f]{64}$/.test(report[field])) && ["id", "workspace_id", "initiative_id", "prd_binding_id", "provider_file_id", "provider_version", "idea_brief_version_id", "evidence_snapshot_id"].every((field) => reference(report[field])), "PRD_READINESS_REQUIRED");
  for (const field of subjectFields) requireValue(expected[field] !== undefined && report[field] === expected[field], "PRD_READINESS_STALE");
  return true;
}
