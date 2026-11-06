# Landing & Login Audit — First-Time Store Owner Perspective

**Scope:** `/` public landing page (`src/pos-app/components/LandingPage.tsx`, 1,549 lines) and its embedded auth panel (`#support` section). Route entry: `src/routes/index.tsx`. No code changes made — report only.
**Persona:** A Bangladeshi shop owner visiting the site for the first time on a mid-range Android phone, deciding within ~15 seconds whether to trust the product and sign up.
**Method:** Static review of the landing route, auth panel, PWA manifest, offline fallback, and auth guard, mapped against WCAG 2.2 AA, Core Web Vitals, and standard SaaS conversion heuristics.

---

## 1. Executive Scores

| Dimension | Score | One-line verdict |
|---|---|---|
| **UI / UX** | **62 / 100** | Rich content, but visual hierarchy and auth flow feel handcrafted rather than designed. |
| **Conversion** | **58 / 100** | CTAs are visible but ambiguous; the login card mixes production sign-in with a "guest test" button that undermines trust. |
| Composite readiness for public launch | **60 / 100** | Ship-able, but leaves measurable sign-up conversion on the table. |

---

## 2. Strengths

1. **Content depth.** Feature grid, testimonials, tutorials, FAQ, and a support/registration block cover the full evaluation journey on one page.
2. **Localised copy.** Bengali-first messaging with familiar business categories (Studio, Grocery, Mobile Servicing) speaks directly to the target market.
3. **Two-path auth.** Google OAuth + guest/demo login reduces friction for "try before you sign up" visitors.
4. **Registration form covers the essentials** — name, phone, Gmail, business type, business name — with a clear "use this Gmail to sign in" confirmation.
5. **Dark-mode aware.** Auth surfaces have `dark:` variants; theme toggle wired.
6. **Semantic sectioning** (`<section id="hero|features|support|…">`) and a real `<h1>` on the hero help screen readers and in-page anchors.
7. **Route-level SEO basics present** (title, description, `og:title`, `og:description`, `og:type` in `src/routes/index.tsx`).
8. **Route-level auth guard exists** (`requireAuthenticated`) so unauthenticated users are consistently returned to `/`.
9. **PWA installable** — a valid manifest (`public/manifest.webmanifest`) and a branded offline fallback (`public/offline.html`) exist.

---

## 3. Weaknesses

### 3.1 Visual hierarchy
- Navbar renders **two identical purple buttons** ("Login" and "Register") at equal weight — no primary/secondary anchor for the eye.
- Hero H1 (`text-3.5xl sm:text-5xl`) sits next to multiple H2s at `text-2xl sm:text-4xl`; the H1 → H2 step-down is too small to guide scanning.
- The auth panel is buried inside `#support` deep on the page; no persistent "Sign in" affordance appears in the header on scroll.

### 3.2 Branding
- Three brand names on one surface: **"Fardous IT POS-2"** (login copy), **"Glorious IT POS"** (route title + manifest), **"Rony / Rony Telecom"** (elsewhere). A first-time visitor cannot tell what the product is called.
- No logo mark or wordmark in the hero region; primary `#8b26c7` (purple), `#004b73` (navy), and amber compete without a documented palette.
- Hard-coded hexes (`#8b26c7`, `#004b73`, `#7e1ebd`) bypass the semantic token system in `src/styles.css` — the landing does not participate in the theme.

### 3.3 Trust signals
- **No customer logos, review counts, star ratings, security badges, "since 20xx" line, or press mentions** above the fold.
- Testimonial section reads as sample data (shop names collide with seed data elsewhere in the codebase).
- A green **"সরাসরি গেস্ট লগইন (Iframe-friendly guest login)"** button sits next to production Google sign-in — signals "unfinished / testing" to a paying customer.
- No links to Privacy Policy, Terms, Refund Policy, or a physical address inside the auth panel.
- No "your data is encrypted" reassurance next to the sign-in button.

