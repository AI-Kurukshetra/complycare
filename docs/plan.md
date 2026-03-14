# ComplyCare — Vibe Coding Project Plan

**Product:** HIPAA Compliance & Healthcare Security Management Platform
**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Docker · Vercel
**Goal:** Hackathon-winning SaaS platform that automates HIPAA compliance for small-to-medium healthcare organizations

---

## 📊 Phase 0 — Evaluation (COMPLETE ✅)

**Score: 87/100** — Approved for development.

| Criterion | Score |
|-----------|-------|
| Problem Severity | 9 — HIPAA fines can reach $1.9M/year; manual compliance is a real pain |
| Market Size | 9 — 6,000+ hospitals + 230,000+ clinics in the US alone |
| Simplicity | 8 — Clear value prop: "automate HIPAA compliance" |
| Virality Potential | 6 — B2B SaaS, spreads via consultants and referrals |
| AI Advantage | 9 — Risk prediction, gap analysis, behavioral analytics are strong AI use cases |
| Uniqueness | 8 — Most tools are static checklists; AI-driven proactive compliance is differentiated |
| Revenue Potential | 9 — $299–$999/mo per org; enterprise + white-label upsides |
| Demo Value | 9 — Live compliance score, risk timeline, AI insights = impressive demo |
| Build Feasibility | 8 — Modern stack well-suited; AI features achievable with Claude API |
| User Delight | 8 — Compliance officers will love eliminating spreadsheets |

---

## 🚀 Development Phases

---

## Phase 1 — Foundation Hardening ✅ COMPLETE
**Goal:** Make what's already built production-solid before adding features.
**Priority:** Must complete before Phase 2.

### Task 1.1 — Auth Flow Polish ✅ COMPLETE
**Description:** The login page exists but needs complete UX: signup with organization creation, email verification, password reset, and "remember me". Currently only login is wired. Use Supabase Auth email/password + magic link. After signup, redirect user to an onboarding wizard (see Task 1.3). Protect all dashboard routes via `middleware.ts` — unauthenticated requests redirect to `/login`.

**Files:** `src/app/login/page.tsx`, `src/utils/supabase/middleware.ts`, add `src/app/signup/page.tsx`, `src/app/reset-password/page.tsx`

---

### Task 1.2 — Organization Setup on First Login ✅ COMPLETE
**Description:** When a new user logs in for the first time (no `org_members` row exists), detect this in the dashboard layout and redirect to an org-creation page. The user fills in: organization name, type (clinic/hospital/dental/startup), size (1–10, 11–50, 51–200, 200+), and primary contact. This creates a row in `organizations` and `org_members` with role = `owner`. This data feeds the risk assessment questionnaire's smart defaults.

**Files:** `src/app/setup/page.tsx`, `src/services/operations.ts` (add `createOrganization`), `src/app/layout.tsx` (add redirect logic)

---

### Task 1.3 — Onboarding Wizard ✅ COMPLETE
**Description:** A 3-step welcome wizard shown to new organizations: Step 1 — org profile (already collected in 1.2), Step 2 — run initial risk assessment (link to ComplianceCommandCenter with a "Start Assessment" CTA), Step 3 — invite team members. Use a stepper component from shadcn/ui. This increases activation rate — users see a compliance score within 5 minutes of signing up.

**Files:** `src/components/onboarding-wizard.tsx`, `src/app/setup/page.tsx`

---

### Task 1.4 — Global Navigation & Layout ✅ COMPLETE
**Description:** The app currently has individual dashboards but needs a consistent shell: a fixed left sidebar with nav links to all major sections (Dashboard, Security, Operations, Governance, Insights, Scale, Lab), a top header with org name + user avatar + notifications bell, and a breadcrumb bar. Use shadcn/ui `Sheet` for mobile sidebar. Active route should be highlighted. Notification count badge should show unread `calendar_tasks` due today.

**Files:** `src/components/layout/sidebar.tsx`, `src/components/layout/header.tsx`, `src/app/layout.tsx`

---

### Task 1.5 — Skeleton Loading States ✅ COMPLETE
**Description:** Every dashboard currently has no loading state — blank screens appear during Supabase data fetches. Add skeleton loaders for: dashboard cards (pulsing grey boxes), tables (skeleton rows), and forms (skeleton inputs). Use shadcn/ui `Skeleton` component. Each page's `loading.tsx` file in App Router should export a skeleton that mirrors the real layout.

