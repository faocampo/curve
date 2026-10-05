# Recovered Plane consumer contracts

This directory is a **new Curve source import**, recorded on 2026-10-05. It
preserves consumer-mirror bytes from the Open Source Plane fork at
`7d4225d594adf984de1451f16ad2c8ab741c58eb`, under `apps/api/plane/curve/`
(original candidate contracts and local implementation evidence). It does not
restore missing original Curve history or establish new approval authority.

- [PROVENANCE.json](PROVENANCE.json) (unchanged recovery inventory) pins the
  original 45 inputs by source repository, commit, path and SHA-256.
- [supplemental-provenance.json](supplemental-provenance.json) (additional source
  inventory) pins five exact historical Plane test files. They keep the original
  verification packet's relative links resolvable. These are evidence copies,
  not executable Curve tests or a complete Plane testing environment.
- [IMPORT.json](IMPORT.json) (new import metadata) distinguishes these inventories,
  pins both inventory files and records the import's limited authority.
- [Recovery boundary](../../../docs/technical/recovered-plane-contracts-2026-10-05.md)
  (scope, retained proofs, missing contracts and verification limits) describes
  how this material can be used in reconstruction.

The six candidate families retain their original schema IDs, raw manifest maps,
policy bytes and edition names. Historical implementation and verification prose
is unchanged and must be read at its recorded Plane source boundary. Statements
about tests passed, reviewed candidates or enabled behavior are not claims about
this Curve import, a later successor, or a currently running environment.

The original later Curve contracts, manual-draft plan contracts, native scope-read
contracts and Gate 2 manual-control packet remain unavailable in this recovered
set. New successor work must identify itself separately; it cannot acquire the
identity, qualification or approvals of unavailable historical material.

Do not edit recovered inputs to repair a successor. Add a separately identified,
reviewed edition instead. Public reconstruction examples must stay generic and
synthetic. No deployment, provider activation or execution is authorized here.
