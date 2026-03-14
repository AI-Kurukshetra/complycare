-- Phase 3: risk & vendor management schema

create table if not exists risks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  severity text not null default 'medium',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists risk_actions (
  id uuid primary key default gen_random_uuid(),
  risk_id uuid references risks(id) on delete cascade,
  action text not null,
  status text not null default 'planned',
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  criticality text not null default 'medium',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists vendor_assessments (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id) on delete cascade,
  score int not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists baas (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id) on delete cascade,
  status text not null default 'pending',
  renewal_date date,
  created_at timestamptz not null default now()
);

create table if not exists access_reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists access_review_items (
  id uuid primary key default gen_random_uuid(),
  access_review_id uuid references access_reviews(id) on delete cascade,
  subject text not null,
  decision text not null default 'pending',
  created_at timestamptz not null default now()
);
