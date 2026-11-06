# Firebase App Check Setup (reCAPTCHA Enterprise)

App Check protects **Authentication**, **Firestore**, **Storage**, and **Cloud Functions** from abuse by requiring every request to carry a short-lived attestation token. The web client is already wired up in `src/pos-app/firebase.ts` — this document covers the Google Cloud + Firebase Console steps needed to turn it on.

## 1. Create a reCAPTCHA Enterprise site key

1. Open <https://console.cloud.google.com/security/recaptcha> for the `fardouscomputer52` project.
2. **Create key** → *Website*.
3. Name: `fardous-pos-appcheck`.
4. Domains: add every domain that serves the PWA:
   - `localhost`
   - your `*.lovable.app` preview + published domains
   - any custom domain
5. Platform type: **Score-based (recommended)**. Leave *Use checkbox challenge* **off**.
6. Save and copy the **Site key** (public — safe to ship in the client bundle).

## 2. Register the key with Firebase App Check

1. Firebase Console → **Build → App Check → Apps** tab.
2. Select the Web app `1:717340284906:web:58c05d06fbaac2f3c78493`.
3. Provider: **reCAPTCHA Enterprise** → paste the site key from step 1.
4. Token TTL: leave default (1h) unless you have a reason to shorten it.

## 3. Add the site key to Lovable

Set the following Vite env vars (Lovable → Project Settings → Environment):

| Name | Value |
| --- | --- |
| `VITE_FIREBASE_APPCHECK_SITE_KEY` | *(reCAPTCHA Enterprise site key)* |
| `VITE_FIREBASE_APPCHECK_DEBUG` | `true` **only** in local dev — never in prod |

The client initialises App Check only when the site key is present, so preview builds without the env var keep working (unenforced) while you provision.

## 4. Local development — debug tokens

For `bun run dev` on `localhost`:

1. Set `VITE_FIREBASE_APPCHECK_DEBUG=true` in `.env.local`.
2. Reload the app; the browser console prints:
   `App Check debug token: XXXXXXXX-XXXX-...`
3. Firebase Console → **App Check → Apps → ⋮ → Manage debug tokens** → paste it.
4. Debug tokens are per-browser; each developer registers their own.

Never enable the debug flag in a production build.

## 5. Enforce per service

Enforce **only after** you see healthy verified requests in the App Check → *Requests* metrics for that service (usually 24 h). Turn on in this order:

1. **Firestore** → App Check → **Enforce**.
2. **Storage** → App Check → **Enforce**.
3. **Authentication** → App Check → **Enforce** (Identity Platform).
4. **Cloud Functions** (per callable/HTTPS function) → **Enforce**.

Each service has a *Monitor* → *Enforce* switch; unverified requests start being rejected immediately after enforcement.

## 6. Verify

- Chrome DevTools → Network → any `firestore.googleapis.com` request → Request headers should include `X-Firebase-AppCheck: <jwt>`.
- Firebase Console → App Check → *Requests* → verified traffic should approach 100 % before enforcement.
- Offline: queued writes flush after reconnect; the Firestore SDK refetches an App Check token automatically, so offline sync is unaffected.
- PWA: the service worker leaves `firestore.googleapis.com`, `identitytoolkit.googleapis.com`, and `securetoken.googleapis.com` on `NetworkOnly`, so App Check tokens are always minted fresh — no cached-token pitfalls.

## 7. Rollback

If enforcement causes production incidents:

1. Firebase Console → App Check → affected service → switch back to **Monitor**.
2. Investigate the *Unverified requests* breakdown (missing domain in reCAPTCHA key, expired debug token, third-party embed, etc.).
3. Re-enforce once verified traffic is healthy again.

## What did NOT change

- Business logic, routes, UI theme, Firestore collections, security rules, accounting calculations, and offline sync behaviour are untouched.
- The only client change is adding `initializeAppCheck(...)` in `src/pos-app/firebase.ts`, guarded by the presence of `VITE_FIREBASE_APPCHECK_SITE_KEY`.
