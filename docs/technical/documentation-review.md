# Documentation review

Review date: 2026-09-06. Status: **reconciled; one new owner decision pending**.

## Scope and preservation

The audit covers repository Markdown, agent instructions, contract definitions,
fixtures, JavaScript validators and generated artifacts. Existing local C4/index
edits were preserved separately before creating the review branch. Immutable
publication manifests, historical evidence and fixture hashes remain unchanged.

## Findings and corrections

| Finding | Correction / remaining action |
| --- | --- |
| External-PRD documents used D-012 as a Google Docs gate | D-012 belongs to the M5 Docusaurus delivery profile; name provider identity/transport and storage gates explicitly. |
| Runtime described as unimplemented after backend publication | Record the exact published implementation boundary separately from merge, deployment and live acceptance. |
| Review reconstruction assumed schema edition 1.0 | Use the declared record edition; retain legacy compatibility and immutable evidence. |
| All Git-retention migrations described as pending | Distinguish published persistence work from remaining accepted-command integration and activation. |
| Dispatch-controller rules appeared to govern every human-operated coding session | Make authority-path scope explicit while preserving approval, disclosure and production controls. |
| Private scoped approval could be confused with public proposal status | Resolve approved private policy by full Git commit; keep operational activation independently gated. |
| Reference library lacked a concise next-task entry point | Add the coding handoff and stage-by-stage outcomes, gates and exit evidence. |
| Structural validation omitted root agent instructions and fragment/import targets | Add a repository inventory and structural audit alongside existing semantic/schema tests. |
| Retention ADR said OPEN while its decision index said PROPOSED | Align public proposal status while preserving the private scoped-approval boundary. |
| Historical remediation and Project instructions read like current commands | Add dated-snapshot boundaries, remove a duplicated source line and require live reconciliation before status changes. |

## Open decision

**B-NO-MODEL-BUDGET-01:** the M3 documents disagree on whether fully manual,
deterministic Gate 2 plans can use an explicit no-model/zero-paid-budget profile
before D-014 is approved. Owner clarification is pending. Preserve the existing
Gate 2 budget requirement until the selected policy is recorded consistently.

## Coverage and limits

The repository-wide inventory covers 507 files, including 103 Markdown files.
It checks local links/anchors, JSON syntax, static JavaScript imports and syntax,
including inline prototype scripts without executing them. Existing validation
covers 79 schemas, 186 fixtures, immutable publication pins and 47 Mermaid diagrams.
The regression suite has 709 tests, including five new audit tests.

Cross-document review concentrated on authority, decision/milestone dependencies,
state transitions, versioned records, retention/activation and dated implementation
claims. Historical task packets and generated fixtures remain identifiable evidence;
their original approval hashes are preserved. Prototype syntax validation does
not establish runtime UI behavior. External links, all upstream Plane code and
deployment environments are outside this documentation audit's exhaustive checks.

Historical checkpoint dates and acceptance records retain their original scope.
The [coding handoff](coding-handoff.md) (current implementation boundary) and
[pending stages](pending-stages.md) (remaining outcomes and evidence) guide the
next task; unresolved requirements must be reconciled with their normative source.
