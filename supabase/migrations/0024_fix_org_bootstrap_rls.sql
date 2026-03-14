-- Allow org creators to read their own organizations before membership bootstrap.
-- This unblocks the "members insert by owner" policy path that checks organizations.created_by.

drop policy if exists "orgs select for members" on organizations;

create policy "orgs select for members" on organizations
for select using (
  exists (
    select 1
    from org_members m
    where m.organization_id = organizations.id
      and m.user_id = auth.uid()
  )
  or organizations.created_by = auth.uid()
);
