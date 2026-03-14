# ComplyCare — Browser User Guide

A practical walkthrough of every page in the app and how to use it in a browser.

---

## Getting Started

### 1. Landing Page — `/landing`

Visit `/landing` to read the product overview, feature list, pricing tiers, and comparison with traditional tools. Use the sticky nav to jump to **Features**, **How It Works**, **Compare**, and **Pricing** sections. Click **Free assessment** or **Start free trial** to proceed to sign-up.

---

## Authentication

### 2. Sign Up — `/signup`

Create a new account with your email and password. After confirming your email you are redirected to the setup wizard.

### 3. Log In — `/login`

Enter your credentials. Successful login lands you on the main Dashboard (`/`).

### 4. Reset Password — `/reset-password`

Enter your email to receive a reset link. Use `/update-password` from the link in your email to set a new password.

### 5. Organization Setup — `/setup`

First-time users see a multi-step wizard:

- Name your organization and select its type (clinic, dental, startup, etc.)
- Answer 12 guided questions about security controls and staff size
- The wizard calculates your initial **Compliance Score** and **Risk Score**
- Complete setup to unlock the full workspace

---

## Main Navigation

After login, a **sidebar** (desktop) or **hamburger drawer** (mobile) lists every section. The active page is highlighted. On mobile tap the menu icon top-left, then tap ✕ to close.

---

## Core Pages

### 6. Dashboard — `/`

Your compliance command center. Shows:

- **Compliance Score** (0–100), **Risk Score**, and **Peer Benchmark percentile**
- **HIPAA Domain Coverage** bars for Administrative, Physical, Technical, and Organizational safeguards
- **AI Priority Alerts** (red) — urgent risks that need action
- **Due This Week** (amber) — upcoming BAA renewals, overdue reviews, pending training
- **Recent Wins** (green) — completed tasks and improvements
- **Notifications bell** (top-right) — click to see all recent activity

### 7. Security — `/security`

Three sub-areas:

**Vulnerability Scanner** — lists open vulnerabilities by severity (critical / high / medium / low). Each row shows:

- Asset name, description, and severity badge
- Days since discovery
- Remediation owner and status

Use the **Scan Now** button to simulate a new scan. Filter by severity using the dropdown. The summary grid at the top tracks total, critical, high, and open counts.

**Access Control** — review which users have access to PHI systems; flag over-privileged accounts.

**IoT Devices** (`/security/iot`) — track medical IoT devices, their network status, and patch levels.

### 8. Operations — `/operations`

Covers day-to-day operational compliance:

- **Incidents** — log and track breach/security incidents through guided response steps
- **Business Associate Agreements (BAAs)** — list all BAAs with expiry dates and renewal status; filter by status
- **Vendor Risk** — assess and score third-party vendors; track outstanding assessments

Use pagination controls (Previous / Next) at the bottom of each list to navigate large data sets.

### 9. Governance — `/governance`

Policy and risk management:

- **Policy Library** — browse HIPAA policy templates; click a policy to view/edit; upload evidence attachments
- **Risk Register** — view identified risks, their severity scores, assigned owners, and mitigation progress; add new risks with the **+ Add Risk** button

### 10. Training — `/training`

Employee training management:

- Browse available HIPAA training modules (e.g., PHI Handling, Password Security, Breach Reporting)
- Click a module card to enter the lesson at `/training/[moduleId]`; complete each section and pass the quiz to earn a **certificate**
- Track your own completion percentage on each card

**Admin view** (`/training/admin`) — visible to owners/admins only:

- See completion rates per module across all staff
- Re-assign incomplete modules; download certificate records

### 11. Documents — `/documents`

Centralized compliance document repository:

- Upload new files with **Upload Document**
- Browse by category (Policies, Contracts, Evidence, Other)
- Search by filename
- Click any document to preview or download
- Version history is available on each document

### 12. Insights — `/insights`

AI-powered analytics:

