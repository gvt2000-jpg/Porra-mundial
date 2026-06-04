-- Supabase schema for Porras Mundial
-- Run in Supabase SQL editor or via psql with service role key

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Teams
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fifa_code varchar(8),
  passed_group boolean default false,
  group_finish_position integer default 0 check (group_finish_position >= 0 and group_finish_position <= 3),
  phases_advanced integer default 0 check (phases_advanced >= 0),
  finalist boolean default false,
  third_place boolean default false,
  champion boolean default false,
  created_at timestamptz default now(),
  unique(name)
);

-- Profiles (link to Supabase Auth users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- Picks: each user can submit ranks 1..10 for teams
-- Picks: each user can submit ranks 1..10 for teams
create table if not exists picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  submitter_name text,
  team_id uuid not null references teams(id) on delete cascade,
  rank smallint not null check (rank >= 1 and rank <= 10),
  multiplier smallint not null check (multiplier >= 1 and multiplier <= 10),
  created_at timestamptz default now(),
  -- allow either linked auth user or a submitter_name; enforce uniqueness per submitter_name and per user if present
  unique(user_id, rank),
  unique(user_id, team_id),
  unique(submitter_name, rank),
  unique(submitter_name, team_id)
);

create index if not exists idx_picks_user on picks(user_id);
create index if not exists idx_picks_submitter on picks(submitter_name);

-- Matches
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid not null references teams(id),
  away_team_id uuid not null references teams(id),
  stage text not null,
  starts_at timestamptz,
  home_score smallint default 0,
  away_score smallint default 0,
  played boolean default false,
  bracket_order integer,
  home_source text,
  away_source text,
  winner_team_id uuid references teams(id),
  created_at timestamptz default now()
);

create index if not exists idx_matches_stage on matches(stage);
create unique index if not exists unique_matches_bracket_order on matches(bracket_order) where bracket_order is not null;

-- Match events (goals, cards, assists...)
create table if not exists match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  team_id uuid not null references teams(id),
  event_type text not null,
  player_name text,
  minute smallint,
  created_at timestamptz default now()
);

create index if not exists idx_match_events_match on match_events(match_id);

-- Group standings (optional, populated by admin or processes)
create table if not exists group_standings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id),
  group_name text not null,
  position smallint,
  played smallint default 0,
  wins smallint default 0,
  draws smallint default 0,
  losses smallint default 0,
  goals_for smallint default 0,
  goals_against smallint default 0,
  points smallint default 0,
  last_updated timestamptz default now(),
  unique(group_name, team_id)
);

-- Aggregate table to store computed tournament points per team
create table if not exists team_points (
  team_id uuid primary key references teams(id),
  points integer default 0,
  last_updated timestamptz default now()
);

-- Optional: view showing picks with multipliers (for convenience)
create or replace view picks_with_team as
select p.id, p.user_id, p.team_id, t.name as team_name, p.rank, p.multiplier, p.created_at
from picks p
left join teams t on t.id = p.team_id;
