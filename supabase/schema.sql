-- CalGoal — Supabase schema
-- Run this once in your Supabase project: Dashboard → SQL editor → New query.
--
-- Creates a single "document-per-user" table that mirrors the app's document
-- ({ days, settings, prefs, foods }). Row Level Security ensures each user can
-- only read/write their own row, even though the app uses the public (anon) key.

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security.
alter table public.user_data enable row level security;

-- Users can read only their own row.
drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own"
  on public.user_data for select
  using (auth.uid() = user_id);

-- Users can insert only their own row.
drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own"
  on public.user_data for insert
  with check (auth.uid() = user_id);

-- Users can update only their own row.
drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete only their own row.
drop policy if exists "user_data_delete_own" on public.user_data;
create policy "user_data_delete_own"
  on public.user_data for delete
  using (auth.uid() = user_id);
