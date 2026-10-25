# Roadmap approved defaults

Status: **APPROVED DIRECTION**, 2026-10-25.

## Initial ownership

A newly created Roadmap belongs to the active human who creates it. The service
sets the owner from the authenticated actor after checking creation authority;
the request cannot supply an owner, actor or permission grant. Product ownership
alone does not replace the creator as the new Roadmap owner.

Creation authority, current membership, Product availability and protected access
remain independently enforced under the [command contract](../../contracts/candidates/roadmap-domain-v1/COMMANDS.md)
(actions, versions and authorization prerequisites). The owner selection does not
grant creation rights to all workspace members. It does not specify ownership
transfer or contributor-role mapping beyond their existing governing contracts.

Roadmap ownership grants no document approval assignment. New Initiatives retain
Product review of the PRD and Technical review of the implementation plan under
the [two-stage direction](two-stage-new-work-direction.md) (review responsibilities
and historical evidence preservation).

## Opening-screen purpose

The Roadmap opens on milestones and items needing attention. A user should be
able to identify the next milestone, understand what needs action and open the
relevant item without navigating a separate approvals dashboard first.

Use the approved light document-review interface as the incumbent visual system.
Show approval state and a clear next action on the item, retaining the two-stage
flow. Additional detail belongs in the item view or deliberate disclosure.

This approves purpose and initial ownership. The interactive Roadmap proposal
still passes the [experience blueprint](curve-experience-blueprint.md) (prototype,
screen states and task-based acceptance) before material application UI changes.

## Implementation acceptance

- Creation derives the initial owner from the authenticated active human.
- A forged owner or actor field is rejected by the closed request contract.
- An authorized replay preserves the original owner and result identity; it does
  not assign ownership to a later requester or change historical attribution.
- Unauthorized or revoked callers create no Roadmap and receive no protected
  retained result. Creation does not create document-review assignments.
- Browser acceptance covers milestone scanning, opening an attention item and
  reaching its next action, including empty, loading, error and access-loss states.

Environment-specific adoption records and production activation retain their
separate authority. These defaults do not change historical approvals or records.
