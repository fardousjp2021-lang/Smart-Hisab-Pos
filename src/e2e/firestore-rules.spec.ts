/**
 * Firestore rules test suite for Phase 2 multi-tenant migration.
 *
 * Run with the Firebase Emulator:
 *   firebase emulators:exec --only firestore \
 *     "npx vitest run e2e/firestore-rules.spec.ts"
 *
 * The suite loads the PROPOSED Phase 2 rules from `rules/proposed/phase2.rules`
 * (not yet committed — staged separately as part of the Phase 2 diff). While
 * that file is absent the suite is skipped, so CI stays green.
 *
 * Simulated tenants: A (ws_a), B (ws_b), C (ws_c). Each has an admin and
 * a staff user plus a customer/supplier record.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

const PROPOSED_RULES = resolve('rules/proposed/phase2.rules');
const RULES_READY = existsSync(PROPOSED_RULES);

const ws = { A: 'ws_a', B: 'ws_b', C: 'ws_c' };
const users = {
  adminA:    { uid: 'u_admin_a',    ws: ws.A, admin: true,  approved: true,  verified: true },
  staffA:    { uid: 'u_staff_a',    ws: ws.A, admin: false, approved: true,  verified: true },
  adminB:    { uid: 'u_admin_b',    ws: ws.B, admin: true,  approved: true,  verified: true },
  staffB:    { uid: 'u_staff_b',    ws: ws.B, admin: false, approved: true,  verified: true },
  adminC:    { uid: 'u_admin_c',    ws: ws.C, admin: true,  approved: true,  verified: true },
  staffC:    { uid: 'u_staff_c',    ws: ws.C, admin: false, approved: true,  verified: true },
  pendingA:  { uid: 'u_pending_a',  ws: null, admin: false, approved: false, verified: true  },
  unverified:{ uid: 'u_unver',      ws: null, admin: false, approved: false, verified: false },
};

const BUSINESS_COLLECTIONS = [
  'products','services','categories','brands','variants',
  'customers','suppliers','sales','purchases','expenses',
  'notifications','reports',
];

function ctx(env: RulesTestEnvironment, u: typeof users[keyof typeof users]) {
  return env.authenticatedContext(u.uid, {
    email_verified: u.verified,
    admin: u.admin,
    approved: u.approved,
    workspaceId: u.ws ?? undefined,
  }).firestore();
}

let env: RulesTestEnvironment;

(RULES_READY ? describe : describe.skip)('Phase 2 Firestore rules', () => {
  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: 'multi-tenant-rules-test',
      firestore: { rules: readFileSync(PROPOSED_RULES, 'utf8') },
    });
    // Seed one doc per tenant in every business collection.
    await env.withSecurityRulesDisabled(async (c) => {
      const db = c.firestore();
      for (const col of BUSINESS_COLLECTIONS) {
        for (const tenant of Object.values(ws)) {
          await db.collection(col).doc(`${tenant}_seed`).set({
            workspaceId: tenant, createdAt: Date.now(), name: `${col}-${tenant}`,
          });
        }
      }
      // imeiSales still flat-keyed in Phase 2.
      for (const tenant of Object.values(ws)) {
        await db.collection('imeiSales').doc(`imei_${tenant}_1`).set({
          workspaceId: tenant, imei: `imei_${tenant}_1`, soldAt: Date.now(),
        });
      }
    });
  });
  afterAll(async () => { await env?.cleanup(); });

  describe('Workspace isolation — reads', () => {
    for (const col of BUSINESS_COLLECTIONS) {
      it(`${col}: staff A reads own tenant doc`, async () => {
        await assertSucceeds(ctx(env, users.staffA).collection(col).doc(`${ws.A}_seed`).get());
      });
      it(`${col}: staff A CANNOT read tenant B doc`, async () => {
        await assertFails(ctx(env, users.staffA).collection(col).doc(`${ws.B}_seed`).get());
      });
      it(`${col}: staff A CANNOT read tenant C doc`, async () => {
        await assertFails(ctx(env, users.staffA).collection(col).doc(`${ws.C}_seed`).get());
      });
    }
  });

  describe('Workspace isolation — writes', () => {
    for (const col of BUSINESS_COLLECTIONS) {
      it(`${col}: staff B can write with own workspaceId`, async () => {
        await assertSucceeds(
          ctx(env, users.staffB).collection(col).add({ workspaceId: ws.B, name: 'ok' })
        );
      });
      it(`${col}: staff B CANNOT write with tenant A workspaceId (leak attempt)`, async () => {
        await assertFails(
          ctx(env, users.staffB).collection(col).add({ workspaceId: ws.A, name: 'leak' })
        );
      });
      it(`${col}: staff B CANNOT write with missing workspaceId`, async () => {
        await assertFails(
          ctx(env, users.staffB).collection(col).add({ name: 'no-ws' })
        );
      });
    }
  });

  describe('Admin permissions', () => {
    it('admin A reads own tenant sales', async () => {
      await assertSucceeds(ctx(env, users.adminA).collection('sales').doc(`${ws.A}_seed`).get());
    });
    it('admin A CANNOT read tenant B sales (tenant admin, not super-admin)', async () => {
      await assertFails(ctx(env, users.adminA).collection('sales').doc(`${ws.B}_seed`).get());
    });
    it('admin A can delete own tenant product', async () => {
      await assertSucceeds(
        ctx(env, users.adminA).collection('products').doc(`${ws.A}_seed`).delete()
      );
    });
    it('staff A CANNOT delete own tenant product (admin-only)', async () => {
      await assertFails(
        ctx(env, users.staffA).collection('products').doc(`${ws.A}_seed`).delete()
      );
    });
  });

  describe('Registration & approval flow', () => {
    it('unverified user CANNOT read any business collection', async () => {
      await assertFails(ctx(env, users.unverified).collection('sales').doc(`${ws.A}_seed`).get());
    });
    it('verified-but-unapproved user CANNOT read business collections', async () => {
      await assertFails(ctx(env, users.pendingA).collection('sales').doc(`${ws.A}_seed`).get());
    });
    it('pending user can read own registrations doc', async () => {
      await assertSucceeds(
        ctx(env, users.pendingA).collection('registrations').doc(users.pendingA.uid).get()
      );
    });
    it('pending user CANNOT read another user registration', async () => {
      await assertFails(
        ctx(env, users.pendingA).collection('registrations').doc(users.staffA.uid).get()
      );
    });
  });

  describe('Offline sync writes (batched, dual-write shape)', () => {
    it('staff A batch write of 3 sales with own workspaceId succeeds', async () => {
      const db = ctx(env, users.staffA);
      const batch = db.batch();
      for (let i = 0; i < 3; i++) {
        batch.set(db.collection('sales').doc(), { workspaceId: ws.A, total: 100, offline: true });
      }
      await assertSucceeds(batch.commit());
    });
    it('staff A batch write mixing own + tenant B workspaceId is rejected atomically', async () => {
      const db = ctx(env, users.staffA);
      const batch = db.batch();
      batch.set(db.collection('sales').doc(), { workspaceId: ws.A, total: 100 });
      batch.set(db.collection('sales').doc(), { workspaceId: ws.B, total: 100 }); // leak
      await assertFails(batch.commit());
    });
  });

  describe('IMEI & warranty access (Phase 2 — flat keying)', () => {
    it('staff A reads own tenant imeiSales row', async () => {
      await assertSucceeds(ctx(env, users.staffA).collection('imeiSales').doc(`imei_${ws.A}_1`).get());
    });
    it('staff A CANNOT read tenant B imeiSales row', async () => {
      await assertFails(ctx(env, users.staffA).collection('imeiSales').doc(`imei_${ws.B}_1`).get());
    });
    it('staff A CANNOT create imeiSales without workspaceId', async () => {
      await assertFails(
        ctx(env, users.staffA).collection('imeiSales').add({ imei: 'new_imei', soldAt: Date.now() })
      );
    });
  });
});