**Files:** Add `loading.tsx` in `src/app/`, `src/app/security/`, `src/app/operations/`, `src/app/governance/`, `src/app/insights/`

---

### Task 1.6 — Error Boundaries & Empty States ✅ COMPLETE
**Description:** Add `error.tsx` to each route for graceful error handling. Add empty state components for when tables/lists have no data — show an icon, message, and a CTA button (e.g., "No vulnerabilities found — Run your first scan"). This prevents confusing blank panels. Use shadcn/ui `Alert` for inline errors.

**Files:** Add `error.tsx` in each route folder, `src/components/ui/empty-state.tsx`

---

### Task 1.7 — Public Marketing Landing Page ✅ COMPLETE
**Description:** Public-facing marketing landing page at `/landing` targeting small-to-medium healthcare practices and HIPAA consultants. Built from the Compliancy Group blueprint analysis. Sections: sticky nav, hero with live dashboard mockup, stats bar, who-it's-for audience cards, 12 core feature grid, 6 AI differentiator features, 3-step how-it-works, competitor comparison table (ComplyCare vs static tools), testimonials, 3-tier pricing, free assessment CTA banner, and footer. All CTAs link to `/signup`. Page is fully public — excluded from `AppGuard` and `AppShell`.

**Key positioning:** "Stop checking boxes. Start preventing breaches." — AI-driven proactive compliance vs the static checklist approach of traditional tools.

**Routing behaviour:** Unauthenticated users visiting any protected route (including `/`) are redirected to `/landing`. Authenticated users with an org go straight to the dashboard. Authenticated users without an org go to `/setup`.

**Files:** `src/app/landing/page.tsx`, `src/components/layout/app-guard.tsx` (add `/landing` to publicRoutes + redirect unauthenticated to `/landing`), `src/components/layout/app-shell.tsx` (add `/landing` to shellExcludedRoutes)

---

## Phase 2 — Employee Training Management ✅ COMPLETE
**Goal:** Build the interactive HIPAA training module system with progress tracking and certificates.
**Blueprint Feature:** #3 (must-have, medium complexity)

### Task 2.1 — Training Module Data Model ✅ COMPLETE
**Description:** The `training_sims` table exists but is minimal. Extend it (via a new migration) to support: `title`, `description`, `module_type` (video/quiz/scenario), `content_json` (array of slides/questions), `estimated_minutes`, `passing_score`, `is_required`, `due_date`. Add a `training_completions` table: `user_id`, `module_id`, `score`, `completed_at`, `certificate_url`, `attempts`. Add an index on `(user_id, module_id)` for fast progress lookups.

**Files:** `supabase/migrations/[timestamp]_training_system.sql`

---

### Task 2.2 — Training Module Library UI ✅ COMPLETE
**Description:** Build a `/training` page showing all available HIPAA training modules as cards. Each card shows: module title, type badge (Quiz/Video/Scenario), estimated time, required/optional badge, due date if set, and completion status (Not Started / In Progress / Completed with score). Clicking a card opens the module player (Task 2.3). Add a progress summary bar at the top: "X of Y required modules completed."

**Files:** `src/app/training/page.tsx`, `src/components/training/module-card.tsx`, `src/hooks/useTraining.ts`, `src/services/training.ts`

---

### Task 2.3 — Interactive Module Player ✅ COMPLETE
**Description:** Build a full-screen module player that handles quiz-type modules. It shows one question at a time with multiple-choice answers, a progress bar (Question 3 of 10), and a timer. On completion, calculate the score. If score >= passing_score, mark as completed and generate a certificate (Task 2.4). If failed, allow retry with a different question order. Store each attempt in `training_completions`. Support scenario-type modules as branching decision trees (JSON-driven).

**Files:** `src/components/training/module-player.tsx`, `src/components/training/quiz-question.tsx`, `src/components/training/scenario-player.tsx`

---

### Task 2.4 — Certificate Generation ✅ COMPLETE
**Description:** On module completion (passing score), generate a PDF certificate using jsPDF. Certificate includes: employee name, module title, completion date, score achieved, organization name, and a unique certificate ID (UUID stored in `training_completions.certificate_url`). The certificate should look professional — use a styled template with the organization logo area and a border design. Store the certificate ID in Supabase so it can be verified via a public URL.

**Files:** `src/lib/certificate-generator.ts`, update `src/components/training/module-player.tsx`

