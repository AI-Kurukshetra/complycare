import Link from "next/link"

// ─── Data ─────────────────────────────────────────────────────────────────────

const coreFeatures = [
  {
    icon: "📋",
    title: "HIPAA Risk Assessment Generator",
    description:
      "Automated questionnaires with smart recommendations based on your organization type and size. Get a live compliance score in under 10 minutes.",
    tag: "Must-have",
  },
  {
    icon: "📄",
    title: "Policy Template Library",
    description:
      "Comprehensive, customizable HIPAA policy templates that auto-update with regulatory changes — no manual tracking required.",
    tag: "Must-have",
  },
  {
    icon: "🎓",
    title: "Employee Training Management",
    description:
      "Interactive HIPAA training modules with progress tracking, quiz scoring, and auto-generated certificates for every staff member.",
    tag: "Must-have",
  },
  {
    icon: "🤝",
    title: "BAA Tracking & Renewal Alerts",
    description:
      "Centralized Business Associate Agreement management with automated renewal alerts and compliance verification.",
    tag: "Must-have",
  },
  {
    icon: "🚨",
    title: "Incident Response Workflow",
    description:
      "Guided breach response procedures with automated documentation, step tracking, and OCR-ready reporting templates.",
    tag: "Must-have",
  },
  {
    icon: "🔗",
    title: "Audit Trail Management",
    description:
      "Comprehensive logging of all compliance activities with blockchain-style immutable entries for enhanced audit defensibility.",
    tag: "Must-have",
  },
  {
    icon: "🔍",
    title: "Vulnerability Scanning Dashboard",
    description:
      "Track open vulnerabilities by severity, assign remediation owners, and monitor time-to-resolution across your infrastructure.",
    tag: "Must-have",
  },
  {
    icon: "🔐",
    title: "Access Control Management",
    description:
      "User permission tracking and access review workflows ensuring minimum necessary access across all PHI systems.",
    tag: "Must-have",
  },
  {
    icon: "📅",
    title: "Compliance Calendar & Alerts",
    description:
      "Automated reminders for policy reviews, training renewals, BAA expirations, and required compliance activities.",
    tag: "Must-have",
  },
  {
    icon: "🗂️",
    title: "Documentation Repository",
    description:
      "Centralized, searchable storage for all compliance documents with full version control and audit-ready retrieval.",
    tag: "Must-have",
  },
  {
    icon: "⚠️",
    title: "Risk Register & Mitigation Tracking",
    description:
      "Comprehensive risk identification, severity scoring, mitigation planning, and progress monitoring in one view.",
    tag: "Must-have",
  },
  {
    icon: "🏢",
    title: "Vendor Risk Assessment",
    description:
      "Standardized vendor evaluation forms, ongoing risk monitoring, and BAA status tracking across all business associates.",
    tag: "Must-have",
  },
]

const aiFeatures = [
  {
    icon: "🤖",
    title: "AI Risk Prediction",
    description:
      "Predicts your top compliance risks for the next 90 days based on org patterns, incident history, and industry trends.",
  },
  {
    icon: "🧠",
    title: "Smart Policy Gap Analysis",
    description:
      "AI cross-references your policies against the full HIPAA checklist and surfaces missing or outdated coverage instantly.",
  },
  {
    icon: "💬",
    title: "Compliance Chatbot",
    description:
      "Ask any HIPAA question and get instant, context-aware guidance powered by Claude AI — available 24/7.",
  },
  {
    icon: "💰",
    title: "Predictive Breach Cost Calculator",
    description:
      "Estimates your potential breach exposure based on record count, sensitivity, and current compliance posture.",
  },
  {
    icon: "📊",
    title: "Advanced Compliance Scoring",
    description:
      "Dynamic score with peer benchmarking — see exactly how you rank against similar healthcare organizations.",
  },
  {
    icon: "📝",
    title: "NLP Contract Analysis",
    description:
      "Paste any vendor contract and AI automatically flags missing HIPAA clauses and compliance gaps.",
  },
]

const comparisonRows = [
  { feature: "HIPAA Risk Assessment", them: true, us: true },
  { feature: "Policy Template Library", them: true, us: true },
  { feature: "Employee Training", them: true, us: true },
  { feature: "BAA Tracking", them: true, us: true },
  { feature: "Live Compliance Score", them: false, us: true },
  { feature: "AI Risk Prediction", them: false, us: true },
  { feature: "Smart Policy Gap Analysis", them: false, us: true },
  { feature: "Predictive Breach Cost", them: false, us: true },
  { feature: "AI Compliance Chatbot", them: false, us: true },
  { feature: "Behavioral Anomaly Detection", them: false, us: true },
  { feature: "Blockchain Audit Trail", them: false, us: true },
  { feature: "Regulatory Change Auto-Tracking", them: false, us: true },
]

