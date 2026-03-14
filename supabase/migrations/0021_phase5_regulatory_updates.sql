-- Phase 5: expand regulatory updates schema

alter table regulatory_updates
  add column if not exists summary text,
  add column if not exists effective_date date,
  add column if not exists impact_level text not null default 'medium',
  add column if not exists affected_areas text[] not null default '{}',
  add column if not exists action_required boolean not null default false,
  add column if not exists source_url text;

DO $$
BEGIN
  if not exists (
    select 1 from pg_constraint where conname = 'regulatory_updates_impact_level_check'
  ) then
    alter table regulatory_updates
      add constraint regulatory_updates_impact_level_check
      check (impact_level in ('low', 'medium', 'high', 'critical'));
  end if;
END $$;
