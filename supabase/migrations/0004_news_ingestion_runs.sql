create table if not exists public.news_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running'
    check (status in ('running', 'succeeded', 'failed', 'interrupted')),
  results jsonb not null default '[]'
);

create unique index if not exists news_ingestion_single_run
  on public.news_ingestion_runs (status) where status = 'running';
create index if not exists news_ingestion_runs_started_at_idx
  on public.news_ingestion_runs (started_at desc);
create index if not exists news_ingestion_queue_source_idx
  on public.news_ingestion_queue (source_id);
create index if not exists news_ingestion_queue_article_idx
  on public.news_ingestion_queue (article_id);

create table if not exists public.news_ingestion_dispatches (
  token_hash text primary key,
  expires_at timestamptz not null
);

alter table public.news_ingestion_runs enable row level security;
alter table public.news_ingestion_dispatches enable row level security;
revoke all on public.news_ingestion_runs, public.news_ingestion_dispatches from public, anon, authenticated;
grant select, insert, update on public.news_ingestion_runs to service_role;

create or replace function public.consume_news_ingestion_dispatch(token text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with consumed as (
    delete from public.news_ingestion_dispatches d
    where d.token_hash = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(token, 'UTF8')), 'hex')
      and d.expires_at > now()
    returning 1
  )
  select exists (select 1 from consumed);
$$;

revoke all on function public.consume_news_ingestion_dispatch(text) from public, anon, authenticated;
grant execute on function public.consume_news_ingestion_dispatch(text) to service_role;
