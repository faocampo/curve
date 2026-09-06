# PRD submission readiness

## Candidate scope and authority

Version 0.1 candidate. This package implements deterministic structural
readiness for synthetic external Idea Brief and PRD captures plus current
blocker/assumption records. The [product definition](../curve-ai-native-sdlc-prd.md)
(Aligning-to-PRD-Review preconditions) and [M1 parent packet](m1-alignment-evidence-prd-task-packet.md)
(required document fields, completeness and traceability) are authoritative.
The [integration contract](integration-contracts.md) (external authoring and exact
checkpoints) and [security specification](security-and-operations.md) (protected
access, retention and publication boundaries) still govern live activation.

The [candidate profile](../../contracts/policy/prd-readiness-profile-v1.json)
(required sections, ID syntax and acceptance coverage) and [evaluator](../../scripts/lib/prd-readiness.mjs)
(section extraction, current-record checks and exact-subject report validation)
provide an executable structural baseline. Its status remains `CANDIDATE`; it
changes no pinned runtime policy or activation flag.

## Authoring and deterministic checks

Google Docs remains the visible authoring repository. Curve uses normalized,
permission-checked captures and a metadata-only readiness report; it creates no
second editable document body. Input to this local conformance package is
synthetic only. A runtime controller must supply validated captures from the
approved provider adapter, never arbitrary caller JSON carrying `complete: true`.

Required section labels are listed exactly in the profile. They can be Google
Docs headings or section-titled tabs. Label matching ignores case and punctuation.
Nested subsection text, child tabs and table-cell text count as section content.
Headers, footers, footnotes and table-of-contents entries cannot supply a missing
body section. Duplicate recognized sections fail as ambiguous. Empty sections
and bare placeholders such as `TBD`, `TODO`, `N/A` or `None` do not pass; explain
an explicit absence or non-applicability in the document.

The candidate template uses paragraph declarations for stable identifiers:

| Section | Declaration example |
| --- | --- |
| Requirements | `FR-1: Describe the required behavior` or `REQ-1: Describe the required behavior` |
| Acceptance | `AC-1: Describe the verification criterion for FR-1` |

Declarations may have continued paragraphs. IDs must be unique within their
section and have meaningful descriptions. Every acceptance criterion references
at least one declared requirement; unknown references and uncovered requirements
block readiness. Alternate authoring syntax requires a reviewed profile/parser
extension rather than silently skipping these checks.

The current blocker/assumption inventory is a closed, bounded metadata structure
supplied by trusted domain reads. It must be complete and scoped to the same
workspace, Initiative, PRD digest, Idea Brief digest and evaluation instant.
Every blocker is resolved with an attributable resolution reference. Every
assumption identifies a current active human owner, a validation-plan reference
and its due stage. An explicit empty inventory is supported. The runtime must
verify inventory completeness and resolve those references; a user-provided
`complete` flag or a nonempty string is insufficient authority.

## Exact-subject readiness report

The immutable `curve.prd-readiness/v1-candidate` report contains:

- report identity, workspace, Initiative and aggregate version;
- exact profile digest, PRD binding, provider file/version and captured digest;
- current Idea Brief version/digest and immutable evidence snapshot identity;
- complete review-inventory digest and trusted evaluation instant;
- `READY` or `BLOCKED` plus stable reason codes containing no document text.

The report has a closed field set. Both document captures must match their
declared provider-file and workspace/Initiative identity. `requireCurrentPrdReadiness`
requires the complete exact expected subject; omitted fields, additional fields,
stale scope/version/digest/profile/inventory or a blocked result fail closed.

The [submission model](../../scripts/lib/external-prd-lifecycle.mjs) (authorization,
capture and PRD Review transition) checks source permission and stable capture,
then verifies the report before changing state. The submission event records
the completeness-check identity and profile digest. An edit to either document,
changed evidence, a new blocker/assumption inventory or a changed Initiative
version requires fresh readiness evaluation against the new exact subject.

`READY` establishes these structural and current-record checks. It does not
establish business correctness, quality of reasoning, truth of claims, successful
live access or human Gate approval. Product Approval still reviews the exact
document and material evidence. Semantic contradictions or blockers expressed
only in prose require human identification and entry into the authoritative
inventory; this deterministic parser does not infer them from natural language.

## Remaining runtime integration and verification

The consuming child packet must bind the approved profile, provider capture,
current Idea Brief ArtifactVersion, blocker/assumption model, reference/owner
validation and complete inventory read to one scoped evaluation. It must also
provide immutable report persistence, protected-body controls, current evidence
access and final transaction/authorization revalidation before submission.

The [readiness tests](../../scripts/tests/prd-readiness.test.mjs) (headings, tabs,
tables, missing/duplicate content, ID coverage, blockers, plans, source identity
and stale reports) and [lifecycle tests](../../scripts/tests/external-prd-lifecycle.test.mjs)
(no transition without current exact readiness) use fabricated documents and
identities. Run `node --test scripts/tests/prd-readiness.test.mjs scripts/tests/external-prd-lifecycle.test.mjs`.

Live Google/storage activation, database races, authenticated browser behavior
and semantic human review remain separate acceptance requirements. Rollback
removes this additive candidate and restores its synthetic caller fixtures;
no protected body, provider document or runtime record is created by these tests.
