-- Phase 4: security & monitoring schema

create table if not exists vulnerabilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  asset text,
  created_at timestamptz not null default now()
);

create table if not exists compliance_checks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  status text not null default 'drift',
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists regulatory_updates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  impact text,
  source text,
  created_at timestamptz not null default now()
);
