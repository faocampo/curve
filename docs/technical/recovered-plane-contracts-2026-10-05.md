# Recovered Plane contracts: 2026-10-05

Status: **new Curve source import from exact recovered consumer mirrors**.
This is source-provenance evidence, not restored original Curve history, current
runtime qualification, human gate approval or deployment evidence.

## Origin and immutable inventory

The source is the Open Source `faocampo/plane` fork at commit
`7d4225d594adf984de1451f16ad2c8ab741c58eb`, in `apps/api/plane/curve/`
(candidate integration contracts and local verification records). The import is
under [recovered source](../../contracts/recovered/plane-7d4225d/README.md)
(immutable mirrors and source context).

The unchanged [original provenance](../../contracts/recovered/plane-7d4225d/PROVENANCE.json)
(45-entry recovery inventory) has SHA-256
`d9502ecb1a8cdcc4ea68973891657e61613b48d6705942e941b91aa3f51d2f3a`.
Every entry records the actual Plane repository, full commit, original path and
raw-file SHA-256. During import, every original file was compared byte-for-byte
against that Git object and the recovery inventory. No line ending, whitespace,
schema ID, edition, manifest member or historical evidence body was rewritten.

[Import metadata](../../contracts/recovered/plane-7d4225d/IMPORT.json)
(new Curve import record) pins the original and supplemental provenance separately
and records that no missing history, historical verification run or execution
authority was restored.

## Retained families

The original 45 inputs consist of 22 JSON Schemas, six policies, five raw-byte
manifests, one pre-plan baseline, nine historical Markdown packets and two
qualification records. Their six candidate directories are:

1. `project_association_candidate/` (explicit existing-project association):
   five files, including four closed schemas and one policy.
2. `project_association_read_candidate/` (minimal advisory association read):
   three files, including its independent read policy and manifest.
3. `scope_proposal_candidate/` (C1 finite DRAFT scope proposal): five files.
4. `scoped_prd_candidate/` (C2a exact existing-work Gate 1 bridge): eleven files.
5. `scope_reopening_candidate/` (C2b bounded pre-plan reopening): seven files.
6. `scope_reopening_read_candidate/` (minimal protected reopening read):
   three files.

These are recovered consumer candidates with their original boundaries. The C1
manifest intentionally pins only its three schemas; its policy is independently
pinned by the original provenance. The association candidate has no manifest in
this source set. No manifest was invented or widened to normalize those shapes.

## Retained qualification chain

- [C2b qualification](../../contracts/recovered/plane-7d4225d/scope_reopening_qualification.json)
  (original pre-plan model, migration and 120-module source closure):
  `sha256:72bdb3b987ec1925754e6a14dee36cecec3c85706605c052d443628d84e7fb52`.
- [Association-read qualification](../../contracts/recovered/plane-7d4225d/project_association_read_qualification.json)
  (original successor with a 122-module source closure):
  `sha256:5381243df882c087ab61932cda77e286a76b3b3e4b19853be5eea9cc81574f1b`.

The successor explicitly names the predecessor digest. It retains the model
catalog, migration pins, supported and excluded writer inventories and physical
catalog digest; its source closure adds the two association-read modules and
changes URL registration. Both qualification JSON files remain exact original
bytes. Importing them does not re-run their historical checks, validate a changed
runtime against them, or qualify a future plan writer.

## Supplemental historical test sources

[Supplemental provenance](../../contracts/recovered/plane-7d4225d/supplemental-provenance.json)
(five additional source entries) has SHA-256
`cac4c9a2020147611c723638fec747083409a020c1887dbb5a924077fe832e0d`.
The following files are exact copies from the same Plane commit, beyond the
original 45-input inventory:

- `tests/test_scoped_prd_bridge.py` (historical bridge integration tests).
- `tests/test_scoped_prd_integrity.py` (historical immutable graph tests).
- `tests/test_scoped_prd_races.py` (historical concurrency tests).
- `tests/test_scoped_prd_temporal.py` (historical scoped transport tests).
- `tests/test_scoped_prd_views.py` (historical authenticated route tests).

They preserve the relative links in the unchanged
[C2a verification packet](../../contracts/recovered/plane-7d4225d/SCOPED-PRD-C2A-VERIFICATION.md)
(historical local acceptance report). These copied Python files are evidence,
not current Curve implementation or a standalone runnable test suite. Their
imports and fixtures still belong to the original Plane environment. No reported
historical pass count is presented as a test run of this import.

## Missing history and successor boundary

The original later Curve history and Curve-only OpenAPI documents, fixtures,
tests, manifests and unretained design decisions were not recovered. The later
manual-draft plan implementation and original qualification, native scope-read
implementation and successor qualification, and original Gate 2 manual-control
packet are absent from this import. No guessed content, lost Curve SHA, recreated
proof or inherited approval is substituted for them.

Future reconstruction can cite these exact inputs but must publish its own
reviewable source, explicit editions, qualification and evidence. Legacy common
schemas and approvals remain unchanged. Any manual planning, control or execution
work remains subject to its own scope and gates; this import activates nothing.

## Verification and limits

Run `node --test scripts/tests/recovered-plane-contracts.test.mjs`
(dependency-free import integrity tests). It checks both provenance pins, exact
source/import hashes and inventory membership, the six families, raw manifest
cross-references, retained qualification hashes and successor shape, unique
schema IDs, available schema references and the historical local document links.

The tests need only Node built-ins. They do not claim full JSON Schema validation
or Ajv compilation, execute historical Python tests, start a runtime, or establish
human UI acceptance. Repository-wide checks and successor implementation tests
must be reported separately against their actual final source state. Public
examples and future additions must use generic Open Source or synthetic data.
