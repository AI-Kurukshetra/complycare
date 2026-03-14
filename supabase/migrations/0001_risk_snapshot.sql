-- MVP schema for HIPAA Risk Snapshot

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_type text,
  created_at timestamptz not null default now()
);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  compliance_score int not null,
  risk_score int not null,
  risk_level text not null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists evidence_items (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  file_name text not null,
  file_type text,
  category text,
  summary text,
  extracted jsonb,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
