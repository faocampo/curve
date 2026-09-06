# Repository delivery policy

Status: **APPROVED** — repository owner confirmation, 2026-09-06.

## Scope and authority

This policy governs human-directed development of Curve and its Plane integration.
Curve integrates into `main`; Plane integrates into `preview`. Recheck live repository
identity, integration branch, working tree, PRs and protections before acting.
This policy takes precedence over historical packet-level branching guidance for
these development sessions. Product-runtime controller rules remain unchanged.
Security, exact-subject approvals and repository protections remain binding.

Within user-authorized delivery work, agents may perform routine review, validation,
merge and verified remote-branch cleanup without repeated confirmation. Explicit
human UX, product, security and operational gates must be satisfied separately.
This policy supplies no production deployment or runtime activation authority.

## Six delivery rules

1. **One cohesive outcome per PR.** Use commits for internal implementation steps.
   Rework reuses the existing branch and PR. Before creating either, inspect open,
   closed and merged PRs for equivalent work, including squash-merged content.
2. **Branch from the integration branch by default.** Limit a workstream to two
   open dependent PRs in total, including the root PR. Independent work may proceed
   separately. A larger stack requires an explicit owner-approved exception with
   its reason, bounded depth, owner, merge order and expiry/review checkpoint.
3. **Resolve the oldest integration gate first.** During a human-review wait,
   prioritize the reviewable end-to-end flow or independent work. Do not grow its
   dependent stack. Identify the exact decision, candidate and reviewer; do not
   substitute backend test results for UI acceptance.
4. **Complete the delivery loop.** Validate the current head, review the full
   outbound change, satisfy required checks and approvals, merge when authorized,
   verify the integration commit, update the handoff, then retire the remote branch.
   Reconcile after each merge and before starting the next dependent task. A failed
   or unavailable required check stays visible as a blocker; never report it passed.
5. **Keep evidence current.** Record head/base, validation result, gate owner and
   blocker for open work. Record final integration evidence after merge. Preserve
   historical pins and invalidate affected approvals when their subjects change;
   avoid unnecessary dependencies on unmerged evidence commits. Close equivalent
   or superseded PRs with a link to their replacement.
6. **Clean up safely.** Standing authorization covers remote branches whose work
   is verified merged or explicitly superseded, with no unique work, open dependent
   PRs or active use. Check ancestry or content equivalence, capture the exact tip
   and replacement, then delete with a concurrency-safe check. Preserve local
   worktrees, uncommitted changes, stashes and audit history. Ambiguous ownership or
   possible human edits requires resolution before deletion.

## Completion and exceptions

A handoff records outcome, PR, integration branch/commit, exact validation evidence,
remaining human or machine gates, and branch disposition. Publication, integration,
deployment and activation are separate states. Pending work has a named owner and
next action; a new branch is not a substitute for closing its predecessor.

Existing stacks above the limit enter reconciliation: preserve their history,
freeze further dependent PR creation, satisfy the oldest gate and integrate in
verified order. The existing Initiative-shell UX hold remains effective, including
document handling, reviewer responsibilities and operational-flow simplification.

Repository auto-delete settings may be enabled only where dependent branches are
protected by the workflow; exact-tip cleanup remains the default safe mechanism.

## Related authority

- [Agent rules](../../AGENTS.md) (development instructions and disclosure boundary).
- [Coding handoff](coding-handoff.md) (current work, evidence and next action).
- [Pending stages](pending-stages.md) (milestone outcomes and human gates).
- [Security and operations](security-and-operations.md) (publication and runtime controls).
- [Workflow contract](workflows-and-sequences.md) (Curve-dispatched runtime authority).