- **Compliance Score Trend** chart — see how your score has moved over time
- **Domain Breakdown** donut chart — spot the weakest HIPAA safeguard area
- **AI Risk Prediction** — the top 3 risks predicted for the next 90 days with probability and impact ratings
- **Policy Gap Analysis** — list of policies missing coverage against the full HIPAA checklist
- **Breach Cost Estimate** — projected financial exposure based on your data volume and current posture
- **Peer Benchmark** — your percentile rank vs. similar organizations

### 13. Reports — `/reports`

Generate and download compliance reports:

- Select **Report Type** (Executive Summary, Risk Assessment, Audit Trail, Training Compliance)
- Set **Date Range** using the start/end date pickers
- Click **Generate Report** — the report renders on screen
- Download as PDF with the **Export** button
- Previously generated reports appear in the history list below

### 14. Scale — `/scale`

Growth-tier features for expanding organizations:

- Manage multiple locations or departments under one account
- View aggregated compliance scores per location
- Assign compliance owners per location

### 15. Portfolio — `/portfolio`

For HIPAA consultants managing multiple client organizations:

- See every client organization as a card with live compliance score, risk level, and alert count
- Click a card to drill into that org's workspace
- Use the **+ Add Organization** button to onboard a new client

### 16. Team Settings — `/settings/team`

User and role management:

- See all current team members with their roles (Owner / Admin / Member / Auditor)
- Click **Invite Member** — enter an email address and choose a role; an invite link is sent
- Remove members using the action menu on each row
- Role permissions: **Owner** = full access; **Admin** = manage users and settings; **Member** = use all features; **Auditor** = read-only access

### 17. Compliance Calendar — `/calendar`

Upcoming compliance tasks and deadlines:

- Month/week view of all scheduled activities (policy reviews, BAA renewals, training deadlines, audit dates)
- Click any event to see its detail panel — reassign, mark complete, or add notes
- Use the **+ Add Task** button to schedule custom compliance activities

### 18. Lab — `/lab`

Experimental AI features:

- **AI Compliance Chatbot** — type any HIPAA question in the chat window and receive instant guidance (requires `ANTHROPIC_API_KEY` in your deployment environment; returns a notice if not configured)
- **NLP Contract Analyzer** — paste a vendor contract and receive an AI review flagging missing HIPAA clauses

---

## Global Controls

| Control | Location | What it does |
|---|---|---|
| Notification bell | Top-right header | Opens notification drawer with recent alerts |
| Org switcher | Top-right header | Switch between organizations (Enterprise/Portfolio users) |
| User avatar menu | Top-right header | Profile, account settings, sign out |
| Sidebar nav | Left panel (desktop) | Jump to any section |
| Hamburger icon | Top-left (mobile) | Opens drawer nav; ✕ closes it |

---

## Quick Browser Test Checklist

Use this list to verify every section is working after a fresh deployment:

1. Open `/landing` — confirm marketing page loads
2. Open `/signup` — create a test account
3. Complete `/setup` wizard — verify compliance score appears
4. Visit `/` — Dashboard loads with score cards and alerts
5. Visit `/security` — vulnerability list renders with severity badges
6. Visit `/security/iot` — IoT device table loads
7. Visit `/operations` — incidents and BAA list with pagination
8. Visit `/governance` — policy library and risk register
9. Visit `/training` — module cards; click one to enter a lesson
10. Visit `/training/admin` — admin completion table (owner/admin role required)
11. Visit `/documents` — upload a test file and confirm it appears
12. Visit `/insights` — trend chart, AI predictions, and gap analysis load
13. Visit `/reports` — generate an Executive Summary report
14. Visit `/scale` — location compliance overview
15. Visit `/portfolio` — org cards (if multiple orgs exist)
16. Visit `/settings/team` — invite a member with Auditor role
17. Visit `/calendar` — events display on the month view
18. Visit `/lab` — test the AI chatbot with a HIPAA question
19. Open `/api/health` in the browser — should return `{"status":"ok","timestamp":"..."}`