### 3.4 Mobile responsiveness
- Registration form inputs use `text-xs` (≈12px), below the ~16px iOS threshold — **Safari auto-zooms on focus** and the layout jumps.
- Mobile nav duplicates the same two purple buttons stacked full-width; no primary/secondary hierarchy.
- Login/Register mobile buttons are `py-2.5 text-xs` — roughly 32–36px tall, under WCAG 2.5.5 / Apple HIG 44×44.
- Long hero + CTA stack on 390×844 pushes the primary CTA below the fold with no scroll cue.

### 3.5 Call-to-action placement
- The **primary CTA is a scroll trigger, not a sign-up action.** Clicking "Register" scrolls to `#support`, then the user must switch tabs — two steps before seeing the form.
- No sticky mobile CTA bar; converting after scroll requires returning to `#support`.
- Header has no "Sign in" text link for returning users — only a button labelled the same as the primary conversion CTA.
- "Enter Portal" / "Owner Portal" chips appear in multiple places with different labels, diluting the single action goal.

### 3.6 Loading performance
- Root route lazy-loads the entire POS app: `lazy(() => import("@/pos-app/App"))` with a plain **"Loading POS…"** fallback. First-time marketing visitors see an unbranded blank slate until the chunk finishes.
- `LandingPage.tsx` is 1,549 lines and lives inside `src/pos-app/App.tsx` (7,103 lines). The landing waits for the *entire* POS bundle to download before it can render — a marketing visitor pays for code they will never use.
- Above-the-fold LCP image is not optimised; hero renders after hydration.
- No `<link rel="preload">` for hero fonts or icons.

### 3.7 Typography
- `font-display` / `font-sans` are referenced but font files are not preloaded from the route head — expect FOUT/FOIT.
- Registration form uses `text-xs`, `text-[11px]`, `text-[10px]`, and `text-[9px]` helpers — the `text-[9px]` line under the email field is unreadable on a phone and fails WCAG 1.4.4 in spirit.
- Mixed Bengali + English + emoji ("✓") in the same headings creates uneven baselines because the display font stack likely lacks matching Bengali glyphs.

### 3.8 Colors and spacing
- Purple, navy, amber, emerald, rose, sky, and teal appear on the same page with no clear semantic role per color.
- Auth panel `bg-slate-50` sits inside a `bg-[#f8fafc]` section — nearly identical backgrounds make the card blend in.
- Muted text `text-slate-400` / `text-slate-500` on light backgrounds; the `text-[9px]` helper in slate-400 likely fails WCAG AA contrast at that size.
- Custom `border-slate-250` is not a real Tailwind token and silently renders no border.

### 3.9 Login UX
- **Only Google OAuth + guest/demo** are offered. No email + password, magic link, phone OTP, or Apple sign-in — shop owners without Gmail are locked out.
- No "Forgot / can't sign in?" recovery link.
- No "Remember me" or session-length indication.
- No pending/spinner state on the Google button (`onClick={login}` fires without a local `isLoading`).
- Subtitle "Fardous IT POS-2 …" above the sign-in button conflicts with the header brand.
- Tab switch between Login and Register resets state silently — no confirmation if the user typed into the form.
- **Guest/demo button** sits inside the same card as production login without a boundary — a first-time owner may accidentally create demo data instead of a real account.

### 3.10 Error handling
- `authError` renders in a rose banner with a **hard-coded suggestion to switch to Registration** — wrong for password-reset, popup-blocked, or third-party-cookie errors; loops the user.
- Error copy is a single blob (`{authError}`) with no error-code differentiation (popup blocked vs. account disabled vs. offline).
- `regError` renders as one small pill; no field-level validation, no `aria-invalid`, no focus move to the failing field.
- Phone input has no format validation; placeholder contains typos (`০১৭াত৭৪৬০৫২` — Bengali digits mixed with `া` and `ত`).
- No offline banner on the landing itself, despite the app being a PWA.
- No `aria-live` region — screen readers get nothing on success or error.

