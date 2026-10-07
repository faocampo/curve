/** Candidate-only, deterministic, synthetic-only in-memory domain boundary. */
export const EDITION = 'attention-candidate-v0.1';
export class PilotError extends Error {
  constructor(code) { super(code); this.name = 'PilotError'; this.code = code; }
}
const fail = (code) => { throw new PilotError(code); };
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
export function exact(value, keys, required = keys) {
  if (!isObject(value) || Object.keys(value).some((k) => !keys.includes(k)) || required.some((k) => !(k in value))) fail('INVALID_SHAPE');
}
const str = (v, max = 1000) => {
  if (typeof v !== 'string' || !v.trim() || v.length > max || /[\u0000-\u001f\u007f]/u.test(v)) fail('INVALID_TEXT');
  return v;
};
const id = (v) => str(v, 120);
export function instant(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) fail('INVALID_TIME');
  return Date.parse(value);
}
const oneOf = (value, values) => { if (!values.includes(value)) fail('INVALID_ENUM'); return value; };
export function immutable(value) {
  const copy = structuredClone(value);
  function freeze(node) { if (node && typeof node === 'object') { Object.values(node).forEach(freeze); Object.freeze(node); } return node; }
  return freeze(copy);
}
export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (isObject(value)) return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
// Collision-free length-delimited natural key, not a secret or an authorization token.
export function stableId(kind, ...parts) { return `${kind}:${parts.map((part) => `${String(part).length}:${part}`).join('')}`; }
export function safeSourceUrl(raw, origins) {
  str(raw, 2048);
  let url;
  try { url = new URL(raw); } catch { fail('UNSAFE_SOURCE_LINK'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || /[\\\s]/u.test(raw) || !origins.includes(url.origin) || url.href !== raw) fail('UNSAFE_SOURCE_LINK');
  return raw;
}
function validateRecord(record, origins, finish) {
  exact(record, ['externalId', 'resourceKind', 'projectExternalId', 'revision', 'title', 'summary', 'state', 'dueAt', 'priority', 'signal', 'sourceUrl', 'sourceUpdatedAt', 'access', 'provenance']);
  id(record.externalId); if (record.projectExternalId !== null) id(record.projectExternalId); id(record.revision);
  oneOf(record.resourceKind, ['work-item', 'message', 'history-event']);
  str(record.title, 200); str(record.summary, 2000); str(record.state, 80);
  oneOf(record.priority, ['high', 'medium', 'low']);
  if (record.dueAt !== null) instant(record.dueAt);
  if (record.sourceUpdatedAt !== null && instant(record.sourceUpdatedAt) > finish) fail('FUTURE_SOURCE_TIME');
  if (record.provenance !== 'synthetic') fail('SYNTHETIC_ONLY');
  safeSourceUrl(record.sourceUrl, origins);
  exact(record.access, ['state', 'checkedAt', 'expiresAt']);
  oneOf(record.access.state, ['readable', 'unavailable']);
  const checked = instant(record.access.checkedAt), expires = instant(record.access.expiresAt);
  if (checked > finish || checked > expires || expires <= finish) fail('INVALID_ACCESS_WINDOW');
  if (record.signal !== null) {
    exact(record.signal, ['key', 'reason', 'confidence']);
    id(record.signal.key); str(record.signal.reason, 500);
    if (!Number.isFinite(record.signal.confidence) || record.signal.confidence < 0 || record.signal.confidence > 1) fail('INVALID_CONFIDENCE');
  }
}
function material(record) {
  // Whitespace-only titles, source revision and observation/link metadata are nonmaterial.
  return canonical({title: record.title.trim().replace(/\s+/gu, ' '), project: record.projectExternalId, summary: record.summary, state: record.state, dueAt: record.dueAt, priority: record.priority, signal: record.signal && {key: record.signal.key, reason: record.signal.reason}});
}
export class AttentionService {
  #scope; #connections; #origins; #maxAge; #records = new Map(); #evidence = new Map();
  #projects = new Map(); #reviews = new Map(); #runs = new Map(); #runKeys = new Map(); #watermarks = new Map(); #revisionFacts = new Map(); #projectAccess = new Map();
  constructor({workspaceId, subjectId, connections, allowedOrigins, maxAgeMs = 86400000}) {
    id(workspaceId); id(subjectId);
    if (!Array.isArray(connections) || connections.length === 0 || !Array.isArray(allowedOrigins) || !allowedOrigins.length || !Number.isFinite(maxAgeMs) || maxAgeMs <= 0) fail('INVALID_CONFIG');
    this.#connections = new Map(connections.map((c) => {
      exact(c, ['id', 'provider', 'label']); id(c.id); id(c.provider); str(c.label);
      return [c.id, immutable(c)];
    }));
    if (this.#connections.size !== connections.length) fail('DUPLICATE_CONNECTION');
    // Deliberate hard fence: this prototype cannot be configured for a real source.
    for (const origin of allowedOrigins) {
      let url; try { url = new URL(origin); } catch { fail('INVALID_CONFIG'); }
      if (url.origin !== origin || url.protocol !== 'https:' || !url.hostname.endsWith('.example.invalid')) fail('SYNTHETIC_ONLY');
    }
    this.#scope = immutable({workspaceId, subjectId}); this.#origins = [...allowedOrigins]; this.#maxAge = maxAgeMs;
  }
  #authorize(ctx) {
    if (!isObject(ctx) || ctx.workspaceId !== this.#scope.workspaceId || ctx.subjectId !== this.#scope.subjectId) fail('NOT_FOUND');
  }
  #connection(ctx, connectionId) {
    this.#authorize(ctx); const connection = this.#connections.get(connectionId); if (!connection) fail('NOT_FOUND'); return connection;
  }
  bindProject(ctx, binding) {
    const connection = this.#connection(ctx, binding.connectionId);
    exact(binding, ['connectionId', 'externalId', 'title', 'sourceUrl', 'historyCoverage', 'history', 'access']);
    id(binding.externalId); str(binding.title, 200); safeSourceUrl(binding.sourceUrl, this.#origins);
    oneOf(binding.historyCoverage, ['complete', 'partial', 'unknown']);
    exact(binding.access, ['state', 'checkedAt', 'expiresAt']); oneOf(binding.access.state, ['readable', 'unavailable']);
    if (instant(binding.access.checkedAt) >= instant(binding.access.expiresAt)) fail('INVALID_ACCESS_WINDOW');
    if (!Array.isArray(binding.history) || binding.history.length > 1000) fail('INVALID_HISTORY');
    const seen = new Set();
    for (const event of binding.history) {
      exact(event, ['externalId', 'title', 'occurredAt', 'sourceUrl']); id(event.externalId); str(event.title, 300); instant(event.occurredAt); safeSourceUrl(event.sourceUrl, this.#origins);
      if (seen.has(event.externalId)) fail('DUPLICATE_HISTORY'); seen.add(event.externalId);
    }
    const key = stableId('project', this.#scope.workspaceId, this.#scope.subjectId, connection.id, binding.externalId);
    const result = immutable({...this.#scope, ...binding, id: key, edition: EDITION, governance: 'reference-only', retrospectiveApprovals: false, provenance: 'synthetic'});
    const previous = this.#projects.get(key);
    if (previous && canonical(previous) !== canonical(result)) fail('BINDING_CONFLICT');
    this.#projects.set(key, result); if (!previous) this.#projectAccess.set(key, immutable(binding.access)); return result;
  }
  observeProjectAccess(ctx, projectId, receipt, now) {
    this.#authorize(ctx); const stamp = instant(now);
    if (!this.#projects.has(projectId)) fail('NOT_FOUND');
    exact(receipt, ['state', 'checkedAt', 'expiresAt']); oneOf(receipt.state, ['readable', 'unavailable']);
    if (instant(receipt.checkedAt) > stamp || instant(receipt.expiresAt) <= stamp || instant(receipt.checkedAt) < instant(this.#projectAccess.get(projectId).checkedAt)) fail('INVALID_ACCESS_WINDOW');
    this.#projectAccess.set(projectId, immutable(receipt));
  }
  #projectVisible(projectId, now) { return projectId === null || this.#visible({access: this.#projectAccess.get(projectId)}, now); }
  refresh(ctx, batch) {
    const connection = this.#connection(ctx, batch.connectionId);
    exact(batch, ['runId', 'connectionId', 'startedAt', 'finishedAt', 'coverage', 'records', 'detail', 'provenance']);
    id(batch.runId); str(batch.detail, 500);
    if (batch.provenance !== 'synthetic') fail('SYNTHETIC_ONLY');
    const start = instant(batch.startedAt), finish = instant(batch.finishedAt);
    if (start > finish) fail('INVALID_TIME_ORDER');
    oneOf(batch.coverage, ['complete', 'partial', 'unknown', 'failed']);
    if (!Array.isArray(batch.records) || batch.records.length > 1000 || (batch.coverage === 'failed' && batch.records.length)) fail('INVALID_BATCH');
    const runKey = stableId('run', this.#scope.workspaceId, this.#scope.subjectId, connection.id, batch.runId);
    const signature = canonical(batch);
    if (this.#runKeys.has(runKey)) { if (this.#runKeys.get(runKey) !== signature) fail('IDEMPOTENCY_CONFLICT'); return this.#runs.get(runKey); }
    if (finish < (this.#watermarks.get(connection.id) ?? -Infinity)) fail('STALE_REFRESH');
    const pending = [], seen = new Set();
    for (const record of batch.records) {
      validateRecord(record, this.#origins, finish);
      const projectId = record.projectExternalId === null ? null : stableId('project', this.#scope.workspaceId, this.#scope.subjectId, connection.id, record.projectExternalId);
      if (projectId !== null && (!this.#projects.has(projectId) || !this.#projectVisible(projectId, finish))) fail('UNBOUND_PROJECT');
      const key = stableId('source', this.#scope.workspaceId, this.#scope.subjectId, connection.id, record.resourceKind, record.externalId);
      if (seen.has(key)) fail('DUPLICATE_SOURCE'); seen.add(key);
      const previous = this.#records.get(key);
      const revisionKey = stableId('revision', key, record.revision);
      if (this.#revisionFacts.has(revisionKey) && this.#revisionFacts.get(revisionKey) !== material(record)) fail('SOURCE_REVISION_CONFLICT');
      if (previous && record.sourceUpdatedAt !== null && previous.sourceUpdatedAt !== null && instant(record.sourceUpdatedAt) < instant(previous.sourceUpdatedAt)) fail('STALE_SOURCE');
      if (previous && previous.revision === record.revision && material(previous) !== material(record)) fail('SOURCE_REVISION_CONFLICT');
      const evidenceId = stableId('evidence', key, record.revision, batch.finishedAt, record.access.state);
      const observation = immutable({...record, ...this.#scope, connectionId: connection.id, provider: connection.provider, edition: EDITION, id: evidenceId, sourceId: key, projectId, observedAt: batch.finishedAt, materialKey: material(record)});
      const oldEvidence = this.#evidence.get(evidenceId);
      if (oldEvidence && canonical(oldEvidence) !== canonical(observation)) fail('EVIDENCE_CONFLICT');
      pending.push([key, observation]);
    }
    const run = immutable({...this.#scope, id: runKey, edition: EDITION, connectionId: connection.id, startedAt: batch.startedAt, finishedAt: batch.finishedAt, coverage: batch.coverage, status: batch.coverage === 'failed' ? 'failed' : 'finished', observedCount: pending.length, detail: batch.detail, provenance: 'synthetic'});
    // No writes occur until every candidate in the bounded refresh passes validation.
    for (const [key, record] of pending) { this.#records.set(key, record); this.#evidence.set(record.id, record); this.#revisionFacts.set(stableId('revision', key, record.revision), record.materialKey); }
    this.#runs.set(runKey, run); this.#runKeys.set(runKey, signature); this.#watermarks.set(connection.id, finish);
    return run;
  }
  #visible(record, now) { return Boolean(record?.access) && record.access.state === 'readable' && instant(record.access.checkedAt) <= now && instant(record.access.expiresAt) > now; }
  #item(record, now) {
    const itemId = stableId('attention', record.sourceId, record.signal.key);
    const reviews = this.#reviews.get(itemId) ?? [], last = reviews.at(-1);
    const overdue = record.dueAt !== null && instant(record.dueAt) < now;
    const currentMaterial = canonical({facts: record.materialKey, deadline: overdue ? 'overdue' : 'not-overdue'});
    const resurfaced = Boolean(last && last.action !== 'reopen' && last.materialKey !== currentMaterial);
    let status = 'open';
    if (last && !resurfaced) {
      if (last.action === 'handled') status = 'handled';
      if (last.action === 'snooze' && instant(last.snoozeUntil) > now) status = 'snoozed';
    }
    const reasons = [record.signal.reason];
    if (overdue) reasons.push('The source due date has passed.');
    if (resurfaced) reasons.push('Material source facts changed since your last review.');
    return immutable({...this.#scope, id: itemId, edition: EDITION, evidenceId: record.id, title: record.title, summary: record.summary, projectId: record.projectId, projectTitle: this.#projects.get(record.projectId)?.title ?? 'Unlinked evidence', priority: overdue ? 'high' : record.priority, reasons, confidence: record.signal.confidence, sourceLabel: this.#connections.get(record.connectionId).label, sourceUrl: record.sourceUrl, status, resurfaced, stale: now - instant(record.observedAt) > this.#maxAge, observedAt: record.observedAt, dueAt: record.dueAt, provenance: record.provenance, materialKey: currentMaterial});
  }
  listAttention(ctx, now) {
    this.#authorize(ctx); const stamp = instant(now); const order = {high: 0, medium: 1, low: 2};
    return immutable([...this.#records.values()].filter((r) => r.signal && this.#visible(r, stamp) && this.#projectVisible(r.projectId, stamp)).map((r) => this.#item(r, stamp)).sort((a, b) => order[a.priority] - order[b.priority] || a.id.localeCompare(b.id)));
  }
  recordDisposition(ctx, input, now) {
    this.#authorize(ctx); instant(now); exact(input, ['itemId', 'action', 'snoozeUntil', 'requestId', 'expectedEvidenceId']); id(input.requestId);
    oneOf(input.action, ['handled', 'snooze', 'reopen']);
    if (input.action === 'snooze') { if (instant(input.snoozeUntil) <= instant(now)) fail('INVALID_SNOOZE'); }
    else if (input.snoozeUntil !== null) fail('INVALID_SNOOZE');
    const item = this.listAttention(ctx, now).find((i) => i.id === input.itemId); if (!item) fail('NOT_FOUND');
    const reviews = this.#reviews.get(item.id) ?? [];
    const duplicate = reviews.find((r) => r.requestId === input.requestId);
    if (duplicate) {
      if (duplicate.action !== input.action || duplicate.snoozeUntil !== input.snoozeUntil) fail('IDEMPOTENCY_CONFLICT');
      return duplicate;
    }
    if (input.expectedEvidenceId !== item.evidenceId) fail('STALE_REVIEW');
    const previous = reviews.at(-1); if (previous && instant(previous.recordedAt) > instant(now)) fail('STALE_REVIEW');
    const review = immutable({...this.#scope, ...input, id: stableId('review', item.id, input.requestId), edition: EDITION, recordedAt: now, materialKey: item.materialKey, evidenceId: item.evidenceId, sourceEffect: 'none'});
    this.#reviews.set(item.id, [...reviews, review]); return review;
  }
  getDispositions(ctx, itemId) { this.#authorize(ctx); return immutable(this.#reviews.get(itemId) ?? []); }
  readEvidence(ctx, evidenceId, now) {
    this.#authorize(ctx); const record = this.#evidence.get(evidenceId); const stamp = instant(now);
    // Historical content also requires a currently readable latest observation.
    if (!record || !this.#visible(record, stamp) || !this.#visible(this.#records.get(record.sourceId), stamp) || !this.#projectVisible(record.projectId, stamp)) fail('NOT_FOUND');
    return record;
  }
  listProjects(ctx, now) {
    this.#authorize(ctx); const stamp = instant(now);
    return immutable([...this.#projects.values()].filter((project) => this.#projectVisible(project.id, stamp)).map((project) => ({...project, sourceLabel: this.#connections.get(project.connectionId).label, tasks: [...this.#records.values()].filter((r) => r.projectId === project.id && r.resourceKind === 'work-item' && this.#visible(r, stamp)).map((r) => ({id: r.sourceId, title: r.title, state: r.state, sourceUrl: r.sourceUrl, observedAt: r.observedAt, stale: stamp - instant(r.observedAt) > this.#maxAge})), history: project.history.map((h) => ({...h, id: h.externalId}))})));
  }
  refreshHealth(ctx) {
    this.#authorize(ctx);
    return immutable([...this.#connections.values()].map((connection) => {
      const runs = [...this.#runs.values()].filter((r) => r.connectionId === connection.id);
      const latest = runs.at(-1), successful = runs.filter((r) => r.coverage !== 'failed').at(-1);
      return {...connection, status: 'synthetic', coverage: latest?.coverage ?? 'unknown', lastSuccessfulAt: successful?.finishedAt ?? null, detail: latest?.detail ?? 'No refresh has run.', latestRun: latest ?? null};
    }));
  }
}

export class DisabledLocalAdapter {
  capabilities() { return immutable({transport: 'disabled', readOnly: true, liveSources: false, methods: ['checkConnection', 'listChanges', 'readEvidence', 'checkpoint']}); }
  checkConnection() { return immutable({status: 'disabled', reason: 'Separate provider identity, source scopes and runtime review required.'}); }
  listChanges() { fail('ADAPTER_DISABLED'); }
  readEvidence() { fail('ADAPTER_DISABLED'); }
  checkpoint() { fail('ADAPTER_DISABLED'); }
}
