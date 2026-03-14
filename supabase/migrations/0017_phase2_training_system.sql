-- Phase 2: training system

alter table training_sims
  add column if not exists description text,
  add column if not exists module_type text not null default 'quiz',
  add column if not exists content_json jsonb not null default '[]'::jsonb,
  add column if not exists estimated_minutes int not null default 10,
  add column if not exists passing_score int not null default 80,
  add column if not exists is_required boolean not null default true,
  add column if not exists due_date date;

create table if not exists training_completions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references training_sims(id) on delete cascade,
  user_id uuid not null,
  score int,
  completed_at timestamptz,
  certificate_url text,
  attempts int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists training_completions_user_module_idx
  on training_completions (user_id, module_id);

alter table training_completions enable row level security;

create policy "training completions insert for members" on training_completions
for insert with check (
  training_completions.user_id = auth.uid()
  and exists (
    select 1
    from training_sims ts
    join org_members m on m.organization_id = ts.organization_id
    where ts.id = training_completions.module_id
      and m.user_id = auth.uid()
  )
);

create policy "training completions select for members" on training_completions
for select using (
  exists (
    select 1
    from training_sims ts
    join org_members m on m.organization_id = ts.organization_id
    where ts.id = training_completions.module_id
      and m.user_id = auth.uid()
  )
);
