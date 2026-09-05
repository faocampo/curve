# Local runtime verification guide

## Public reference boundary

This guide replaces environment-specific runtime observations. All example
paths and identities are synthetic. Actual workspace, operation, container,
host, credential and execution identifiers belong in private evidence storage.
This public document grants no execution, persistence or deployment authority.

## Reproducible checks

1. Resolve the repository and exact candidate commit from approved local
   configuration. Verify that source mounts use that candidate.
2. Start only the authorized disposable development profile with synthetic data.
3. Verify API readiness, database connectivity and worker readiness.
4. Submit a synthetic foundation operation through the authenticated API.
5. Verify the command, outbox delivery, workflow progress and terminal result.
6. Exercise duplicate delivery, cancellation, restart and graceful worker
   shutdown classification. Preserve the distinction between a verified
   symptom and a suspected race.
7. Verify disabled behavior and remove only the disposable resources created
   by the test. Preserve unrelated local workloads and volumes.

## Evidence and limits

Private evidence records exact commit, runtime identity, authorization,
timestamps, results, cleanup and reviewer disposition. Public evidence records
only synthetic test names, safe outcomes and public source references.

The RUNTIME-M0-01 graceful Curve worker shutdown classification is tracked in
[Curve issue #46](https://github.com/faocampo/curve/issues/46) (public work-item
scope). Broad M0 completion remains open until every applicable requirement
has independent evidence. D-009 (retention, backup, legal-hold, tombstone, and
erasure decision) remains a protected-storage activation prerequisite.
