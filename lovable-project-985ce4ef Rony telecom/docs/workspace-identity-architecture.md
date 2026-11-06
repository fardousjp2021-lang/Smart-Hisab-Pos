# Workspace Identity Architecture — Recommendation for 50–100 Stores

Scope: architecture decision only. No code, rules, claims, or UI are
modified by this document. Reviews `docs/resilience-safeguards-plan.md`
against `docs/multi-tenant-roadmap.md`, `docs/multi-tenant-phase3-*`,
and the current implementation in `src/pos-app/lib/workspaceClaim.ts`
+ `firestore.rules`.

## 1. Question

At 50–100 stores, do we still need the Admin SDK claim sweep, or is a
simpler architecture (Firestore `users/{uid}` lookup, or a hybrid)
strictly better on operational and performance grounds?

## 2. Options compared

### A. Custom claims (current, Phase 2/3 target)
`workspaceId` lives in the Firebase Auth ID token. Rules read
`request.auth.token.workspaceId`. Client reads `getIdTokenResult()` and
gates listeners on presence.

### B. Firestore `users/{uid}` fallback
No custom claim. Rules read
`get(/databases/(default)/documents/users/$(request.auth.uid)).data.workspaceId`.
Client reads the same doc via a cached snapshot.

### C. Hybrid (claim primary, doc fallback)
Claim is the source of truth in rules and client gates. A mirrored
`users/{uid}.workspaceId` doc exists for admin tooling, reporting, and
as a break-glass recovery path when a claim is missing/stale. The
client never reads the doc for authorization — only the claim.

## 3. Evaluation matrix

| Dimension              | A. Claims (current)                | B. users/{uid} lookup                | C. Hybrid (recommended)        |
| ---------------------- | ---------------------------------- | ------------------------------------ | ------------------------------ |
| Rule read cost         | 0 extra reads                      | +1 `get()` per rule eval, billed & rate-limited (10 gets/rule) | 0 extra reads |
| Client gate cost       | 1 token decode at boot             | 1 doc read (cached) at boot          | 1 token decode at boot         |
| Offline behavior       | Works fully offline; token cached  | Works only if `users/{uid}` is in IDB cache; new devices fail offline | Fully offline |
| Token freshness risk   | Real — stale token after workspace change until forced refresh | None on the doc; but rule `get()` still sees cached IDB doc offline | Same as A, mitigated by fallback |
| Sweep needed?          | Yes, one-off + on schema changes   | No sweep, but nightly consistency job still recommended | Yes, but smaller & less urgent |
| Admin/report tooling   | Awkward — must decode tokens or mirror to Firestore anyway | Native — plain Firestore query        | Native — mirror doc is queryable |
| Rule complexity        | Low                                | Medium (nested `get()`, null-guards) | Low                            |
| Failure blast radius   | Whole tenant locked out until refresh | Silent cross-tenant leak if a doc write is missed | Same as A, plus a manual recovery path |
| Rate-limit exposure    | None                               | `get()` counts against per-request rule budget; hot paths (dashboards) can hit the 10-`get` ceiling | None |
| Security posture       | Strongest — claim is signed, tamper-evident | Weaker — depends on rule correctness around `users/{uid}` write policy | Strongest — claim is authoritative |
| Migration cost from today | Already 90% done (Phase 2 shipped) | Full rewrite of `firestore.rules` and re-audit | Additive to today: keep claims, add mirror doc |
| Fit for 50–100 stores  | Good, once sweep runs once         | Marginal — read amplification bites reports | Best — belt & suspenders at negligible cost |

Rule engine limits worth naming: each rule evaluation is capped at 10
`get()`/`exists()` calls and each of those is billed as a document read.
Option B multiplies reads on every listener callback, which directly
undermines the safeguards in `docs/resilience-safeguards-plan.md`
(especially S1 pagination and S6 hard caps).

## 4. Recommendation

**Adopt Option C (Hybrid), with claims as the authorization primary
and `users/{uid}.workspaceId` as an operational mirror.**

