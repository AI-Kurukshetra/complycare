-- Phase 3: calendar task enhancement

alter table calendar_tasks
  add column if not exists recurrence_rule text not null default 'none',
  add column if not exists notification_days_before int[] not null default array[30,7,1],
  add column if not exists task_type text not null default 'custom',
  add column if not exists linked_entity_id uuid,
  add column if not exists assigned_to uuid,
  add column if not exists completed_at timestamptz;

create index if not exists calendar_tasks_org_due_date_idx
  on calendar_tasks (organization_id, due_date);

create or replace function insert_default_calendar_tasks()
  returns trigger as $$
begin
  insert into calendar_tasks (
    organization_id,
    title,
    due_date,
    status,
    recurrence_rule,
    notification_days_before,
    task_type,
    created_at
  ) values
    (
      NEW.id,
      'Annual risk assessment',
      (current_date + interval '365 days')::date,
      'open',
      'annually',
      array[30,7,1],
      'risk_assessment',
      now()
    ),
    (
      NEW.id,
      'Quarterly policy review',
      (current_date + interval '90 days')::date,
      'open',
      'monthly',
      array[30,7,1],
      'policy_review',
      now()
    ),
    (
      NEW.id,
      'Annual employee training renewal',
      (current_date + interval '365 days')::date,
      'open',
      'annually',
      array[30,7,1],
      'training_renewal',
      now()
    );

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists seed_default_calendar_tasks on organizations;

create trigger seed_default_calendar_tasks
  after insert on organizations
  for each row
  execute function insert_default_calendar_tasks();
