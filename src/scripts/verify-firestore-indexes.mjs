#!/usr/bin/env node
// CI gate: verifies every required composite index is declared in
// firestore.indexes.json AND live in the Firestore project before the
// multi-tenant client release ships.
//
// Runs in two modes:
//   1. Static (default) — checks that firestore.indexes.json contains
//      every required composite shape. No network calls. Fast, safe to
//      run on every PR.
//   2. Live (--live) — additionally calls the Firestore Admin REST API
//      to confirm each declared composite reports state === READY.
//      Requires GOOGLE_APPLICATION_CREDENTIALS (service account JSON)
//      and FIRESTORE_PROJECT_ID env vars. Run before every release.
//
// Exit codes:
//   0  all required composites declared (and READY in --live mode)
//   1  one or more required composites missing / still building
//   2  configuration error (missing env vars, bad JSON, etc.)
//
// The required index shapes MUST stay in sync with
// src/pos-app/lib/indexReadiness.ts → REQUIRED_INDEXES.

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Mirror of src/pos-app/lib/indexReadiness.ts → REQUIRED_INDEXES.
// Keep in sync when adding a new composite.
const REQUIRED = [
  { collection: 'sales',     equalityField: 'workspaceId', rangeField: 'date',       rangeDirection: 'DESCENDING' },
  { collection: 'purchases', equalityField: 'workspaceId', rangeField: 'date',       rangeDirection: 'DESCENDING' },
  { collection: 'products',  equalityField: 'workspaceId', rangeField: 'categoryId', rangeDirection: 'ASCENDING'  },
  { collection: 'imeiSales', equalityField: 'workspaceId', rangeField: 'imei',       rangeDirection: 'ASCENDING'  },
];

function label(r) {
  return `${r.collection}.${r.equalityField} + ${r.rangeField} (${r.rangeDirection})`;
}

// ---------------------------------------------------------------------------
// Mode 1 — static check against firestore.indexes.json
// ---------------------------------------------------------------------------

function indexMatches(declared, required) {
  if (declared.collectionGroup !== required.collection) return false;
  const fields = declared.fields ?? [];
  if (fields.length < 2) return false;
  const [first, second] = fields;
  return (
    first?.fieldPath === required.equalityField &&
    (first?.order === 'ASCENDING' || first?.order === 'DESCENDING') &&
    second?.fieldPath === required.rangeField &&
    second?.order === required.rangeDirection
  );
}

async function checkStatic() {
  const path = resolve(process.cwd(), 'firestore.indexes.json');
  let doc;
  try {
    doc = JSON.parse(await readFile(path, 'utf8'));
  } catch (e) {
    console.error(`[index-gate] cannot read ${path}: ${e.message}`);
    process.exit(2);
  }
  const declared = doc.indexes ?? [];
  const missing = REQUIRED.filter((r) => !declared.some((d) => indexMatches(d, r)));
  if (missing.length === 0) {
    console.log('[index-gate] static check PASSED — all required composites declared.');
    return true;
  }
  console.error('[index-gate] static check FAILED — missing composites:');
  missing.forEach((r) => console.error(`  - ${label(r)}`));
  return false;
}

// ---------------------------------------------------------------------------
// Mode 2 — live check against Firestore Admin REST API
// ---------------------------------------------------------------------------
//
// GET https://firestore.googleapis.com/v1/projects/{p}/databases/(default)/collectionGroups/{c}/indexes
// requires a Bearer access token minted from a service account with the
// `roles/datastore.indexAdmin` (or equivalent read) role.

async function accessTokenFromServiceAccount() {
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!path) {
    console.error('[index-gate] --live requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service-account JSON.');
    process.exit(2);
  }
  const sa = JSON.parse(await readFile(path, 'utf8'));
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const b64u = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsigned = `${b64u(header)}.${b64u(claims)}`;
  const { createSign } = await import('node:crypto');
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(sa.private_key).toString('base64url');
  const assertion = `${unsigned}.${signature}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!res.ok) {
    console.error('[index-gate] failed to mint access token:', await res.text());
    process.exit(2);
  }
  const json = await res.json();
  return json.access_token;
}

async function checkLive() {
  const projectId = process.env.FIRESTORE_PROJECT_ID;
  if (!projectId) {
    console.error('[index-gate] --live requires FIRESTORE_PROJECT_ID env var.');
    process.exit(2);
  }
  const token = await accessTokenFromServiceAccount();
  const collections = [...new Set(REQUIRED.map((r) => r.collection))];
  const liveByCollection = {};
  for (const c of collections) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/${c}/indexes`;
    const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
    if (!res.ok) {
      console.error(`[index-gate] admin API error for ${c}:`, res.status, await res.text());
      process.exit(2);
    }
    liveByCollection[c] = (await res.json()).indexes ?? [];
  }
  const notReady = [];
  for (const req of REQUIRED) {
    const match = liveByCollection[req.collection].find((idx) => {
      const fs = idx.fields ?? [];
      return (
        fs.length >= 2 &&
        fs[0].fieldPath === req.equalityField &&
        (fs[0].order === 'ASCENDING' || fs[0].order === 'DESCENDING') &&
        fs[1].fieldPath === req.rangeField &&
        fs[1].order === req.rangeDirection
      );
    });
    if (!match) {
      notReady.push({ req, reason: 'not declared in Firestore' });
      continue;
    }
    if (match.state !== 'READY') {
      notReady.push({ req, reason: `state=${match.state}` });
    }
  }
  if (notReady.length === 0) {
    console.log('[index-gate] live check PASSED — all required composites READY in Firestore.');
    return true;
  }
  console.error('[index-gate] live check FAILED:');
  notReady.forEach(({ req, reason }) => console.error(`  - ${label(req)}  → ${reason}`));
  return false;
}

// ---------------------------------------------------------------------------

const live = process.argv.includes('--live');
const staticOk = await checkStatic();
if (!staticOk) process.exit(1);
if (live) {
  const liveOk = await checkLive();
  if (!liveOk) process.exit(1);
}
process.exit(0);