Rationale in one paragraph: the resilience plan pushes hard on read
volume, offline behavior, and predictable listener cost. Option A
already delivers all three; the only real weakness — recovery when a
token is stale or a claim was never set — is exactly what the mirror
doc solves without touching the hot path. Option B would regress every
one of R1/R3/R4 in the resilience plan by adding a rule `get()` to
every read, and would remove offline capability for first-login on new
devices. Option C keeps the shipped Phase 2 rules unchanged, keeps the
Phase 3 client gate unchanged, and adds one write to the user-creation
path that we already do (profile row).

### What "hybrid" means concretely (no code in this doc)

- Rules keep reading `request.auth.token.workspaceId`. No change.
- Every user has `users/{uid} = { workspaceId, role, updatedAt }`,
  written by the same server flow that mints the claim.
- Admin tooling and reports query the mirror doc, not tokens.
- Break-glass: if a user hits the "missing claim" banner (already
  shipped in `workspaceClaim.ts`), the app can look up the mirror doc
  under a narrowly-scoped rule (`allow read: if request.auth.uid == uid`)
  and surface "Your workspace access is being repaired" instead of a
  hard lockout. Authorization still comes from the claim.

## 5. Is the Admin SDK claim sweep still required?

Yes, but reduced in scope and cadence. Under Option C the sweep stops
being a rollout blocker and becomes a routine consistency job.

### Why it's still needed

1. **One-off backfill for approved users with stale/missing claims.**
   The audit in `docs/multi-tenant-phase3-claim-audit.md` cannot be
   resolved by a mirror doc alone — the client gate refuses to open
   listeners without a claim, by design. Users in Class 3.1 (missing)
   and Class 3.2 (stale) must have their claim set once before Phase 3
   flips flags. This is a single execution, not an ongoing burden.
2. **Drift detection.** Any future admin operation that moves a user
   between workspaces, promotes/demotes roles, or restores a deleted
   account must write both the claim and the mirror. A periodic sweep
   catches the case where one side of that write silently failed.
3. **Schema evolution.** Adding a claim (e.g. `role`, `region`) in the
   future requires re-minting tokens; the same sweep tooling handles it.

### Recommended cadence

| Trigger                                 | Cadence            |
| --------------------------------------- | ------------------ |
| Initial backfill (Phase 3 unblock)      | Once, before flag flip |
| Post-Phase 3 stability sweep            | Once at T+7 days   |
| Steady-state drift audit                | Monthly, read-only |
| Post-incident (any workspace transfer, bulk user import, or auth outage) | Ad-hoc |
| Schema-change re-mint                   | Per change         |

### Operational overhead estimate (50–100 stores, ~500–2,000 users)

- Read-only audit: ~1–3 min wall-clock, negligible cost (Admin SDK
  `listUsers` paginates at 1,000/page; 2 pages max at this scale).
- Repair pass: ~10–30 min wall-clock including a token-revoke step,
  same order-of-magnitude cost as one page load per user.
- On-call burden: near zero once the monthly cron is wired. The scripts
  already exist (`scripts/audit-workspace-claims.mjs`,
  `scripts/repair-workspace-claims.mjs`) and are dry-run by default.
- Blast radius of a failed sweep: none — audit is read-only; repair is
  additive and journalled to `/audit_logs/claim_repair` with rollback.

Net: the sweep costs the team roughly **one engineer-hour per month**
in steady state, plus one 2–4 hour session for the initial backfill.
That is materially cheaper than the recurring read amplification and
offline regressions that Option B would impose.

## 6. Decision

- **Architecture:** Option C — Hybrid (claim-primary, doc-mirror).
- **Admin SDK sweep:** keep it, run once for backfill, then monthly.
- **Rules:** no change from the shipped Phase 2 file.
- **Client gate:** no change from `workspaceClaim.ts`.
- **New work implied:** ensure user-creation and workspace-transfer
  flows write the mirror doc alongside minting the claim; wire the
  existing sweep script into a monthly cron. Both are scheduled in a
  later ticket, not this document.

## 7. Explicit non-goals of this recommendation

- No rule edits. No claim mutations. No UI changes.
- No change to Phase 3 flags — they remain OFF pending the initial
  backfill described in the claim-audit runbook.
- No adoption of Option B, even partially, in hot read paths.
