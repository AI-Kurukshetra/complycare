-- Phase 3 Task 3.3: Notifications table for real-time alert system

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread
  on notifications (user_id, created_at desc)
  where read_at is null;

-- Enable RLS
alter table notifications enable row level security;

-- Users can only see their own notifications
create policy "notifications_select_own"
  on notifications for select
  using (user_id = auth.uid());

-- Users can mark their own notifications as read
create policy "notifications_update_own"
  on notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Allow authenticated users (server-side triggers) to insert notifications
-- Service role bypasses RLS so inserts from Edge Functions work without a policy
create policy "notifications_insert_own_org"
  on notifications for insert
  with check (
    exists (
      select 1 from org_members
      where org_members.organization_id = notifications.organization_id
        and org_members.user_id = auth.uid()
    )
  );

-- Enable Supabase Realtime for this table
alter publication supabase_realtime add table notifications;
