# Firestore Indexes — Deployment Guide

`firestore.indexes.json` at the repo root defines every composite index required by the POS list pages and reports for large SaaS deployments. Single-field ascending indexes are auto-created by Firestore, so only the composites (`workspaceId + …`, `userId + …`, `status + createdAt`) are declared here.

## Coverage

| Collection | Indexes |
| --- | --- |
| `products` | `workspaceId+createdAt`, `+categoryId+createdAt`, `+supplierId+createdAt`, `+status+createdAt`, `+expiryDate`, `+imei`, `+serialNumber` |
| `sales` | `workspaceId+createdAt`, `+status+createdAt`, `+customerId+createdAt` |
| `sales_returns` | `workspaceId+createdAt`, `+customerId+createdAt` |
| `purchases` | `workspaceId+createdAt`, `+supplierId+createdAt`, `+status+createdAt` |
| `expenses` | `workspaceId+createdAt`, `+categoryId+createdAt` |
| `stockMovements` | `workspaceId+createdAt`, `+status+createdAt` |
| `issues` | `workspaceId+createdAt`, `+status+createdAt`, `+customerId+createdAt` |
| `customers` / `suppliers` | `workspaceId+createdAt`, `+status+createdAt` |
| `quotations` | `workspaceId+createdAt`, `+status+createdAt`, `+customerId+createdAt` |
| `imeiSales` | `workspaceId+imei`, `workspaceId+createdAt` |
| `notifications` | `userId+createdAt`, `userId+read+createdAt` |
| `registrations` | `status+createdAt` |

All composites sort `createdAt DESC` so list pages and reports can paginate newest-first with `orderBy('createdAt','desc').limit(n).startAfter(cursor)` — this is what keeps read cost O(page-size) instead of O(collection-size) on large tenants.

## Deploy

### One-time setup

```bash
npm i -g firebase-tools
firebase login
firebase use fardouscomputer52
```

Ensure `firebase.json` references the file (add if missing):

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### Push indexes

```bash
firebase deploy --only firestore:indexes
```

Firestore builds each index in the background. Progress is visible in **Firebase Console → Firestore → Indexes**. Queries that need a still-building index return `failed-precondition` until the index reports **Enabled** — usually seconds for empty collections, minutes-to-hours for millions of docs.

### Push rules + indexes together

```bash
firebase deploy --only firestore
```

### CI / automated deploys

Add to your pipeline after auth via `FIREBASE_TOKEN` (`firebase login:ci`):

```bash
firebase deploy --only firestore:indexes --project fardouscomputer52 --token "$FIREBASE_TOKEN" --non-interactive
```

## Verify

1. **Firebase Console → Firestore → Indexes** — all entries **Enabled**, none **Building** or **Error**.
2. Run the list pages (Sales, Purchases, Products, Reports) against a workspace with lots of data — no `The query requires an index` errors in the browser console.
3. Firestore usage graph — reads per page should be roughly the page size, not the full collection.

## Adding a new composite index later

1. Add the object to the `indexes` array in `firestore.indexes.json` (same shape as the existing entries).
2. Commit and re-run `firebase deploy --only firestore:indexes`.
3. Alternatively, when a query fails at runtime Firestore prints a **Create index** link in the console — clicking it also updates the console, but always mirror the change back into `firestore.indexes.json` so it stays the source of truth.

## What did not change

Business logic, routes, UI, offline sync, security rules, and accounting calculations are untouched — this change is index metadata only.
