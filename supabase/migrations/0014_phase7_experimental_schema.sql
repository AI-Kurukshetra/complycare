-- Phase 7: experimental features schema

create table if not exists behavior_alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  severity text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists pentest_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  status text not null default 'scheduled',
  findings int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists audit_chain_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  payload text not null,
  prev_hash text,
  hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists training_sims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  mode text not null default 'gamified',
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists iot_devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  status text not null default 'monitored',
  created_at timestamptz not null default now()
);