---

### Task 2.5 — Admin Training Dashboard ✅ COMPLETE
**Description:** Inside GovernanceDashboard (or a new `/training/admin` route), show a compliance officer view: a table of all employees with columns for each required module and completion status. Highlight overdue training in red. Add a "Send Reminder" button that triggers a Supabase Edge Function to email employees. Show aggregate stats: overall completion rate, average scores by module, top incomplete modules. This is the view a compliance officer needs for an audit.

**Files:** `src/app/training/admin/page.tsx`, `src/components/training/training-admin-table.tsx`

---

## Phase 3 — Compliance Calendar & Alerts ✅ COMPLETE
**Goal:** Automated reminders for compliance deadlines, policy reviews, training renewals, and risk assessments.
**Blueprint Feature:** #9 (must-have, low complexity)

### Task 3.1 — Calendar Data Model Enhancement ✅ COMPLETE
**Description:** The `calendar_tasks` table exists. Extend it with: `recurrence_rule` (none/daily/weekly/monthly/annually), `notification_days_before` (integer array, e.g., [30, 7, 1]), `task_type` (policy_review/training_renewal/risk_assessment/baa_renewal/vulnerability_scan/custom), `linked_entity_id` (FK to relevant record, polymorphic), `assigned_to` (user_id), `completed_at`. Seed default tasks on org creation: annual risk assessment, quarterly policy reviews, annual employee training renewal.

**Files:** `supabase/migrations/0018_phase3_calendar_enhanced.sql`

---

### Task 3.2 — Compliance Calendar UI ✅ COMPLETE
**Description:** Build a `/calendar` page with a full month/week/day calendar view (use a lightweight calendar library like `react-big-calendar` or build with CSS Grid). Tasks are color-coded by type: blue = assessment, orange = training, red = overdue, green = completed. Clicking a task opens a detail panel with description, assigned user, and action buttons (Mark Complete, Snooze, Reassign). Show an "Upcoming" sidebar with the next 7 days' tasks.

**Files:** `src/app/calendar/page.tsx`, `src/components/calendar/compliance-calendar.tsx`, `src/components/calendar/task-detail-panel.tsx`, `src/services/calendar.ts`, `src/hooks/use-calendar.ts`, `src/app/calendar/loading.tsx`, `src/app/calendar/error.tsx`

---

### Task 3.3 — Automated Alert System ✅ COMPLETE
**Description:** Build a notification system using Supabase Realtime. When a `calendar_task` is due within `notification_days_before`, insert a row into a `notifications` table (user_id, message, link, read_at, created_at). The header bell icon subscribes to this table via Supabase Realtime channel and shows a dropdown of unread notifications. Clicking a notification marks it read and navigates to the relevant page.

**Files:** `src/components/layout/notification-bell.tsx`, `src/hooks/use-notifications.ts`, `supabase/migrations/0019_phase3_notifications.sql`

---

## Phase 4 — Document Repository ✅ COMPLETE
**Goal:** Centralized, searchable storage for policies, compliance documents, and contracts with version control.
**Blueprint Feature:** #10 (must-have, low complexity)

### Task 4.1 — Document Storage with Supabase Storage ✅ COMPLETE
**Description:** The `documents` table exists. Wire it to Supabase Storage buckets. Create a `compliance-documents` bucket with RLS (org members can read, owners/admins can write). Support upload of PDF, DOCX, XLSX, PNG. Store: `file_name`, `file_path` (Supabase Storage path), `file_size`, `mime_type`, `category` (policy/contract/report/evidence/other), `tags` (text array), `version` (integer, default 1), `parent_document_id` (FK to self for versioning), `uploaded_by`, `org_id`. Add full-text search index on `file_name` and `tags`.

**Files:** `supabase/migrations/[timestamp]_documents_enhanced.sql`, `src/services/documents.ts`

---

### Task 4.2 — Document Repository UI ✅ COMPLETE
**Description:** Build a `/documents` page with a file explorer layout. Left panel shows category folders (Policies, Contracts, Reports, Evidence, Other). Right panel shows document grid/list view toggle. Each document card shows: file type icon, name, version badge, upload date, uploader, and tags. Top bar has a search input (searches name + tags), filter by category, and "Upload Document" button. Clicking a document shows a preview panel with download button and version history.

