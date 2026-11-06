# Manual Orphan Review — `categories/cat_seed_default`

**Status:** Review only. **No data modified.**
**Context:** Last remaining orphan after Phase 1 dry-run repair
(`docs/multi-tenant-phase1-orphan-dryrun.md`). Assignment held pending
platform-eng sign-off.

---

## 1. Document Identification

| Field                    | Value                                                                                  |
|--------------------------|----------------------------------------------------------------------------------------|
| Collection               | `categories`                                                                           |
| Document ID              | `cat_seed_default`                                                                     |
| Created                  | App bootstrap (initial single-tenant install)                                          |
| Owner fields             | *(none — no `ownerUid` / `createdBy` / `userId` / `uid`)*                              |
| Current `workspaceId`    | *(unset)*                                                                              |
| Live references          | **4,812 products** with `categoryId == "cat_seed_default"` (fallback "Uncategorized") |
| Cross-collection refs    | Referenced by `sales.items[].categorySnapshot` on ~11k historical sales rows          |
| Expected ownership       | System / shared — not owned by any single tenant                                       |
| Data nature              | **Seed data** — bootstrap fixture, not tenant-authored business data                   |

---

## 2. Determination

### Option A — Assign to a single workspace (`ws_root`)
- **Pros:** Simple; satisfies Phase 2 rule invariant (`workspaceId != null`).
- **Cons:** In Phase 3, only `ws_root` members will see the fallback
  category. Every other tenant's 4,812 (per tenant) product references
  will point at a doc they cannot read → "Unknown category" in UI, broken
  filters, broken reports.
- **Verdict:** ❌ Incorrect. Assigning shared seed data to one tenant leaks
  a UX regression across all others.

### Option B — Leave global / shared
- **Pros:** Preserves current behavior for all tenants.
- **Cons:** Violates the Phase 2 invariant that every business-collection
  doc carries a `workspaceId`. Would require a rule exception
  (`workspaceId == null && isSeed == true`) — a permanent widening of the
  security surface for the sake of one doc.
- **Verdict:** ❌ Not worth the rule complexity long-term.

### Option C — Archive
- **Pros:** Clears the orphan; no rule exception needed.
- **Cons:** 4,812 products lose their fallback category; UI shows blank /
  "—" until each product is re-categorised. Historical sales `categorySnapshot`
  is unaffected (denormalised), but live product filters break.
- **Verdict:** ❌ Destructive. Do not archive live-referenced seed data.

### Option D — Clone-on-first-use per tenant (RECOMMENDED)
- Add `isSeedTemplate: true` to `cat_seed_default` and keep it un-scoped
  during Phase 1–2 only as a **template**, never read by end-users.
- At tenant provisioning (or on first product write that would reference
  it), Cloud Function `cloneSeedCategories(workspaceId)` copies the
  template into `categories/{workspaceId}_cat_default` with
  `workspaceId = <tenant>`.
- Rewrite the 4,812 legacy product references in the SAME migration that
  clones per tenant: `product.categoryId = "{workspaceId}_cat_default"`
  (per-product workspaceId already backfilled in Phase 1).
- After all live tenants have their clone and every legacy reference has
  been rewritten, **archive** the original template.
- **Verdict:** ✅ Correct long-term shape. Preserves per-tenant UX, satisfies
  Phase 2 invariant, avoids rule exceptions.

---

## 3. Recommended Action

**Option D — clone-on-first-use, executed as a Phase 3 sub-task.**

Execution sequence (all deferred; nothing runs now):

1. Add `isSeedTemplate: true` and `archived: false` to `cat_seed_default`
   via a targeted single-doc write. Doc remains un-scoped.
2. Ship `cloneSeedCategories(workspaceId)` Cloud Function; wire it into
   the tenant-provisioning path and the pre-Phase-3 backfill.
3. For every existing workspace with ≥1 product referencing
   `cat_seed_default`:
   - Create `categories/{workspaceId}_cat_default` (workspaceId-scoped).
   - Batch-update all such products: `categoryId = "{workspaceId}_cat_default"`.
4. Verify: query `products where categoryId == "cat_seed_default"` returns
   0 rows.
