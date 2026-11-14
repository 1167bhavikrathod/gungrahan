-- Gunagrahan App (ગુણગ્રહણ એપ) - Supabase PostgreSQL Schema, RLS & Realtime Setup
-- Fully idempotent and compatible with Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- 1. KARYAKARS TABLE (Master Volunteer List)
create table if not exists public.karyakars (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  karyakar_number text,
  wing text not null default 'bal' check (wing in ('bal', 'balika')),
  is_pre_registered boolean not null default true,
  created_at timestamptz not null default now(),
  unique(name, wing)
);

-- Ensure column exists if table was already created
alter table public.karyakars add column if not exists karyakar_number text;

-- 2. GUNAS TABLE (Virtue Entries)
create table if not exists public.gunas (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.karyakars(id) on delete cascade,
  author_name text not null,
  recipient_id uuid not null references public.karyakars(id) on delete cascade,
  recipient_name text not null,
  content text not null check (char_length(trim(content)) >= 3),
  wing text not null default 'bal' check (wing in ('bal', 'balika')),
  rajipo_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. INDEXES FOR <50ms QUERIES
create index if not exists idx_karyakars_wing on public.karyakars(wing);
create index if not exists idx_gunas_wing_created on public.gunas(wing, created_at desc);
create index if not exists idx_gunas_author on public.gunas(author_id);
create index if not exists idx_gunas_recipient on public.gunas(recipient_id);

-- 4. ATOMIC RPC FUNCTION FOR 1-TAP RAJIPO APPRECIATION
-- Note: Written in pure SQL without dollar quotes to prevent parser/copy-paste issues in web editors
create or replace function public.increment_rajipo(row_id uuid)
returns void
language sql
security definer
as 'update public.gunas set rajipo_count = rajipo_count + 1 where id = row_id;';

-- 5. ROW LEVEL SECURITY (Open Passwordless Access for Internal Karyakar App)
alter table public.karyakars enable row level security;
alter table public.gunas enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public read karyakars" on public.karyakars;
drop policy if exists "Allow public insert karyakars" on public.karyakars;
drop policy if exists "Allow public read gunas" on public.gunas;
drop policy if exists "Allow public insert gunas" on public.gunas;
drop policy if exists "Allow public update rajipo_count" on public.gunas;

create policy "Allow public read karyakars" on public.karyakars for select using (true);
create policy "Allow public insert karyakars" on public.karyakars for insert with check (true);
create policy "Allow public read gunas" on public.gunas for select using (true);
create policy "Allow public insert gunas" on public.gunas for insert with check (true);
create policy "Allow public update rajipo_count" on public.gunas for update using (true);

-- 6. ENABLE REALTIME WEBSOCKETS (Safe idempotent block)
do $pub$
begin
  begin
    alter publication supabase_realtime add table public.gunas;
  exception when duplicate_object then
    null;
  end;
  begin
    alter publication supabase_realtime add table public.karyakars;
  exception when duplicate_object then
    null;
  end;
end;
$pub$;

-- 7. INITIAL SEED DATA (Core Karyakars)
insert into public.karyakars (name, wing, is_pre_registered) values
  ('સિદ્ધરાજભાઈ (Siddhraj)', 'bal', true),
  ('ભાવિકભાઈ (Bhavik)', 'bal', true),
  ('ધર્મેશભાઈ (Dharmeshbhai)', 'bal', true),
  ('કીર્તનભાઈ (Kirtanbhai)', 'bal', true),
  ('ઋષિભાઈ (Rushibhai)', 'bal', true),
  ('પ્રતીકભાઈ (Pratikbhai)', 'bal', true)
on conflict (name, wing) do nothing;