**Files:** `src/app/documents/page.tsx`, `src/components/documents/document-grid.tsx`, `src/components/documents/document-preview.tsx`, `src/hooks/useDocuments.ts`

---

### Task 4.3 — Version Control for Documents ✅ COMPLETE
**Description:** When uploading a document that has the same name as an existing one in the same category, prompt the user: "A document with this name exists. Upload as new version?" If confirmed, set `parent_document_id` to the original and increment `version`. The document detail view shows a Version History tab listing all versions with uploader, date, and download link for each. This gives compliance officers a full paper trail for audits.

**Files:** Update `src/components/documents/document-preview.tsx`, `src/services/documents.ts` (add `uploadNewVersion`)

---

## Phase 5 — Regulatory Change Tracking ✅ COMPLETE
**Goal:** Automated monitoring of HIPAA rule changes with impact assessment shown to users.
**Blueprint Feature:** #19 (important, medium complexity)

### Task 5.1 — Regulatory Updates Feed ✅ COMPLETE
**Description:** The `regulatory_updates` table exists. Build a service that fetches from a curated HIPAA regulatory updates JSON feed (can be mocked with realistic data for demo). Each update has: `title`, `summary`, `effective_date`, `impact_level` (low/medium/high/critical), `affected_areas` (text array, e.g., ["training", "access_control"]), `action_required` (boolean), `source_url`. Show updates in the `SecurityDashboard` as an alerts panel with color-coded impact badges. High/Critical updates trigger a notification (Phase 3 Task 3.3).

**Files:** `src/services/regulatory.ts`, `src/components/security/regulatory-alerts-panel.tsx`, update `SecurityDashboard`

---

### Task 5.2 — Impact Assessment on Org's Policies ✅ COMPLETE
**Description:** When a regulatory update arrives that affects an area (e.g., "training"), cross-reference it with the org's existing policies in `policy_instances`. Show a banner: "New regulation affects 3 of your policies — review required." Link to a diff-style view showing what changed and which policies need updating. Add a "Mark as Reviewed" action that logs to `audit_logs`. This is the intelligence layer that transforms a static policy library into an adaptive system.

**Files:** `src/lib/regulatory-impact.ts`, `src/components/governance/policy-impact-alert.tsx`

---

## Phase 6 — AI-Powered Features ✅ COMPLETE
**Goal:** Implement AI features using Claude API for risk prediction, policy gap analysis, and insights.
**Blueprint Features:** Advanced #1, #2, #3, #9, #13

### Task 6.1 — AI Risk Prediction Engine ✅ COMPLETE
**Description:** Using the organization's assessment answers, incident history, training completion rates, and vulnerability counts, call the Claude API to predict the organization's top 3 compliance risks for the next 90 days. Prompt Claude with structured context (org type, size, current score, recent incidents, open vulnerabilities) and ask it to return JSON with: `risk_title`, `probability` (low/medium/high), `potential_impact`, `recommended_actions[]`. Display this as a "Predicted Risks" card in InsightsDashboard with a 90-day risk radar chart.

**Files:** `src/lib/ai/risk-prediction.ts`, `src/app/api/ai/risk-predict/route.ts`, `src/components/insights/predicted-risks-card.tsx`

---

### Task 6.2 — Smart Policy Gap Analysis ✅ COMPLETE
**Description:** Send the org's current `policy_instances` (names + last_reviewed dates) to Claude API. Claude compares against a complete HIPAA policy requirement checklist and returns a JSON list of missing or outdated policies with: `policy_name`, `hipaa_section`, `gap_type` (missing/outdated/incomplete), `severity` (critical/high/medium), `recommendation`. Display in GovernanceDashboard as a "Policy Gap Report" section. This replaces the static `selectTopGaps()` logic with live AI analysis.

**Files:** `src/lib/ai/policy-gap-analysis.ts`, `src/app/api/ai/policy-gaps/route.ts`, update `GovernanceDashboard`

---

### Task 6.3 — Predictive Breach Cost Calculator ✅ COMPLETE
**Description:** Build an interactive calculator in InsightsDashboard. User inputs: org size, data types handled (PHI/PII/financial), current compliance score, number of unresolved incidents. The app calls Claude API which estimates potential breach cost based on industry data patterns. Returns: `estimated_cost_range`, `cost_drivers[]`, `mitigation_savings` (how much cost reduces with current vs. target compliance score). Display as a financial risk card with a before/after bar chart showing cost reduction from improving compliance score.

