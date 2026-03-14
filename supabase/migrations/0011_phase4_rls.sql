-- Phase 4 RLS policies

alter table vulnerabilities enable row level security;
alter table compliance_checks enable row level security;
alter table regulatory_updates enable row level security;

create policy "vulnerabilities insert for members" on vulnerabilities
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = vulnerabilities.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "vulnerabilities select for members" on vulnerabilities
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = vulnerabilities.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "compliance checks insert for members" on compliance_checks
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = compliance_checks.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "compliance checks select for members" on compliance_checks
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = compliance_checks.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "compliance checks update for members" on compliance_checks
for update using (
  exists (
    select 1 from org_members m
    where m.organization_id = compliance_checks.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "reg updates insert for members" on regulatory_updates
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = regulatory_updates.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "reg updates select for members" on regulatory_updates
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = regulatory_updates.organization_id
      and m.user_id = auth.uid()
  )
);