const steps = [
  {
    number: "01",
    title: "Run your free risk assessment",
    description:
      "Answer 12 guided questions about your security controls, training status, and vendor landscape. Our engine instantly calculates your compliance score and risk level.",
    cta: "Takes under 10 minutes",
  },
  {
    number: "02",
    title: "Get AI-powered action plan",
    description:
      "AI identifies your exact policy gaps, predicts your top 3 risks, benchmarks you against similar organizations, and surfaces the highest-priority actions to take first.",
    cta: "No compliance expertise needed",
  },
  {
    number: "03",
    title: "Stay audit-ready year-round",
    description:
      "Automated alerts, continuous monitoring, and a one-click audit packet mean you're never scrambling before an OCR audit again.",
    cta: "One-click audit export",
  },
]

const testimonials = [
  {
    quote:
      "We switched from a competitor's static checklist system to ComplyCare. The AI gap analysis found three missing policies in our first session — policies we'd been non-compliant on for over a year.",
    name: "Sarah M.",
    role: "Privacy & Security Officer",
    org: "Regional Medical Group, TX",
    initials: "SM",
    metric: "3 gaps found in session 1",
  },
  {
    quote:
      "The compliance score and risk timeline finally gave our board something concrete to act on. No more 'we think we're compliant' — we have a live number with drill-down evidence.",
    name: "James T.",
    role: "IT Compliance Manager",
    org: "Midwest Behavioral Health",
    initials: "JT",
    metric: "Score improved 22pts in 60 days",
  },
  {
    quote:
      "As a HIPAA consultant managing 12 client organizations, the portfolio dashboard is a game-changer. I can see every client's live compliance score and flag issues before they become problems.",
    name: "Dana R.",
    role: "HIPAA Consultant",
    org: "ClearPath Compliance LLC",
    initials: "DR",
    metric: "12 orgs managed from one view",
  },
]

const pricing = [
  {
    tier: "Starter",
    price: "$299",
    per: "/mo",
    description: "For small clinics getting compliant for the first time.",
    highlight: false,
    features: [
      "Up to 25 staff members",
      "Risk assessment & live scoring",
      "Policy template library",
      "Evidence uploader",
      "Compliance calendar & alerts",
      "PDF audit export",
      "Email support",
    ],
  },
  {
    tier: "Professional",
    price: "$699",
    per: "/mo",
    description: "For growing practices that need AI and full compliance coverage.",
    highlight: true,
    badge: "Most popular",
    features: [
      "Up to 200 staff members",
      "Everything in Starter",
      "AI risk prediction & gap analysis",
      "Employee training + certificates",
      "Vendor & BAA management",
      "Incident response workflows",
      "Vulnerability tracking dashboard",
      "OCR penalty database feed",
      "Priority support",
    ],
  },
  {
    tier: "Enterprise",
    price: "$999",
    per: "/mo",
    description: "For health systems and compliance consultants managing multiple orgs.",
    highlight: false,
    features: [
      "Unlimited staff & organizations",
      "Everything in Professional",
      "Consultant portfolio dashboard",
      "Multi-org switcher",
      "AI compliance chatbot",
      "Regulatory change auto-tracking",
      "Custom branding / white-label",
      "Dedicated account manager",
      "SLA guarantee",
    ],
  },
]

const stats = [
  { value: "$1.9M", label: "Average HIPAA fine per year" },
  { value: "97%", label: "Of breaches are preventable" },
  { value: "10 min", label: "To your first compliance score" },
  { value: "230K+", label: "US healthcare orgs at risk" },
]

