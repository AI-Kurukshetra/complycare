-- Add created_by to organizations and backfill org memberships

alter table organizations add column if not exists created_by uuid;
alter table organizations alter column created_by set default auth.uid();

-- Backfill created_by with the earliest user if missing
update organizations
set created_by = (
  select id from auth.users order by created_at asc limit 1
)
where created_by is null
  and exists (select 1 from auth.users);

-- Ensure each org has an owner membership
insert into org_members (organization_id, user_id, role)
select o.id, o.created_by, 'owner'
from organizations o
left join org_members m
  on m.organization_id = o.id
  and m.user_id = o.created_by
where o.created_by is not null
  and m.id is null;
