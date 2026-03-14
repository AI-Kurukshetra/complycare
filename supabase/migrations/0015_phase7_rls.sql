-- Phase 7 RLS policies

alter table behavior_alerts enable row level security;
alter table pentest_runs enable row level security;
alter table audit_chain_entries enable row level security;
alter table training_sims enable row level security;
alter table iot_devices enable row level security;

create policy "behavior alerts insert for members" on behavior_alerts
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = behavior_alerts.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "behavior alerts select for members" on behavior_alerts
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = behavior_alerts.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "pentest runs insert for members" on pentest_runs
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = pentest_runs.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "pentest runs select for members" on pentest_runs
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = pentest_runs.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "audit chain insert for members" on audit_chain_entries
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = audit_chain_entries.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "audit chain select for members" on audit_chain_entries
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = audit_chain_entries.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "training sims insert for members" on training_sims
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = training_sims.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "training sims select for members" on training_sims
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = training_sims.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "iot devices insert for members" on iot_devices
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = iot_devices.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "iot devices select for members" on iot_devices
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = iot_devices.organization_id
      and m.user_id = auth.uid()
  )
);
