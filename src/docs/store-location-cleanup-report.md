# Store Location Module — Cleanup Report

## Scope
Removed the deprecated "Store Location" (Places) sidebar entry and its dead state. No business logic, Firestore, sync, permissions, reports, or multi-tenant code touched.

## Removed from `src/pos-app/App.tsx`
- **Sidebar entry** — the entire `id: 'places'` group (`জায়গা / Places` with sub-item `স্টোর লোকেশন / Store Locations`).
- **Dead state:**
  - `branches` / `setBranches` (3-item hardcoded array).
  - `isAddBranchOpen` / `setIsAddBranchOpen`.
  - `warehouses` / `setWarehouses` (2-item hardcoded array, no readers).
- **Unused import:** `MapPin` from `lucide-react` (last consumer was the Places entry).

## Kept intact (verified)
- `warehousesList` / `setWarehousesList` — separate variable; still powers active warehouse dropdowns.
- All Firestore collections, security rules, offline sync queues, reports, permissions, and multi-tenant scoping — untouched.
- No route, loader, or component referenced `activeTab === 'places'` (confirmed via repo grep), so no dead render path remained.

## Removed files
None. All removals were in-file cleanups within `src/pos-app/App.tsx`.

## Bundle size impact
- Source: **-27 lines** in `App.tsx` (2 state blocks + sidebar group + 1 icon import).
- Runtime: eliminates ~5 hardcoded object literals and one `lucide-react` icon (`MapPin`) from the main chunk. `MapPin` is not imported elsewhere in `App.tsx`; tree-shaking drops it from the bundle. Estimated saving ≈ **0.4–0.8 KB gzipped** in the main app chunk (icon + inline data). No route chunks affected.

## Verification
- `rg` confirms zero remaining references to `MapPin`, `branches`, `setBranches`, `isAddBranchOpen`, `setWarehouses`, or `activeTab === 'places'` in the codebase.
- `warehousesList` remains and is unchanged.
