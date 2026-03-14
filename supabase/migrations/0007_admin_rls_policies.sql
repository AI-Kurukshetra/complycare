-- Replace org member policies with owner-aware admin rules

DO $$
DECLARE
  pol record;
BEGIN
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where policyname in (
      'members insert self',
      'members select self',
      'orgs select for members',
      'orgs insert for auth',
      'policy templates select for auth'
    )
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
END $$;

-- Organizations: creator can insert; members can read
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

-- Org members: owners can manage, members can read their row
create policy "members select for org" on org_members
for select using (
  auth.uid() = user_id
  or exists (
    select 1 from org_members m
    where m.organization_id = org_members.organization_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  )
);

create policy "members insert by owner" on org_members
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = org_members.organization_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  )
  or (
    auth.uid() = user_id
    and exists (
      select 1 from organizations o
      where o.id = org_members.organization_id
        and o.created_by = auth.uid()
    )
  )
);

create policy "members update by owner" on org_members
for update using (
  exists (
    select 1 from org_members m
    where m.organization_id = org_members.organization_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  )
);

create policy "members delete by owner" on org_members
for delete using (
  exists (
    select 1 from org_members m
    where m.organization_id = org_members.organization_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  )
);

-- Policy templates: read-only to authenticated users
create policy "policy templates select for auth" on policy_templates
for select using (auth.uid() is not null);
