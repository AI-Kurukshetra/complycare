-- Phase 2 RLS policies

alter table organizations enable row level security;
alter table incidents enable row level security;
alter table incident_steps enable row level security;
alter table calendar_tasks enable row level security;
alter table policy_templates enable row level security;
alter table policy_instances enable row level security;
alter table documents enable row level security;
alter table audit_logs enable row level security;

-- Demo-mode policies: allow public read/write (adjust for auth in production)
create policy "public insert organizations" on organizations for insert with check (true);
create policy "public select organizations" on organizations for select using (true);

create policy "public insert incidents" on incidents for insert with check (true);
create policy "public select incidents" on incidents for select using (true);

create policy "public insert incident_steps" on incident_steps for insert with check (true);
create policy "public select incident_steps" on incident_steps for select using (true);
create policy "public update incident_steps" on incident_steps for update using (true);

create policy "public insert calendar_tasks" on calendar_tasks for insert with check (true);
create policy "public select calendar_tasks" on calendar_tasks for select using (true);

create policy "public upsert policy_templates" on policy_templates for insert with check (true);
create policy "public select policy_templates" on policy_templates for select using (true);

create policy "public insert policy_instances" on policy_instances for insert with check (true);
create policy "public select policy_instances" on policy_instances for select using (true);

create policy "public insert documents" on documents for insert with check (true);
create policy "public select documents" on documents for select using (true);

create policy "public insert audit_logs" on audit_logs for insert with check (true);
create policy "public select audit_logs" on audit_logs for select using (true);

-- Storage bucket policies (demo)
create policy "public storage insert" on storage.objects
for insert with check (bucket_id = 'documents');

create policy "public storage select" on storage.objects
for select using (bucket_id = 'documents');

create policy "public storage update" on storage.objects
for update using (bucket_id = 'documents');
