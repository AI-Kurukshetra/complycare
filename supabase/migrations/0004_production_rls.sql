-- Production-safe RLS with org membership

-- Org membership table
create table if not exists org_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

alter table org_members enable row level security;

-- Drop permissive policies from demo mode
DO $$
DECLARE
  pol record;
BEGIN
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where policyname like 'public %'
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
END $$;

-- Helper: membership check
-- Organizations
create policy "orgs insert for auth" on organizations
for insert with check (auth.uid() is not null);

create policy "orgs select for members" on organizations
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = organizations.id
      and m.user_id = auth.uid()
  )
);

-- Org members
create policy "members insert self" on org_members
for insert with check (auth.uid() = user_id);

create policy "members select self" on org_members
for select using (auth.uid() = user_id);

-- Incidents
create policy "incidents insert for members" on incidents
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = incidents.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "incidents select for members" on incidents
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = incidents.organization_id
      and m.user_id = auth.uid()
  )
);

-- Incident steps
create policy "incident steps insert for members" on incident_steps
for insert with check (
  exists (
    select 1
    from incidents i
    join org_members m on m.organization_id = i.organization_id
    where i.id = incident_steps.incident_id
      and m.user_id = auth.uid()
  )
);

create policy "incident steps select for members" on incident_steps
for select using (
  exists (
    select 1
    from incidents i
    join org_members m on m.organization_id = i.organization_id
    where i.id = incident_steps.incident_id
      and m.user_id = auth.uid()
  )
);

create policy "incident steps update for members" on incident_steps
for update using (
  exists (
    select 1
    from incidents i
    join org_members m on m.organization_id = i.organization_id
    where i.id = incident_steps.incident_id
      and m.user_id = auth.uid()
  )
);

-- Calendar tasks
create policy "calendar tasks insert for members" on calendar_tasks
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = calendar_tasks.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "calendar tasks select for members" on calendar_tasks
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = calendar_tasks.organization_id
      and m.user_id = auth.uid()
  )
);

-- Policy templates: read-only for authenticated users
create policy "policy templates select for auth" on policy_templates
for select using (auth.uid() is not null);

-- Policy instances
create policy "policy instances insert for members" on policy_instances
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = policy_instances.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "policy instances select for members" on policy_instances
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = policy_instances.organization_id
      and m.user_id = auth.uid()
  )
);

-- Documents
create policy "documents insert for members" on documents
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = documents.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "documents select for members" on documents
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = documents.organization_id
      and m.user_id = auth.uid()
  )
);

-- Audit logs
create policy "audit logs insert for members" on audit_logs
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = audit_logs.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "audit logs select for members" on audit_logs
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = audit_logs.organization_id
      and m.user_id = auth.uid()
  )
);

-- Storage policies for documents bucket
create policy "documents storage insert" on storage.objects
for insert with check (
  bucket_id = 'documents'
  and auth.uid() is not null
  and exists (
    select 1 from org_members m
    where storage.objects.name like m.organization_id::text || '/%'
      and m.user_id = auth.uid()
  )
);

create policy "documents storage select" on storage.objects
for select using (
  bucket_id = 'documents'
  and auth.uid() is not null
  and exists (
    select 1 from org_members m
    where storage.objects.name like m.organization_id::text || '/%'
      and m.user_id = auth.uid()
  )
);

create policy "documents storage update" on storage.objects
for update using (
  bucket_id = 'documents'
  and auth.uid() is not null
  and exists (
    select 1 from org_members m
    where storage.objects.name like m.organization_id::text || '/%'
      and m.user_id = auth.uid()
  )
);
