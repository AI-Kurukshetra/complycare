-- Phase 2 compliance operations schema

create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists incident_steps (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references incidents(id) on delete cascade,
  title text not null,
  status text not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists calendar_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  due_date date not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists policy_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  body text not null,
  version text not null default 'v1.0',
  created_at timestamptz not null default now()
);

create table if not exists policy_instances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  template_id uuid references policy_templates(id) on delete set null,
  status text not null default 'draft',
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  tags text[] not null default '{}',
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  actor text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