**Files:** `src/lib/ai/breach-cost-calculator.ts`, `src/app/api/ai/breach-cost/route.ts`, `src/components/insights/breach-cost-card.tsx`

---

### Task 6.4 — AI Compliance Chatbot ✅ COMPLETE
**Description:** Add a floating chat widget (bottom-right corner) powered by Claude API. It is context-aware: it knows the org's current compliance score, recent incidents, and open risks. Users can ask: "What should I do first to improve my score?", "Explain this HIPAA requirement", "How do I respond to this breach?". Stream responses using Claude's streaming API. Keep a `chat_history` in local state per session. This is the highest demo-value AI feature — show it prominently in demos.

**Files:** `src/components/ai/compliance-chatbot.tsx`, `src/app/api/ai/chat/route.ts`, `src/hooks/useAIChat.ts`

---

### Task 6.5 — Advanced Insights Dashboard Rebuild ✅ COMPLETE
**Description:** Rebuild InsightsDashboard to consolidate all AI outputs: (1) Compliance trend chart (last 6 months of scores), (2) Predicted risks panel (Task 6.1), (3) Breach cost estimator card (Task 6.3), (4) Training effectiveness analysis (completion rate vs. incident rate correlation), (5) Benchmarking radar chart (your org vs. industry average across 6 HIPAA domains). Use `recharts` or `chart.js` for all visualizations. Make this page the "wow factor" page for demos.

**Files:** `src/app/insights/page.tsx`, `src/components/insights/` (multiple chart components), `src/lib/ai/insights-aggregator.ts`

---

## Phase 7 — Security Enhancements ✅ COMPLETE
**Goal:** Strengthen the security dashboard with actionable scanning, access control, and IoT management.
**Blueprint Features:** #7, #8, #10 Advanced

### Task 7.1 — Vulnerability Scanner UI Enhancement ✅ COMPLETE
**Description:** The vulnerability table exists but needs to become a full scanning workflow. Add a "Run Scan" button that triggers a simulated scan (generate realistic vulnerability data via a seeded algorithm based on org profile). Show a scanning progress animation. After scan, display: total vulnerabilities by severity (critical/high/medium/low), a remediation priority queue sorted by risk score, and a "Fix Guide" drawer for each vulnerability with step-by-step remediation instructions. Track time-to-remediation per vulnerability.

**Files:** `src/components/security/vulnerability-scanner.tsx`, `src/lib/vulnerability-simulator.ts`, `src/services/security.ts` (enhance)

---

### Task 7.2 — Access Control Matrix ✅ COMPLETE
**Description:** Build an access control review interface in SecurityDashboard. Show a matrix table: rows = users, columns = data categories (PHI records, billing, admin settings, reports). Each cell shows: has access (green check) or no access (grey dash). Compliance officers can review and flag "excessive access" (a user has more access than their role requires). Add a "Minimum Necessary Access" score per user based on their role vs. actual permissions. Log all access review actions to `audit_logs`.

**Files:** `src/components/security/access-control-matrix.tsx`, `src/services/access-control.ts`, `src/hooks/useAccessControl.ts`

---

### Task 7.3 — IoT Device Inventory ✅ COMPLETE
**Description:** The `iot_devices` table exists. Build a device inventory UI: a card grid showing each device with name, type (infusion pump / imaging device / tablet / wearable), IP address, last seen, firmware version, and compliance status (compliant/at-risk/non-compliant). Add a device registration form. Show a "Device Risk Score" per device based on: firmware age, encryption status, network exposure. Flag devices that handle PHI and are unencrypted. This is relevant for modern healthcare orgs using connected medical devices.

**Files:** `src/components/security/iot-device-inventory.tsx`, `src/app/security/iot/page.tsx`, update `SecurityDashboard`

---

## Phase 8 — Compliance Reporting & Export ✅ COMPLETE
**Goal:** Executive-level reporting, OCR penalty tracking, and audit-ready export packages.
**Blueprint Feature:** #13, #14 (must-have/important)

### Task 8.1 — Compliance Reporting Dashboard ✅ COMPLETE
**Description:** Build a `/reports` page for compliance officers and executives. Show: (1) Overall compliance score trend (line chart, last 12 months), (2) HIPAA domain breakdown (donut chart: Administrative/Physical/Technical safeguards), (3) Open risk summary table with aging data, (4) Training completion rate by department, (5) Incident summary (open/resolved/total), (6) Vendor compliance status overview. Add a date range filter. This page should be printable — add a "Print Report" button that uses `window.print()` with a clean CSS print stylesheet.