const targetAudiences = [
  {
    icon: "🏥",
    title: "Small & Mid-Size Clinics",
    description:
      "You have compliance obligations but no dedicated IT security team. ComplyCare is your automated compliance officer.",
  },
  {
    icon: "🦷",
    title: "Dental & Specialty Practices",
    description:
      "From dental to behavioral health — our industry-specific assessment tailors recommendations to your practice type.",
  },
  {
    icon: "👔",
    title: "HIPAA Consultants",
    description:
      "Manage all your clients from one portfolio dashboard. Deliver live compliance scores instead of static spreadsheets.",
  },
  {
    icon: "🏗️",
    title: "Healthcare Startups",
    description:
      "Build compliance in from day one. ComplyCare grows with you from seed-stage to enterprise without changing tools.",
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">

      {/* ── Sticky Nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-sm font-bold text-white">
              C
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Comply<span className="text-cyan-600">Care</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Compare", href: "#compare" },
              { label: "Pricing", href: "#pricing" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 md:block"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-cyan-700"
            >
              Free assessment
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 px-6 pb-24 pt-20 text-white md:pb-32 md:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(8,145,178,0.3),transparent)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />

        <div className="relative mx-auto max-w-6xl">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              AI-Powered HIPAA Compliance Platform
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-center text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Stop checking boxes.{" "}
            <span className="text-cyan-400">Start preventing breaches.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-slate-400">
            ComplyCare replaces static compliance checklists with an AI-driven platform that
            predicts risks, closes policy gaps, and keeps your organization audit-ready
            365 days a year.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-colors hover:bg-cyan-400"
            >
              Get free risk assessment
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              See how it works
            </a>
          </div>
          <p className="mt-3 text-center text-xs text-slate-600">
            No credit card · Setup in 10 minutes · Used by 500+ healthcare organizations
          </p>

          {/* Dashboard mockup */}
          <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
            {/* Mockup top bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/60" />
                <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
              </div>
              <p className="text-xs text-slate-500">ComplyCare — Compliance Command Center</p>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                ● Live
              </span>
            </div>

            <div className="p-6">
              {/* Score cards */}
              <div className="grid grid-cols-3 gap-3 md:grid-cols-3">
                {[
                  { label: "Compliance Score", value: "78", sub: "out of 100", color: "text-white" },
                  { label: "Risk Score", value: "22", sub: "lower is better", color: "text-rose-400" },
                  { label: "Peer Benchmark", value: "84th", sub: "percentile", color: "text-cyan-400" },
                ].map((card) => (
                  <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">{card.label}</p>
                    <p className={`mt-1 text-3xl font-semibold ${card.color}`}>{card.value}</p>
                    <p className="text-xs text-slate-600">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* HIPAA domain bars */}
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    HIPAA Domain Coverage
                  </p>
                  {[
                    { label: "Administrative Safeguards", pct: 82 },
                    { label: "Physical Safeguards", pct: 90 },
                    { label: "Technical Safeguards", pct: 65 },
                    { label: "Organizational Requirements", pct: 74 },
                  ].map((item) => (
                    <div key={item.label} className="mb-2">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>{item.label}</span>
                        <span className={item.pct < 70 ? "text-rose-400" : "text-slate-400"}>
                          {item.pct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10">
                        <div
                          className={`h-1.5 rounded-full ${item.pct < 70 ? "bg-rose-500" : "bg-cyan-500"}`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                    <p className="text-xs font-semibold text-rose-400">🤖 AI Priority Alert</p>
                    <p className="mt-1 text-xs text-rose-200">
                      Technical safeguards score dropped 8pts. 3 unpatched vulnerabilities flagged
                      on EHR server. Predicted breach risk: High.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                    <p className="text-xs font-semibold text-amber-400">📅 Due This Week</p>
                    <p className="mt-1 text-xs text-amber-200">
                      2 BAA renewals expire in 7 days · Quarterly access review overdue ·
                      5 staff training completions pending
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-xs font-semibold text-emerald-400">✅ Recent Wins</p>
                    <p className="mt-1 text-xs text-emerald-200">
                      Incident response policy updated · 12 staff completed training ·
                      Vendor assessment for CloudBilling saved
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-semibold text-cyan-600">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who it's for ───────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">
              Built for healthcare
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Compliance automation for every type of practice.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500">
              Whether you&apos;re a solo practitioner or a multi-location system, ComplyCare
              adapts to your organization type and size from day one.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {targetAudiences.map((audience) => (
              <div
                key={audience.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="text-3xl">{audience.icon}</span>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{audience.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Features ──────────────────────────────────────────────────── */}
      <section id="features" className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Complete coverage
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Every HIPAA requirement. One platform.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              12 must-have compliance modules covering every Administrative, Physical, and Technical
              safeguard in the HIPAA Security Rule.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-cyan-500/30 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs font-medium text-cyan-400">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Features ────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">
                The ComplyCare difference
              </p>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                AI that predicts problems{" "}
                <span className="text-cyan-600">before they become violations.</span>
              </h2>
              <p className="mt-4 text-slate-500">
                Traditional compliance tools tell you what happened. ComplyCare&apos;s AI engine
                tells you what&apos;s about to happen — giving your team time to act before an OCR
                investigator shows up.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-block rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-700"
              >
                Try AI features free
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {aiFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">
              Simple process
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Audit-ready in 3 steps.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-7 hidden h-px w-1/2 translate-x-full bg-slate-300 md:block" />
                )}
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-600 text-xl font-bold text-white shadow-lg shadow-cyan-600/20">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.description}</p>
                <p className="mt-3 text-xs font-semibold text-cyan-600">→ {step.cta}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="inline-block rounded-xl bg-cyan-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition-colors hover:bg-cyan-700"
            >
              Start your free assessment →
            </Link>
            <p className="mt-2 text-xs text-slate-500">No credit card · Takes 10 minutes</p>
          </div>
        </div>
      </section>

      {/* ── Comparison ─────────────────────────────────────────────────────── */}
      <section id="compare" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">
              How we compare
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Beyond static checklists.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500">
              Traditional compliance tools focus on documentation and basic training. ComplyCare
              layers AI-driven intelligence on top of every core feature.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
              <p className="text-sm font-semibold text-slate-900">Feature</p>
              <p className="text-center text-sm font-medium text-slate-500">Traditional tools</p>
              <p className="text-center text-sm font-semibold text-cyan-700">ComplyCare</p>
            </div>
            {comparisonRows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 items-center px-6 py-3.5 ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                <p className="text-sm text-slate-700">{row.feature}</p>
                <div className="flex justify-center">
                  {row.them ? (
                    <span className="text-base text-slate-400">✓</span>
                  ) : (
                    <span className="text-base text-slate-200">✕</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {row.us ? (
                    <span className="text-base text-cyan-600">✓</span>
                  ) : (
                    <span className="text-base text-slate-200">✕</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Customer stories
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Real compliance officers. Real results.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div>
                  <div className="mb-4 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                    {t.metric}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">
                      {t.role} · {t.org}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">
              Transparent pricing
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Plans that scale with your organization.
            </h2>
            <p className="mt-4 text-slate-500">
              All plans include a 14-day free trial and a free initial risk assessment.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.tier}
                className={`relative flex flex-col rounded-3xl border p-6 ${
                  plan.highlight
                    ? "border-cyan-500 bg-slate-950 text-white shadow-2xl shadow-cyan-500/10"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-xs font-bold text-white shadow">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <p className={`text-sm font-bold uppercase tracking-wide ${plan.highlight ? "text-cyan-400" : "text-slate-700"}`}>
                    {plan.tier}
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-4xl font-semibold ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? "text-slate-500" : "text-slate-400"}`}>
                      {plan.per}
                    </span>
                  </div>
                  <p className={`mt-2 text-xs leading-relaxed ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="mb-8 flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <span className="mt-px text-cyan-500">✓</span>
                      <span className={plan.highlight ? "text-slate-300" : "text-slate-600"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link
                    href="/signup"
                    className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? "bg-cyan-500 text-white hover:bg-cyan-400"
                        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Need a custom plan for a large health system or white-label solution?{" "}
            <a href="mailto:sales@complycare.io" className="font-medium text-cyan-600 hover:underline">
              Talk to sales →
            </a>
          </p>
        </div>
      </section>

      {/* ── Free Assessment CTA ────────────────────────────────────────────── */}
      <section className="bg-cyan-600 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center text-white">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
            Free lead magnet offer
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">
            Get your free HIPAA risk assessment.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cyan-100">
            Complete our 12-question assessment and receive a personalized compliance score,
            identified policy gaps, and a prioritized action plan — completely free, no credit card
            required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-cyan-700 shadow-lg transition-colors hover:bg-cyan-50"
            >
              Run my free assessment
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-xs text-cyan-200">
            Takes 10 minutes · Instant results · No sales call required
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 text-xs font-bold text-white">
                  C
                </div>
                <p className="text-lg font-semibold">
                  Comply<span className="text-cyan-600">Care</span>
                </p>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500">
                AI-driven HIPAA compliance automation for small and mid-size healthcare
                organizations. Beyond checkbox compliance.
              </p>
              <p className="mt-4 text-xs text-slate-400">
                Domain: Healthcare · Category: Healthcare Cybersecurity & Compliance
              </p>
            </div>

            {[
              {
                heading: "Product",
                links: ["Risk Assessment", "Policy Library", "Employee Training", "Vendor Management", "AI Insights", "Pricing"],
              },
              {
                heading: "Company",
                links: ["About", "Blog", "Careers", "Press Kit"],
              },
              {
                heading: "Legal",
                links: ["Privacy Policy", "Terms of Service", "HIPAA BAA", "Security"],
              },
            ].map((col) => (
              <div key={col.heading}>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-900">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="cursor-pointer text-sm text-slate-500 transition-colors hover:text-slate-900">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-8">
            <p className="text-xs text-slate-400">
              © 2026 ComplyCare Inc. All rights reserved. Built on the blueprint.
            </p>
            <div className="flex gap-5">
              {["LinkedIn", "Twitter", "YouTube"].map((platform) => (
                <span
                  key={platform}
                  className="cursor-pointer text-xs text-slate-400 transition-colors hover:text-slate-700"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
