-- Carinder: initial schema.
-- Vehicles are written by the ingest job (service role) and read-only for users.
-- Swipes and preferences belong to exactly one user each (RLS).

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "Users update their own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Vehicles ------------------------------------------------------------------

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  make text not null,
  model text not null,
  variant text,
  year smallint not null check (year between 1900 and 2100),
  mileage_km integer not null check (mileage_km >= 0),
  power_kw smallint not null check (power_kw > 0),
  fuel text not null check (fuel in ('petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'lpg')),
  transmission text not null check (transmission in ('manual', 'automatic')),
  body_type text not null check (body_type in ('small', 'sedan', 'estate', 'suv', 'coupe', 'convertible', 'van')),
  price_eur integer not null check (price_eur >= 0),
  zip text,
  city text,
  images jsonb not null default '[]'::jsonb,
  source_url text,
  active boolean not null default true,
  fetched_at timestamptz not null default now(),
  unique (source, source_id)
);

create index vehicles_active_price_idx on public.vehicles (price_eur) where active;

alter table public.vehicles enable row level security;

create policy "Signed-in users read active vehicles" on public.vehicles
  for select to authenticated using (active);

-- Swipes --------------------------------------------------------------------

create table public.swipes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  direction text not null check (direction in ('like', 'dislike', 'superlike')),
  created_at timestamptz not null default now(),
  primary key (user_id, vehicle_id)
);

create index swipes_user_created_idx on public.swipes (user_id, created_at desc);

alter table public.swipes enable row level security;

create policy "Users read their own swipes" on public.swipes
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Users add their own swipes" on public.swipes
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "Users change their own swipes" on public.swipes
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Users delete their own swipes" on public.swipes
  for delete to authenticated using (user_id = (select auth.uid()));

-- Preferences (hard filters) ------------------------------------------------

create table public.user_preferences (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  max_price_eur integer check (max_price_eur >= 0),
  min_year smallint,
  max_mileage_km integer check (max_mileage_km >= 0),
  fuels text[] not null default '{}',
  body_types text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users read their own preferences" on public.user_preferences
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Users add their own preferences" on public.user_preferences
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "Users change their own preferences" on public.user_preferences
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Feed candidates -----------------------------------------------------------
-- Random sample of active, not yet swiped vehicles matching the caller's
-- filters. The app ranks them (src/domain/scoring.ts).

create function public.feed_candidates(p_limit integer default 300)
returns setof public.vehicles
language sql
stable
security invoker
set search_path = ''
as $$
  select v.*
  from public.vehicles v
  left join public.user_preferences p on p.user_id = (select auth.uid())
  where v.active
    and not exists (
      select 1 from public.swipes s
      where s.user_id = (select auth.uid()) and s.vehicle_id = v.id
    )
    and (p.max_price_eur is null or v.price_eur <= p.max_price_eur)
    and (p.min_year is null or v.year >= p.min_year)
    and (p.max_mileage_km is null or v.mileage_km <= p.max_mileage_km)
    and (p.fuels is null or cardinality(p.fuels) = 0 or v.fuel = any (p.fuels))
    and (p.body_types is null or cardinality(p.body_types) = 0 or v.body_type = any (p.body_types))
  order by random()
  limit least(greatest(p_limit, 1), 500);
$$;

revoke execute on function public.feed_candidates(integer) from public, anon;
grant execute on function public.feed_candidates(integer) to authenticated;
