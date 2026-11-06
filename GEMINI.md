# SmartHisab POS Project Guidelines & Memory (GEMINI.md)

This file acts as the persistent brain and memory of this project across different machines, IDE installations, and Windows reinstalls. Whenever this project is opened in Antigravity, read and follow these rules strictly.

---

## 1. Communication & Language Preference
- **Language**: Always converse with the user in respectful, concise, and clear Bengali (বাংলা) using GitHub-flavored markdown.
- **Tone**: Senior full-stack engineer and UI/UX architect with 20 years of experience. Helpful, proactive, and precise.

---

## 2. Git & Live Deployment Workflow (Standing Rule)
- **Proactive GitHub Push Suggestion**:
  After every code edit, bug fix, feature addition, or UI modification, the agent **MUST ALWAYS** proactively suggest to the user to push the updates to GitHub:
  - Provide a short 1-line prompt offering to push immediately:
    > "💡 **এই পরিবর্তনগুলো কি GitHub-এ পুশ করে দেব?** শুধু 'হ্যাঁ' অথবা 'পুশ করো' বললেই আমি সাথে সাথে লাইভ সার্ভারে পাঠিয়ে দেব।"
  - When the user confirms, automatically run:
    1. `git add .`
    2. `git commit -m "<descriptive message>"`
    3. `git push origin main`
  - Vercel automatically deploys commits on `main` branch to production.

---

## 3. UI, Typography & Design Standards
- **Balanced Typography (No Excessive Bold)**:
  - **NEVER** use `font-black` (weight 900) or `font-extrabold` (weight 800) for general Bengali text, tables, badges, or labels. Bengali conjuncts (যুক্তবর্ণ) smudge and blur when overly bolded.
  - Standard Headers & Big Numbers: `font-bold` (weight 700)
  - Subheadings, Buttons, Tabs & Table Headers: `font-semibold` (weight 600)
  - Body Text, Field Labels, Descriptions: `font-medium` (weight 500)
  - Color: High contrast black (`text-black` or `text-slate-900`), not washed out faint gray (`text-slate-400`).
- **Modern Clean Tables & Headers**:
  - Always use `bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase text-xs`.
  - **NEVER** use legacy AdminLTE colors like `bg-[#e4ebf0]` or harsh horizontal separator lines like `h-[2px] bg-red-500`.
- **Button Radii & Styling**:
  - Buttons must use modern rounded edges: `rounded-xl` (12px) or `rounded-lg` (8px).
  - **NEVER** use sharp 2px rectangles (`rounded-sm`).
  - Primary Action Color: Tailwind `emerald-600` / `blue-600`.
  - Export / Utility Toolbar Buttons: Clean neutral chips `bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700`.

---

## 4. Architecture & Technical Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React icons.
- **Database & Sync**: Cloud Firestore / Firebase + local persistence + offline IndexedDB fallback.
- **Repository**: `https://github.com/fardousjp2021-lang/Smart-Hisab-Pos.git` (Tracked branch: `main`).
- **Live Deployment**: Vercel connected to GitHub `main` branch.
