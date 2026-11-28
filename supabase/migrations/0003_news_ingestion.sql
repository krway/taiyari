create table public.news_sources (
 id text primary key,
 name text not null,
 homepage_url text not null check (homepage_url ~ '^https://'),
 feed_url text check (feed_url ~ '^https://'),
 enabled boolean not null default false
);
insert into public.news_sources(id,name,homepage_url) values
 ('pib','Press Information Bureau','https://pib.gov.in/'),
 ('rbi','Reserve Bank of India','https://www.rbi.org.in/'),
 ('isro','Indian Space Research Organisation','https://www.isro.gov.in/');
create table public.news_ingestion_queue (
 id uuid primary key default gen_random_uuid(),
 source_id text not null references public.news_sources(id),
 source_url text not null unique check (source_url ~ '^https://'),
 headline text not null,
 source_published_at timestamptz,
 collected_at timestamptz not null default now(),
 status text not null default 'pending' check(status in ('pending','review','processed','rejected')),
 article_id uuid references public.current_affairs_articles(id)
);
alter table public.news_sources enable row level security;
alter table public.news_ingestion_queue enable row level security;
revoke all on public.news_sources,public.news_ingestion_queue from anon,authenticated;
