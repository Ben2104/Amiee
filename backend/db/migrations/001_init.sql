-- Our Little World: initial schema.
-- Users, passwords and sessions live in the neon_auth schema (Managed Neon Auth).
-- This schema only stores who is allowed in and the content the two of us write.

create table if not exists members (
  user_id      uuid primary key references neon_auth."user"(id) on delete cascade,
  display_name text not null unique check (display_name in ('Ben', 'Amie')),
  created_at   timestamptz not null default now()
);

create table if not exists letters (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references members(user_id),
  title       text not null check (length(title) between 1 and 200),
  body        text not null check (length(body) between 1 and 20000),
  letter_date date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists milestones (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references members(user_id),
  happened_on date not null,
  title       text not null check (length(title) between 1 and 200),
  caption     text not null default '' check (length(caption) <= 2000),
  photo_key   text check (photo_key ~ '^photos/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  photo_alt   text not null default '' check (length(photo_alt) <= 300),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists love_notes (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references members(user_id),
  body        text not null check (length(body) between 1 and 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references members(user_id),
  title       text not null check (length(title) between 1 and 200),
  event_date  date,                      -- null = a "someday" idea
  event_time  time,
  location    text not null default '' check (length(location) <= 200),
  note        text not null default '' check (length(note) <= 2000),
  kind        text not null default 'date'
              check (kind in ('date', 'trip', 'food', 'home', 'celebration', 'other')),
  done        boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (event_time is null or event_date is not null)
);

create index if not exists milestones_happened_on_idx on milestones (happened_on);
create index if not exists letters_date_idx on letters (letter_date desc nulls last, created_at desc);
create index if not exists events_date_idx on events (event_date nulls last, event_time nulls first);
