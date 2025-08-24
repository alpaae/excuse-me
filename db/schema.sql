create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists public.excuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input jsonb not null,
  result_text text not null,
  tts_url text,
  sent_via text,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,          -- 'stripe' | 'telegram'
  status text not null,            -- 'active' | 'past_due' | 'canceled'
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.i18n_cache (
  id uuid primary key default gen_random_uuid(),
  locale text not null,
  namespace text not null,
  key text not null,
  value text not null,
  updated_at timestamptz default now(),
  unique(locale, namespace, key)
);

alter table public.profiles enable row level security;
alter table public.excuses enable row level security;
alter table public.subscriptions enable row level security;
alter table public.i18n_cache enable row level security;

create policy "profiles self select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);

create policy "excuses owner select" on public.excuses
  for select using (auth.uid() = user_id);
create policy "excuses owner insert" on public.excuses
  for insert with check (auth.uid() = user_id);
create policy "excuses owner update" on public.excuses
  for update using (auth.uid() = user_id);
create policy "excuses owner delete" on public.excuses
  for delete using (auth.uid() = user_id);

create policy "subs owner select" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "subs owner upsert" on public.subscriptions
  for insert with check (auth.uid() = user_id);
create policy "subs owner update" on public.subscriptions
  for update using (auth.uid() = user_id);

-- i18n_cache: everyone can read, server (service role) writes
create policy "i18n_cache read all" on public.i18n_cache
  for select using (true);
revoke all on table public.i18n_cache from anon, authenticated;
grant select on table public.i18n_cache to anon, authenticated;