**Files:** `src/app/reports/page.tsx`, `src/components/reports/` (chart components), `src/services/reports.ts`

---

### Task 8.2 — Audit Export Package ✅ COMPLETE
**Description:** Enhance the existing PDF export (currently in `ReportPanel`) to generate a complete audit package. The package includes multiple sections: Executive Summary, Compliance Score History, Policy Inventory with status, Risk Register, Training Completion Records, Incident Log, Vendor Agreements list, Evidence Index. Generate this as a multi-page PDF with a table of contents, page numbers, and organization logo. This is the artifact a compliance officer hands to an auditor — make it look professional.

**Files:** `src/lib/audit-package-generator.ts`, update `src/components/ReportPanel.tsx`

---

### Task 8.3 — OCR Penalty Database Panel ✅ COMPLETE
**Description:** Add an "OCR Enforcement" section to the SecurityDashboard. Show a feed of recent HIPAA enforcement actions from HHS OCR (mock data with realistic entries for demo). Each entry shows: organization name, violation type, penalty amount, settlement date, and a brief description. Below the feed, show: "Organizations similar to yours have faced penalties for: [top 3 violation types]." This creates urgency and demonstrates real-world risk. Data can be seeded/mocked with publicly available OCR enforcement cases.

**Files:** `src/components/security/ocr-penalty-panel.tsx`, `src/services/ocr-database.ts`

---

## Phase 9 — Multi-Organization & Scale ✅ COMPLETE
**Goal:** Enable consultants and enterprise clients to manage multiple organizations from one account.
**Blueprint Feature:** #15 (important, medium complexity)

### Task 9.1 — Organization Switcher ✅ COMPLETE
**Description:** Users who belong to multiple organizations (consultants) need a fast way to switch context. Add an org switcher dropdown in the header (next to org name). It shows all orgs the user belongs to with their compliance score badge. Clicking switches the active org — all data on the page refreshes to show the selected org's data. The active org is stored in a cookie/localStorage key and read by all Supabase queries. This is already partially supported by the `org_members` table and RLS.

**Files:** `src/components/layout/org-switcher.tsx`, `src/hooks/useActiveOrg.ts`, update all service functions to accept `orgId`

---

### Task 9.2 — Consultant Portfolio Dashboard ✅ COMPLETE
**Description:** For users managing 3+ organizations, add a `/portfolio` page that shows all managed orgs in a table: org name, compliance score, open risks count, overdue training count, active incidents, and last assessment date. Color-code compliance scores (green/yellow/red). Add a sort/filter by score or risk level. This is the "command center" for a healthcare consultant managing multiple clients — a key enterprise selling point.

**Files:** `src/app/portfolio/page.tsx`, `src/components/scale/portfolio-table.tsx`, update `ScaleDashboard`

---

### Task 9.3 — Member Invitation & Role Management ✅ COMPLETE
**Description:** The `/api/members/invite` endpoint exists but the UI is missing. Build a "Team" settings page at `/settings/team` that shows all org members with their roles (owner/admin/member/auditor). Add an "Invite Member" button that opens a modal: enter email + select role. Owners can change roles and remove members. Auditors have read-only access (enforced by RLS). Show pending invitations with a resend/cancel option. Log all role changes to `audit_logs`.

**Files:** `src/app/settings/team/page.tsx`, `src/components/settings/team-management.tsx`

---

## Phase 10 — Polish, Testing & Deployment
**Goal:** Responsive design, comprehensive testing, performance optimization, and production deployment.

### Task 10.1 — Mobile Responsiveness ✅ COMPLETE
**Description:** Audit all pages for mobile breakpoints (375px, 768px). The sidebar should collapse to a hamburger menu on mobile using shadcn/ui `Sheet`. Dashboard cards should stack vertically. Tables should scroll horizontally or collapse to card view on small screens. The compliance chatbot (Task 6.4) should be full-screen on mobile. Test on iPhone 14 viewport in Chrome DevTools. Priority pages for mobile: Dashboard, Calendar, Training, Incidents (compliance officers check these on-the-go).

**Files:** Update `src/components/layout/sidebar.tsx` and all dashboard components

---

