-- Nextpedition — databaseschema
-- Uitvoeren in de Supabase SQL-editor (project in regio EU).
-- Alle toegang loopt via de server van de app (service role). Row Level Security staat aan
-- zonder policies, zodat de publieke sleutel niets kan lezen of schrijven.

create extension if not exists pgcrypto;

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  naam text not null,
  datum date,
  geldig_van timestamptz not null,
  geldig_tot timestamptz not null,
  reflectie_vuur text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  naam text not null,
  telefoon text not null default '',
  token text unique not null,
  -- { vak, hoofdstukken: [{ titel, tekst }] }
  voorbereiding jsonb not null default '{}'::jsonb,
  laatst_actief timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  moment_id text not null,
  -- { notes, fields: { [id]: text }, door, keuze, waarom }
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (participant_id, moment_id)
);

create table if not exists recordings (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  moment_id text not null,
  client_id text not null,
  storage_path text not null,
  duur_sec integer,
  transcript text,
  created_at timestamptz not null default now(),
  unique (participant_id, client_id)
);

create table if not exists reports (
  participant_id uuid primary key references participants(id) on delete cascade,
  inhoud jsonb,
  pdf_path text,
  generated_at timestamptz
);

alter table events enable row level security;
alter table participants enable row level security;
alter table entries enable row level security;
alter table recordings enable row level security;
alter table reports enable row level security;

-- Opslag voor geluidsopnames (privé bucket)
insert into storage.buckets (id, name, public)
values ('opnames', 'opnames', false)
on conflict (id) do nothing;

-- De eerste editie. Pas datum en geldigheid aan zodra de dag vaststaat.
insert into events (slug, naam, datum, geldig_van, geldig_tot)
values ('bever-2026', 'Nextpedition', '2026-11-14', '2026-11-07 00:00+01', '2026-11-16 00:00+01')
on conflict (slug) do nothing;