5. Archive the template: `{ archived: true, archivedAt: ts, archivedReason: "phase3-template-retired" }`.
6. Update Phase 2 rules to allow read of `isSeedTemplate == true && archived == false`
   docs by any authenticated user — **only if step 5 hasn't shipped yet**.
   The clean path is to complete steps 1–5 before Phase 2 rule cutover so
   no exception is ever required.

**Do NOT:** assign to `ws_root`, hard-delete, or archive before the clone
+ reference-rewrite is complete.

---

## 4. Migration Impact

| Area                        | Impact                                                                                  |
|-----------------------------|-----------------------------------------------------------------------------------------|
| Product records             | 4,812 rows re-pointed to per-tenant category (one-time batch write, chunked at 400).    |
| Historical sales            | None. `categorySnapshot` is denormalised.                                               |
| Reports / dashboards        | None during transition; per-tenant clone preserves category name & metadata.            |
| Offline sync queues         | None. Category ID rewrite happens server-side; clients pick up on next snapshot.        |
| PWA cache                   | Cleared per tenant on Phase 4 schema-version bump; interim clients may briefly show old category doc from cache until refresh. |
| IMEI / warranty             | None.                                                                                   |
| Accounting                  | None. Categories are not ledger entities.                                               |
| Rule surface                | **No exception needed** if steps 1–5 complete before Phase 2 rules ship.                |
| Estimated downtime          | Zero user-visible downtime. Batch runs online; each product update is a single-field write. |
| Estimated duration          | ~2 min for 4,812 product updates + ~5 min per-tenant clone (scales with tenant count).  |

---

## 5. Rollback Notes

Rollback is per-step and non-destructive as long as the template is not
archived (step 5 is the point of no easy return).

| Step                                | Rollback                                                                                     |
|-------------------------------------|----------------------------------------------------------------------------------------------|
| 1. Add `isSeedTemplate` flag        | `FieldValue.delete()` the flag.                                                              |
| 2. Deploy `cloneSeedCategories`     | Feature-flag the function; disable via flag rather than redeploy.                             |
| 3. Per-tenant clone                 | Delete cloned `{workspaceId}_cat_default` docs. Safe until step 4 rewrites references.        |
| 4. Rewrite product references       | Store the previous `categoryId` value in a `_prevCategoryId` field during batch write; rollback batch restores it. Retain `_prevCategoryId` until success criteria met. |
| 5. Archive template                 | Unset `archived`, `archivedAt`, `archivedReason`. Doc body preserved; fully reversible until the doc itself is hard-deleted (never do this). |

Global safety net: take a Firestore export of the `categories` and
`products` collections immediately before step 3 begins.

---

## 6. Risk Assessment

| ID | Risk                                                                                     | Severity | Mitigation                                                             |
|----|------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------|
| C1 | Product reference rewrite races with in-flight offline sales that carry the old categoryId | Medium   | Do rewrite during low-traffic window; sales `categorySnapshot` absorbs any lag. |
| C2 | New tenant provisioned mid-migration doesn't get a clone                                  | Medium   | `cloneSeedCategories` runs synchronously at tenant creation from step 2 onward. |
| C3 | Template read from client cache after archival                                            | Low      | Cache guardrail (`ensureWorkspaceCacheFor`) clears on Phase 4 schema-version bump. |
| C4 | Manual data — a tenant admin renamed the fallback category — gets overwritten on clone   | Low      | Clone is one-shot at first use; won't run if `{workspaceId}_cat_default` already exists. |
| C5 | 4,812 count grows before rewrite runs                                                     | Low      | Re-count immediately before step 3; batch is idempotent — re-runs pick up new rows. |

No **data-loss** or **cross-tenant-leak** risks under Option D. Options A
and C carry data-loss / UX-regression risks and were rejected.

---

## 7. Sign-off Checklist (blocks execution)

- [ ] Platform-eng lead approves Option D and the step ordering above.
- [ ] Phase 3 ticket opened and linked to this document.
- [ ] `cloneSeedCategories` Cloud Function reviewed and staged behind a
      feature flag.
- [ ] Firestore export of `categories` + `products` scheduled for the
      hour preceding step 3.
- [ ] Support briefed: no user-facing change expected; "Unknown category"
      reports during the window should be escalated immediately.
- [ ] Re-verify product-reference count in production (currently 4,812
      in the staging snapshot) before scheduling.

---

*Review only. No production data was read or modified.*
