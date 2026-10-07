import { AttentionService, DisabledLocalAdapter, immutable, PilotError, exact } from './core.mjs';
export const CONTEXT = immutable({workspaceId: 'demo-workspace', subjectId: 'demo-reviewer'});
export const START = '2026-10-02T09:00:00.000Z';
const ORIGIN = 'https://work.example.invalid';
export const access = (at = START) => ({state: 'readable', checkedAt: at, expiresAt: '2027-01-01T00:00:00.000Z'});
export function makeService() {
  return new AttentionService({...CONTEXT, connections: [{id: 'demo-work', provider: 'plane-reference', label: 'Work management'}], allowedOrigins: [ORIGIN]});
}
export function binding(overrides = {}) {
  return {connectionId: 'demo-work', externalId: 'project-atlas', title: 'Atlas workspace', sourceUrl: `${ORIGIN}/projects/atlas`, historyCoverage: 'partial', history: [{externalId: 'history-1', title: 'Project created in the source workspace', occurredAt: '2025-04-14T10:30:00.000Z', sourceUrl: `${ORIGIN}/projects/atlas/history/1`}, {externalId: 'history-2', title: 'First planning cycle completed', occurredAt: '2025-05-02T15:00:00.000Z', sourceUrl: `${ORIGIN}/projects/atlas/history/2`}], access: access(), ...overrides};
}
export function record(overrides = {}) {
  return {externalId: 'work-1', resourceKind: 'work-item', projectExternalId: 'project-atlas', revision: '1', title: 'Choose the release window', summary: 'The work plan needs a release window before the team can finish sequencing the remaining tasks.', state: 'Waiting for decision', dueAt: '2026-10-02T08:00:00.000Z', priority: 'high', signal: {key: 'needs-decision', reason: 'A decision is blocking the next planning step.', confidence: 0.96}, sourceUrl: `${ORIGIN}/work/1`, sourceUpdatedAt: START, access: access(), provenance: 'synthetic', ...overrides};
}
export function batch(records = [record()], overrides = {}) {
  return {runId: 'run-1', connectionId: 'demo-work', startedAt: START, finishedAt: START, coverage: 'partial', records, detail: 'Selected work items are available. Older project history has not been fully checked.', provenance: 'synthetic', ...overrides};
}
export function createDemo(replay = []) {
  let service, now, sequence, records, events;
  function initialize() {
    service = makeService(); now = START; sequence = 0; events = [];
    service.bindProject(CONTEXT, binding());
    service.bindProject(CONTEXT, binding({externalId: 'project-beacon', title: 'Beacon toolkit', sourceUrl: `${ORIGIN}/projects/beacon`, historyCoverage: 'unknown', history: []}));
    records = [record(), record({externalId: 'work-2', revision: '1', title: 'Review the handoff checklist', summary: 'The new handoff checklist is ready for a first review. Confirm the missing owner before the next cycle.', state: 'In review', dueAt: '2026-10-05T14:00:00.000Z', priority: 'medium', signal: {key: 'review-request', reason: 'A review is waiting on you.', confidence: 0.89}, sourceUrl: `${ORIGIN}/work/2`}), record({externalId: 'work-3', revision: '1', projectExternalId: 'project-beacon', title: 'Clarify the next milestone', summary: 'The source project has open work but no confirmed target date for the next milestone.', state: 'Open', dueAt: null, priority: 'low', signal: {key: 'missing-date', reason: 'A planning detail is still unknown.', confidence: 0.76}, sourceUrl: `${ORIGIN}/work/3`}), record({externalId: 'work-4', revision: '1', title: 'Document the navigation structure', summary: 'A source task with existing completed history.', state: 'Done in source', dueAt: null, priority: 'low', signal: null, sourceUrl: `${ORIGIN}/work/4`})];
    service.refresh(CONTEXT, batch(records));
  }
  initialize();
  function view() {
    const sources = service.refreshHealth(CONTEXT);
    return immutable({now, items: service.listAttention(CONTEXT, now), projects: service.listProjects(CONTEXT, now), sources: [...sources, ...['Mail', 'Chat'].map((label) => ({id: `disabled-${label.toLowerCase()}`, label, status: 'disabled', coverage: 'unknown', lastSuccessfulAt: null, detail: new DisabledLocalAdapter().checkConnection().reason}))], refresh: sources[0].latestRun, eventCount: events.length});
  }
  function act(event) {
    exact(event, ['type', 'itemId'], ['type']);
    if (!['handled', 'snooze', 'reopen', 'refresh', 'material-change', 'advance-day', 'reset', 'partial-refresh', 'failed-refresh'].includes(event.type)) throw new PilotError('UNKNOWN_DEMO_ACTION');
    if (event.type === 'reset') { initialize(); return view(); }
    if (events.length >= 1000) throw new PilotError('DEMO_EVENT_LIMIT');
    const nextSequence = sequence + 1;
    if (['handled', 'snooze', 'reopen'].includes(event.type)) {
      const item = service.listAttention(CONTEXT, now).find((i) => i.id === event.itemId);
      if (!item) throw new PilotError('NOT_FOUND');
      service.recordDisposition(CONTEXT, {itemId: event.itemId, action: event.type, snoozeUntil: event.type === 'snooze' ? new Date(Date.parse(now) + 86400000).toISOString() : null, requestId: `demo-${nextSequence}`, expectedEvidenceId: item.evidenceId}, now);
    } else if (event.type === 'advance-day') {
      now = new Date(Date.parse(now) + 86400000).toISOString();
    } else {
      const nextNow = new Date(Date.parse(now) + 60000).toISOString();
      let candidates = records;
      if (event.type === 'material-change') {
        candidates = records.map((r, i) => i === 0 ? {...r, revision: `material-${nextSequence}`, summary: 'The proposed release window changed. Confirm the revised dependency order before work continues.', sourceUpdatedAt: nextNow} : r);
      }
      const coverage = event.type === 'failed-refresh' ? 'failed' : event.type === 'partial-refresh' ? 'partial' : 'partial';
      const selected = event.type === 'failed-refresh' ? [] : event.type === 'partial-refresh' ? candidates.slice(0, 1) : candidates;
      service.refresh(CONTEXT, batch(selected.map((r) => ({...r, access: access(nextNow)})), {runId: `demo-refresh-${nextSequence}`, startedAt: nextNow, finishedAt: nextNow, coverage, detail: event.type === 'failed-refresh' ? 'Simulated source failure. Previous observations remain visible with their original timestamps.' : event.type === 'partial-refresh' ? 'Only one selected item was checked. Unchecked items keep their earlier observation times.' : 'Synthetic selected items refreshed. Full historical coverage remains unverified.'}));
      records = candidates; now = nextNow;
    }
    sequence = nextSequence; events.push(immutable(event)); return view();
  }
  if (!Array.isArray(replay) || replay.length > 1000) throw new PilotError('INVALID_REPLAY');
  for (const event of replay) act(event);
  return {view, act, events: () => immutable(events), readEvidence: (evidenceId) => service.readEvidence(CONTEXT, evidenceId, now)};
}
