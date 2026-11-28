create index if not exists news_ingestion_public_headlines_idx
  on public.news_ingestion_queue (source_published_at desc, id)
  where source_published_at is not null and status <> 'rejected';

create or replace function public.official_current_affairs_headlines()
returns table (source_name text, source_url text, headline text, published_at timestamptz)
language sql stable security definer
set search_path = ''
as $$
  select s.name, q.source_url, q.headline, q.source_published_at
  from public.news_ingestion_queue q
  join public.news_sources s on s.id = q.source_id and s.enabled
  where q.status <> 'rejected'
    and q.source_published_at <= now()
    and (
      (s.id = 'pib' and q.source_url ~ '^https://(www\.)?pib\.gov\.in/')
      or (s.id = 'rbi' and q.source_url ~ '^https://((www|website)\.)?rbi\.org\.in/')
    )
    and not exists (
      select 1 from public.current_affairs_articles a
      where a.source_url = q.source_url and a.status = 'published'
    )
  order by q.source_published_at desc, q.id
  limit 20;
$$;

revoke all on function public.official_current_affairs_headlines() from public;
grant execute on function public.official_current_affairs_headlines() to anon, authenticated;
