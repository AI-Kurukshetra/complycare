-- Phase 6: policy gap analysis support

alter table policy_instances
  add column if not exists last_reviewed date;
