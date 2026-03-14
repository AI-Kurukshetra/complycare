-- Phase 6: scale & expansion schema

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  address text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists integration_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  label text not null,
  token text not null,
  created_at timestamptz not null default now()
);

create table if not exists secure_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  recipient text not null,
  subject text not null,
  encrypted_payload text not null,
  created_at timestamptz not null default now()
);