### 3.11 Accessibility
- **Registration form labels are not associated with inputs** — `<label>` has no `htmlFor`, inputs have no `id`. Screen readers do not announce the field name on focus. Single most impactful a11y defect on the page.
- Icon-only nav buttons (`<Menu/>`, `<X/>`, `<LogIn/>`) have no `aria-label`.
- Error banner is a static `<div>`, not `role="alert" aria-live="assertive"` — new errors are silent for AT users.
- Decorative "✓" is not `aria-hidden`.
- Auth tab active state is color-only — no `role="tab"` / `aria-selected`.
- Input focus ring is `focus:ring-1` — thin and low-contrast in dark mode.
- File uses `// @ts-nocheck` — hides real prop/typing bugs that a11y audits usually surface.
- Page content is Bengali but `<html lang>` is `en` (see `public/offline.html` and the root shell) — screen readers will mispronounce.

---

## 4. Specific Improvements (prioritised)

### P0 — Ship before public launch
1. **Split the landing bundle from the POS bundle.** Move `LandingPage.tsx` out of `src/pos-app/App.tsx` so `/` renders marketing HTML without the 7k-line POS. Replace the "Loading POS…" fallback with a branded skeleton.
2. **Associate every form label with its input** (`htmlFor` + `id`), add `aria-invalid` / `aria-describedby` for errors.
3. **Wrap auth errors in `role="alert" aria-live="assertive"`** and remove the hard-coded "switch to registration" CTA — replace with error-code-specific suggestions (popup blocked → open in new tab; offline → retry; unknown account → register).
4. **Pick one brand name** across header, `<title>`, manifest, auth panel subtitle, and testimonials. "Glorious IT POS" vs "Fardous IT POS-2" vs "Rony Telecom" must resolve to one.
5. **Move the guest/demo button out of the primary sign-in card.** Place it under a collapsed "Try a demo without signing up" disclosure so paying users don't perceive the product as unfinished.
6. **Add a persistent header CTA on scroll** (single primary "Get Started"); demote the secondary to a text link.
7. **Bump form input font-size to ≥16px** to prevent iOS auto-zoom, and raise mobile tap targets to ≥44px.

### P1 — Within first two weeks
8. Add a trust row above the fold: active-store count, "since 202x", one-line security statement, Play Store rating if applicable.
9. Add **email/password** and **phone OTP** sign-in alongside Google — Gmail-only blocks a large share of the target market.
10. Add a "Forgot sign-in? / Can't access account?" link that opens a static help page.
11. Add loading state to the Google button; disable after first click.
12. Replace `border-slate-250` (non-existent) with a real token; route all hard-coded hexes through the design tokens in `src/styles.css`.
13. Fix placeholder typos and add basic client-side format validation with inline errors.
14. Add footer links to Privacy / Terms / Refund / Contact directly inside the auth card, not only in the page footer.

### P2 — Craft & polish
15. Rebuild the type scale: H1 ≥48px desktop / 32px mobile, H2 28/22, body 16, helper 13. Remove `text-[9px]` and `text-[10px]` everywhere.
16. Preload the display font and hero image; inline critical CSS.
17. Ship real testimonials with names, shop names, and photos; if unavailable, remove the block until three exist.
18. Replace icon-only buttons with icon-plus-label or add `aria-label`; add `role="tablist" / role="tab" / aria-selected` to Login/Register tabs.
19. Add a sticky mobile bottom bar with the single primary CTA on scroll.
20. Set `<html lang="bn">` (or per-section `lang` attributes) so assistive tech pronounces Bengali correctly; update `public/offline.html` too.

---

## 5. What to measure after fixes

- **LCP** and **TTI** on `/` on a throttled 4G Moto G4 profile — target LCP < 2.5s, TTI < 3.5s.
- **Sign-up conversion rate** (visits → completed registration) — instrument before/after P0/P1.
- **Google sign-in success rate** vs. `auth/popup-blocked` and `auth/network-request-failed` — validates the error-handling rewrite.
- **Axe / Lighthouse a11y score** on `/` — target ≥ 95 after label + `aria-live` fixes.

---

**Bottom line:** the page has all the ingredients (content, localisation, dual auth paths) but presents them like a dashboard, not a marketing surface. The three highest-leverage fixes are (a) split the landing bundle so first paint is instant and branded, (b) resolve the brand-name conflict and hide the demo button behind a disclosure, and (c) fix the auth-form a11y + error handling so real sign-up attempts stop failing silently.
