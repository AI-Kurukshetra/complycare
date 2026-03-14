-- Phase 6 RLS policies

alter table locations enable row level security;
alter table integration_keys enable row level security;
alter table secure_messages enable row level security;

create policy "locations insert for members" on locations
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = locations.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "locations select for members" on locations
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = locations.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "integration keys insert for members" on integration_keys
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = integration_keys.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "integration keys select for members" on integration_keys
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = integration_keys.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "secure messages insert for members" on secure_messages
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = secure_messages.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "secure messages select for members" on secure_messages
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = secure_messages.organization_id
      and m.user_id = auth.uid()
  )
);
