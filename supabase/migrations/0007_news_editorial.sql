create table if not exists public.news_editors (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.news_editorial_audit (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references public.news_ingestion_queue(id),
  editor_id uuid,
  action text not null check (action in ('save', 'publish', 'unpublish', 'reject')),
  occurred_at timestamptz not null default now()
);

create index if not exists news_editorial_audit_queue_idx
  on public.news_editorial_audit(queue_id, occurred_at desc);

alter table public.news_editors enable row level security;
alter table public.news_editorial_audit enable row level security;
revoke all on public.news_editors, public.news_editorial_audit from public, anon, authenticated, service_role;

create or replace function public.is_news_editor()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.news_editors where user_id = (select auth.uid()));
$$;

revoke all on function public.is_news_editor() from public, anon;
grant execute on function public.is_news_editor() to authenticated;

create or replace function public.news_editor_queue()
returns table (
  id uuid, headline text, source_url text, source_day date, queue_status text, draft jsonb
)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if not public.is_news_editor() then
    raise exception 'Editor access required' using errcode = '42501';
  end if;
  return query
    select q.id, q.headline, q.source_url, (q.source_published_at at time zone 'Asia/Kolkata')::date,
           q.status, to_jsonb(a)
    from public.news_ingestion_queue q
    left join public.current_affairs_articles a on a.id=q.article_id
    order by q.collected_at desc, q.id
    limit 50;
end;
$$;

revoke all on function public.news_editor_queue() from public, anon;
grant execute on function public.news_editor_queue() to authenticated;

create or replace function public.edit_news_article(queue_id uuid, action text, fields jsonb)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  candidate public.news_ingestion_queue;
  next_article uuid;
  publisher text;
  field text;
begin
  if not public.is_news_editor() then
    raise exception 'Editor access required' using errcode = '42501';
  end if;
  if action is null or action not in ('save', 'publish', 'unpublish', 'reject') then
    raise exception 'Invalid editorial action' using errcode = '22023';
  end if;
  select * into strict candidate from public.news_ingestion_queue q where q.id=queue_id for update;

  if action in ('save', 'publish') then
    foreach field in array array['published_date', 'category', 'title_en', 'summary_en', 'relevance_en',
                                  'title_hi', 'summary_hi', 'relevance_hi']
    loop
      if jsonb_typeof(fields->field) is distinct from 'string'
         or length(btrim(fields->>field)) not between 1 and
           (case when field like 'summary_%' then 2000 when field like 'relevance_%' then 1000 else 200 end)
      then
        raise exception 'Invalid article field: %', field using errcode = '22023';
      end if;
    end loop;
    if fields->>'published_date' !~ '^\d{4}-\d{2}-\d{2}$'
       or (fields->>'published_date')::date > (now() at time zone 'Asia/Kolkata')::date then
      raise exception 'Invalid publication date' using errcode = '22023';
    end if;
    select name into strict publisher from public.news_sources where id=candidate.source_id;
    insert into public.current_affairs_articles(
      source_url, source_name, published_date, category, title_en, summary_en, relevance_en,
      title_hi, summary_hi, relevance_hi, status
    ) values (
      candidate.source_url, publisher, (fields->>'published_date')::date, btrim(fields->>'category'),
      btrim(fields->>'title_en'), btrim(fields->>'summary_en'), btrim(fields->>'relevance_en'),
      btrim(fields->>'title_hi'), btrim(fields->>'summary_hi'), btrim(fields->>'relevance_hi'),
      case when action='publish' then 'published' else 'draft' end
    ) on conflict (source_url) do update set
      published_date=excluded.published_date, category=excluded.category, title_en=excluded.title_en,
      summary_en=excluded.summary_en, relevance_en=excluded.relevance_en, title_hi=excluded.title_hi,
      summary_hi=excluded.summary_hi, relevance_hi=excluded.relevance_hi, status=excluded.status
    where current_affairs_articles.id=candidate.article_id
      and (action='publish' or current_affairs_articles.status='draft')
    returning id into next_article;
    if next_article is null then
      raise exception 'Unpublish the briefing before saving it as a draft' using errcode = '22023';
    end if;
    update public.news_ingestion_queue
      set article_id=next_article, status=case when action='publish' then 'processed' else 'review' end
      where id=candidate.id;
  else
    if action='unpublish' and candidate.status <> 'processed' then
      raise exception 'Only a published briefing can be unpublished' using errcode = '22023';
    end if;
    update public.current_affairs_articles set status='draft' where id=candidate.article_id;
    update public.news_ingestion_queue set status=case when action='reject' then 'rejected' else 'review' end
      where id=candidate.id;
  end if;

  insert into public.news_editorial_audit(queue_id, editor_id, action)
    values (candidate.id, (select auth.uid()), action);
end;
$$;

revoke all on function public.edit_news_article(uuid, text, jsonb) from public, anon;
grant execute on function public.edit_news_article(uuid, text, jsonb) to authenticated;
