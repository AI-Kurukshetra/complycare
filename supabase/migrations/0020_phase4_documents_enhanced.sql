-- Phase 4 document storage enhancements

-- Ensure compliance documents bucket exists
insert into storage.buckets (id, name, public)
values ('compliance-documents', 'compliance-documents', false)
on conflict (id) do nothing;

-- Expand documents schema for storage metadata + versioning
alter table documents
  add column if not exists file_name text,
  add column if not exists file_path text,
  add column if not exists file_size bigint,
  add column if not exists mime_type text,
  add column if not exists category text not null default 'other',
  add column if not exists version integer not null default 1,
  add column if not exists parent_document_id uuid references documents(id) on delete set null,
  add column if not exists uploaded_by uuid references auth.users(id) on delete set null;

alter table documents
  alter column tags set default '{}';

update documents
set file_name = coalesce(file_name, title)
where file_name is null;

update documents
set file_path = coalesce(file_path, storage_path)
where file_path is null;

alter table documents
  alter column file_name set not null;

-- Constraints
DO $$
BEGIN
  if not exists (
    select 1 from pg_constraint where conname = 'documents_category_check'
  ) then
    alter table documents
      add constraint documents_category_check
      check (category in ('policy', 'contract', 'report', 'evidence', 'other'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'documents_version_check'
  ) then
    alter table documents
      add constraint documents_version_check
      check (version >= 1);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'documents_file_size_check'
  ) then
    alter table documents
      add constraint documents_file_size_check
      check (file_size is null or file_size >= 0);
  end if;
END $$;

-- Full-text search support
alter table documents
  add column if not exists search_vector tsvector;

update documents
set search_vector = to_tsvector('english', coalesce(file_name, '') || ' ' || array_to_string(tags, ' '))
where search_vector is null;

create or replace function documents_search_vector_update() returns trigger as $$
begin
  new.search_vector := to_tsvector('english', coalesce(new.file_name, '') || ' ' || array_to_string(new.tags, ' '));
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'documents_search_vector_trigger'
  ) then
    create trigger documents_search_vector_trigger
    before insert or update of file_name, tags on documents
    for each row
    execute function documents_search_vector_update();
  end if;
end $$;

create index if not exists documents_search_idx on documents using gin (search_vector);

-- Update document RLS policies (members read, owners/admins write)
drop policy if exists "documents insert for members" on documents;
drop policy if exists "documents select for members" on documents;
drop policy if exists "documents insert for admins" on documents;
drop policy if exists "documents update for admins" on documents;
drop policy if exists "documents delete for admins" on documents;

create policy "documents select for members" on documents
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = documents.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "documents insert for admins" on documents
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = documents.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

create policy "documents update for admins" on documents
for update using (
  exists (
    select 1 from org_members m
    where m.organization_id = documents.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
) with check (
  exists (
    select 1 from org_members m
    where m.organization_id = documents.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

create policy "documents delete for admins" on documents
for delete using (
  exists (
    select 1 from org_members m
    where m.organization_id = documents.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

-- Storage policies for compliance-documents bucket

drop policy if exists "documents storage insert" on storage.objects;
drop policy if exists "documents storage select" on storage.objects;
drop policy if exists "documents storage update" on storage.objects;

drop policy if exists "compliance documents storage read" on storage.objects;
drop policy if exists "compliance documents storage write" on storage.objects;
drop policy if exists "compliance documents storage update" on storage.objects;
drop policy if exists "compliance documents storage delete" on storage.objects;

create policy "compliance documents storage read" on storage.objects
for select using (
  bucket_id = 'compliance-documents'
  and auth.uid() is not null
  and exists (
    select 1 from org_members m
    where storage.objects.name like m.organization_id::text || '/%'
      and m.user_id = auth.uid()
  )
);

create policy "compliance documents storage write" on storage.objects
for insert with check (
  bucket_id = 'compliance-documents'
  and auth.uid() is not null
  and exists (
    select 1 from org_members m
    where storage.objects.name like m.organization_id::text || '/%'
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

create policy "compliance documents storage update" on storage.objects
for update using (
  bucket_id = 'compliance-documents'
  and auth.uid() is not null
  and exists (
    select 1 from org_members m
    where storage.objects.name like m.organization_id::text || '/%'
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

create policy "compliance documents storage delete" on storage.objects
for delete using (
  bucket_id = 'compliance-documents'
  and auth.uid() is not null
  and exists (
    select 1 from org_members m
    where storage.objects.name like m.organization_id::text || '/%'
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);