### Task 10.2 — Performance Optimization ✅ COMPLETE
**Description:** (1) Convert data-heavy dashboard sections to React Server Components where possible. (2) Add `loading.tsx` skeleton states (Phase 1 Task 1.5). (3) Memoize expensive calculations in `compliance-logic.ts` using `useMemo`. (4) Add pagination to all tables with more than 20 rows (vulnerabilities, audit logs, documents). (5) Implement Supabase query optimizations: select only needed columns, add `.limit()` to all list queries. (6) Lazy-load heavy components (charts, PDF generator) with `next/dynamic`.

**Files:** Update services, hooks, and page components throughout

---

### Task 10.3 — Vitest Test Suite ✅ COMPLETE
**Description:** Expand the existing test suite. Write tests for: (1) All functions in `compliance-logic.ts` (currently partially tested), (2) All functions in `insights-logic.ts`, (3) AI prompt builders in `src/lib/ai/` — test that prompts contain required context fields, (4) Certificate generator — test output PDF metadata, (5) Regulatory impact logic — test cross-referencing logic. Target 80% coverage on `src/lib/`. Run `npm run test:coverage` to verify.

**Files:** Add test files in `src/lib/__tests__/`

---

### Task 10.4 — Environment & Docker Production Config ✅ COMPLETE
**Description:** Finalize Docker setup for production. Update `docker/Dockerfile` for a multi-stage production build: `deps` stage (install node_modules), `build` stage (next build), `runner` stage (minimal alpine image with only the built output). Verify `docker-compose.yml` works for local development with hot reload. Create/Update a `.env.example` file documenting all required environment variables. Add a health check endpoint at `/api/health` that returns `{ status: "ok", timestamp: ISO }`.

**Files:** `docker/Dockerfile`, `docker-compose.yml`, `src/app/api/health/route.ts`

---

### Task 10.5 — Vercel Deployment
**Description:** Deploy to Vercel. Steps: (1) Push to GitHub, (2) deploy to vercel using vercel cli (3) Set environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` (for AI features), (4) Run `supabase db push` to apply all migrations to the production Supabase project, (5) Verify all routes load, auth works, and AI endpoints respond. Set up a custom domain if available. Enable Vercel Analytics for monitoring.

**Files:** `.env.example`, verify `next.config.ts`

---

## 🔁 Post-Launch — Future Enhancements

These are from the blueprint's "Advanced/Differentiating Features" and "Innovative Ideas" sections. Implement after the core product is stable.

| Feature | Description | Effort |
|---------|-------------|--------|
| Blockchain Audit Trail | Replace `audit_chain_entries` simulation with actual on-chain hash recording (e.g., Polygon for low gas fees) | High |
| NLP Document Analysis | Use Claude API to parse uploaded contracts/policies and flag HIPAA compliance gaps automatically | Medium |
| Gamified Training | Add points, badges, leaderboard to training completion. Integrate with `training_completions` score data | Medium |
| Automated Penetration Testing | Integrate with a pentest API (e.g., Nuclei templates) and show results in SecurityDashboard | High |
| Voice Compliance Assistant | Voice interface for hands-free incident reporting using Web Speech API + Claude | High |
| Wearable Device Integration | Monitor staff compliance behaviors via wearable data feeds (future healthcare IoT) | Very High |
| White-label Platform | Allow consultants to brand the platform with their own logo/colors via org-level theme settings | Medium |
| EHR Integration APIs | Connect with Epic, Cerner via FHIR APIs to pull real PHI access logs | Very High |

---

## 📋 Phase Summary

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| 0 | Evaluation | ✅ Score 87/100 — Approved |
| 1 | Foundation | ✅ Auth polish, navigation shell, skeleton loaders, public landing page |
| 2 | Training | ✅ Interactive HIPAA training + certificates |
| 3 | Calendar | ✅ Compliance calendar + real-time alerts |
| 4 | Documents | ✅ Version-controlled document repository |
| 5 | Regulatory | ✅ Live regulation tracking + impact assessment |
| 6 | AI Features | ✅ Risk prediction, gap analysis, chatbot, breach cost |
| 7 | Security | ✅ Enhanced scanning, access matrix, IoT inventory |
| 8 | Reporting | ✅ Executive reports, audit export, OCR penalties |
| 9 | Scale | ✅ Multi-org switcher, consultant portfolio, team mgmt |
| 10 | Polish | Mobile, performance, tests, Docker, Vercel deploy |

---
