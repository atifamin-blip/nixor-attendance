create extension if not exists pgcrypto;

create table if not exists attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  opens_at timestamptz not null,
  late_after timestamptz not null,
  closes_at timestamptz not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer not null default 200,
  on_time_message text not null,
  late_message text not null,
  closed_message text not null,
  created_at timestamptz not null default now()
);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references attendance_sessions(id) on delete cascade,
  session_title text not null,
  student_id text not null,
  student_name text not null,
  program text,
  status text not null check (status in ('present','late')),
  late_reason text,
  latitude double precision not null,
  longitude double precision not null,
  distance_meters double precision not null,
  location_accuracy double precision,
  next_step_message text not null,
  submitted_at timestamptz not null default now(),
  unique(session_id, student_id)
);

alter table attendance_sessions enable row level security;
alter table attendance_records enable row level security;

-- No public policies are required because all database access goes through
-- Netlify Functions using the Supabase service-role key.
