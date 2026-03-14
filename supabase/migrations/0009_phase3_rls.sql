-- Phase 3 RLS policies

alter table risks enable row level security;
alter table risk_actions enable row level security;
alter table vendors enable row level security;
alter table vendor_assessments enable row level security;
alter table baas enable row level security;
alter table access_reviews enable row level security;
alter table access_review_items enable row level security;

-- Risks
create policy "risks insert for members" on risks
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = risks.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "risks select for members" on risks
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = risks.organization_id
      and m.user_id = auth.uid()
  )
);

-- Risk actions
create policy "risk actions insert for members" on risk_actions
for insert with check (
  exists (
    select 1
    from risks r
    join org_members m on m.organization_id = r.organization_id
    where r.id = risk_actions.risk_id
      and m.user_id = auth.uid()
  )
);

create policy "risk actions select for members" on risk_actions
for select using (
  exists (
    select 1
    from risks r
    join org_members m on m.organization_id = r.organization_id
    where r.id = risk_actions.risk_id
      and m.user_id = auth.uid()
  )
);

-- Vendors
create policy "vendors insert for members" on vendors
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = vendors.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "vendors select for members" on vendors
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = vendors.organization_id
      and m.user_id = auth.uid()
  )
);

-- Vendor assessments
create policy "vendor assessments insert for members" on vendor_assessments
for insert with check (
  exists (
    select 1
    from vendors v
    join org_members m on m.organization_id = v.organization_id
    where v.id = vendor_assessments.vendor_id
      and m.user_id = auth.uid()
  )
);

create policy "vendor assessments select for members" on vendor_assessments
for select using (
  exists (
    select 1
    from vendors v
    join org_members m on m.organization_id = v.organization_id
    where v.id = vendor_assessments.vendor_id
      and m.user_id = auth.uid()
  )
);

-- BAAs
create policy "baas insert for members" on baas
for insert with check (
  exists (
    select 1
    from vendors v
    join org_members m on m.organization_id = v.organization_id
    where v.id = baas.vendor_id
      and m.user_id = auth.uid()
  )
);

create policy "baas select for members" on baas
for select using (
  exists (
    select 1
    from vendors v
    join org_members m on m.organization_id = v.organization_id
    where v.id = baas.vendor_id
      and m.user_id = auth.uid()
  )
);

-- Access reviews
create policy "access reviews insert for members" on access_reviews
for insert with check (
  exists (
    select 1 from org_members m
    where m.organization_id = access_reviews.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "access reviews select for members" on access_reviews
for select using (
  exists (
    select 1 from org_members m
    where m.organization_id = access_reviews.organization_id
      and m.user_id = auth.uid()
  )
);

-- Access review items
create policy "access review items insert for members" on access_review_items
for insert with check (
  exists (
    select 1
    from access_reviews ar
    join org_members m on m.organization_id = ar.organization_id
    where ar.id = access_review_items.access_review_id
      and m.user_id = auth.uid()
  )
);

create policy "access review items select for members" on access_review_items
for select using (
  exists (
    select 1
    from access_reviews ar
    join org_members m on m.organization_id = ar.organization_id
    where ar.id = access_review_items.access_review_id
      and m.user_id = auth.uid()
  )
);

create policy "access review items update for members" on access_review_items
for update using (
  exists (
    select 1
    from access_reviews ar
    join org_members m on m.organization_id = ar.organization_id
    where ar.id = access_review_items.access_review_id
      and m.user_id = auth.uid()
  )
);
