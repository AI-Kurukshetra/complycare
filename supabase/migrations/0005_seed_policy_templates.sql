-- Seed policy templates with fixed IDs

insert into policy_templates (id, title, category, body, version)
values
  ('11111111-1111-1111-1111-111111111111', 'Access Control Policy', 'Access',
   'Define role-based access, quarterly reviews, and least-privilege requirements.', 'v1.0'),
  ('22222222-2222-2222-2222-222222222222', 'Incident Response Policy', 'Incident',
   'Outline breach identification, containment, notification, and documentation steps.', 'v1.2'),
  ('33333333-3333-3333-3333-333333333333', 'Workforce Training Policy', 'Training',
   'Require annual HIPAA training, tracking, and remediation for missed sessions.', 'v1.1'),
  ('44444444-4444-4444-4444-444444444444', 'Vendor Risk Policy', 'Vendor',
   'Establish BAA review cadence and vendor security assessment criteria.', 'v1.0')
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    category = EXCLUDED.category,
    body = EXCLUDED.body,
    version = EXCLUDED.version;
