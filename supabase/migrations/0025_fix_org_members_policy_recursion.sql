-- Fix RLS recursion on org_members (Postgres 42P17).
-- Root cause: org_members policies queried org_members directly.
-- Approach: move ownership checks into SECURITY DEFINER helpers.

create or replace function public.is_org_owner(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.org_members m
    where m.organization_id = target_org_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
$$;

create or replace function public.is_org_creator(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organizations o
    where o.id = target_org_id
      and o.created_by = auth.uid()
  );
$$;

revoke all on function public.is_org_owner(uuid) from public;
revoke all on function public.is_org_creator(uuid) from public;
grant execute on function public.is_org_owner(uuid) to authenticated;
grant execute on function public.is_org_creator(uuid) to authenticated;

drop policy if exists "members insert self" on org_members;
drop policy if exists "members select self" on org_members;
drop policy if exists "members select for org" on org_members;
drop policy if exists "members insert by owner" on org_members;
drop policy if exists "members update by owner" on org_members;
drop policy if exists "members delete by owner" on org_members;

create policy "members select for org" on org_members
for select using (
  auth.uid() = user_id
  or public.is_org_owner(organization_id)
);

create policy "members insert for owner_or_creator" on org_members
for insert with check (
  public.is_org_owner(organization_id)
  or (
    auth.uid() = user_id
    and public.is_org_creator(organization_id)
  )
);

create policy "members update by owner" on org_members
for update
using (public.is_org_owner(organization_id))
with check (public.is_org_owner(organization_id));

create policy "members delete by owner" on org_members
for delete using (public.is_org_owner(organization_id));
