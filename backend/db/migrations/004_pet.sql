-- Our bunny, shared between the two of us: one row that both our phones read and change,
-- so a hug, a treat, an outfit or a new season on one phone shows up on the other.
-- Tummy (food) and love go down slowly over time; the API brings them up to date
-- (from `t`) whenever it changes them, and the page does the same between changes.

create table if not exists pet (
  id             smallint primary key default 1 check (id = 1),
  name           text not null default '' check (length(name) <= 24),
  food           real not null default 72 check (food between 0 and 100),
  love           real not null default 72 check (love between 0 and 100),
  t              timestamptz not null default now(),
  hugs           integer not null default 0 check (hugs >= 0),
  treats         integer not null default 0 check (treats >= 0),
  next_treat     smallint not null default 0 check (next_treat between 0 and 2),
  outfit         text not null default 'none' check (outfit in ('none', 'princess', 'carrot', 'tartan')),
  season         text not null default 'auto' check (season in ('auto', 'spring', 'summer', 'autumn', 'winter')),
  since          date not null default current_date,
  ann_date       date,
  ann_monthly    boolean not null default true,
  last_hug_by    text check (last_hug_by in ('Ben', 'Amiee')),
  last_hug_at    timestamptz,
  last_feed_by   text check (last_feed_by in ('Ben', 'Amiee')),
  last_feed_at   timestamptz,
  last_feed_kind text check (last_feed_kind in ('carrot', 'strawberry', 'matcha')),
  -- what changed last, so the other phone can play it (a hug, a treat…)
  rev            bigint not null default 0,
  last_action    text not null default '',
  last_kind      text not null default '',
  last_by        text check (last_by in ('Ben', 'Amiee')),
  last_client    text not null default '' check (length(last_client) <= 40),
  updated_at     timestamptz not null default now()
);

insert into pet (id) values (1) on conflict (id) do nothing;
