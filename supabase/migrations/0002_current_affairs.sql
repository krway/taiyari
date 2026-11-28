create table public.current_affairs_articles (
 id uuid primary key default gen_random_uuid(),
 source_url text not null unique check (source_url ~ '^https://'),
 source_name text not null,
 published_date date not null,
 category text not null,
 title_en text not null,
 summary_en text not null,
 relevance_en text not null,
 title_hi text,
 summary_hi text,
 relevance_hi text,
 status text not null default 'draft' check (status in ('draft','published')),
 created_at timestamptz not null default now()
);
alter table public.current_affairs_articles enable row level security;
revoke all on public.current_affairs_articles from anon, authenticated;
grant select on public.current_affairs_articles to anon, authenticated;
create policy "Read published articles" on public.current_affairs_articles for select to anon, authenticated using (status = 'published');
create index current_affairs_published_date_idx on public.current_affairs_articles (published_date desc) where status = 'published';
