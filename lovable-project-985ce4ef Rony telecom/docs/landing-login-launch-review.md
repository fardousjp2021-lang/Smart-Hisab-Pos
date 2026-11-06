# Landing & Login — Post-Fix Launch Review

Re-run of `docs/landing-login-launch-review.md` after the three launch blockers were addressed. Same seven lenses, same must-fix / v1.1 / nice-to-have classification. Authentication, routes, and business logic unchanged.

---

## 1. What Shipped This Turn

| # | Blocker | Fix | Where |
|---|---|---|---|
| 1 | Privacy Policy + Terms of Service missing | New `/privacy` and `/terms` public routes (app-owner editable content, clear qualifier). Links added in three places, all `target="_blank" rel="noopener noreferrer"` | `src/routes/privacy.tsx`, `src/routes/terms.tsx`; `LandingPage.tsx` under Google sign-in, under registration submit, and in the footer |
| 2 | Hero mockup could be mistaken for real data | Amber "নমুনা স্ক্রিন / Demo Preview — Sample data, not a live account" ribbon with `role="note"` above the mock invoice; header caption suffixed "· SAMPLE" | `LandingPage.tsx` hero mockup card |
| 3 | Dead `#hero` header link | "মেইন ওয়েবসাইট" (desktop + mobile) now scrolls smoothly to top of page and clears the URL hash; `id="hero"` on the section is preserved for any external deeplinks | `LandingPage.tsx` header + mobile nav |

Typecheck: clean.

---

## 2. Findings by Section — After Fixes

### 2.1 Hero Section Clarity
- Mock invoice card now carries a visible "Sample / Demo Preview" ribbon and a "SAMPLE" suffix on the live-feed caption — a first-time visitor cannot mistake it for their own account.
- One-line value prop above the H1 and inline hero CTA still deferred (v1.1).

### 2.2 Call-to-Action Visibility
- Header still shows one text link ("লগইন") + one primary CTA ("ফ্রি রেজিস্ট্রেশন"); mobile hamburger leads with the primary CTA.
- Sticky mobile bottom CTA and in-hero CTA button remain v1.1.

### 2.3 Pricing Presentation
- Free-lifetime claim unchanged and consistent. Dedicated `#pricing` explainer section still v1.1.

### 2.4 Trust Signals
- **Now present:** Privacy Policy and Terms of Service links immediately below the Google sign-in trust line, below the registration submit button, and in the footer — satisfies the Google OAuth branding review requirement and gives shop owners a real disclosure surface.
- Live active-store count and third-party badges remain v1.1 / nice-to-have.

### 2.5 Testimonials / Demo Sections
- Guest login remains behind the `<details>` disclosure. Real testimonial cards (photo + shop + city) still v1.1.

### 2.6 Signup Friction
- 5-field registration and Google-only auth unchanged (v1.1 scope).
- Consent-style copy under both the sign-in button and the register button now points to Privacy / Terms — no forced checkbox, no added click, no friction increase.

### 2.7 Mobile Usability
- All Privacy / Terms links inherit `min-h`-safe footer / auth surfaces; they open in a new tab so returning to the register flow is one back-swipe.
- `<html lang="bn">`, sticky mobile CTA bar, and bundle split remain v1.1 / nice-to-have.

---

## 3. Classification — Refreshed

### Must fix before launch
- **None.** All three prior blockers are resolved.

### Can wait until v1.1
1. Dedicated `#pricing` / `প্যাকেজ` section ("৳০ / আজীবন" + "কেন ফ্রি?" explainer).
2. One-line value prop above the hero H1.
3. In-hero CTA button (fold-level conversion path).
4. Sticky mobile bottom CTA bar.
5. WhatsApp fallback link inside the auth-error banner.
6. Reduce registration to email + business name; defer phone / type / full name to post-signup.
7. Replace placeholder testimonials with 3 real ones (photo + shop + city + date) or hide the section until available.
8. Set `<html lang="bn">` in `__root.tsx`.

### Nice-to-have
9. 30-sec product demo GIF/video near the hero.
10. Firebase / Google Cloud / SSL trust badges near the sign-in card.
11. Live "X shops onboarded" counter.
12. Email/password or phone-OTP as a secondary auth path.
13. Split the landing bundle from the POS bundle for instant first paint.
14. Preload the Bengali web font (`font-display: swap`).

---

## 4. Verdict

All three launch-blocking items from the previous review are closed. Privacy / Terms are legally addressable, the hero mockup is clearly labeled as a sample, and every header nav link works with smooth scrolling. The remaining backlog is conversion polish (v1.1) or perf polish (nice-to-have) — none of it blocks a first public release.

**LANDING PAGE READY FOR PUBLIC LAUNCH**
