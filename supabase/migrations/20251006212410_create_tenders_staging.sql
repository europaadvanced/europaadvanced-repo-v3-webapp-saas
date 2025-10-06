create extension if not exists pgcrypto;

create table if not exists public.tenders_staging (
  id uuid primary key default gen_random_uuid(),
  title_ai text,
  description_long text,
  publication_date timestamp with time zone,
  deadline_date timestamp with time zone,
  link text,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.tenders_staging enable row level security;

create policy "Authenticated users can read tenders" on public.tenders_staging
  for select
  using (auth.role() = 'authenticated');

create or replace view public.tenders as
select
  id,
  title_ai,
  description_long,
  publication_date,
  deadline_date,
  link,
  created_at
from public.tenders_staging;

grant select on public.tenders to authenticated;
