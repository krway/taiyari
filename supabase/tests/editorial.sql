insert into auth.users (id) values ('10000000-0000-0000-0000-000000000001');
insert into public.news_editors (user_id) values ('10000000-0000-0000-0000-000000000001');
insert into public.news_ingestion_queue (id, source_id, source_url, headline)
values ('20000000-0000-0000-0000-000000000001', 'pib', 'https://pib.gov.in/test-fixture', 'Fixture');

set role authenticated;
do $$
begin
  if public.is_news_editor() then raise exception 'Unexpected editor'; end if;
  begin
    perform public.news_editor_queue();
    raise exception 'Ordinary user saw the editorial queue';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.edit_news_article('20000000-0000-0000-0000-000000000001', 'reject', '{}');
    raise exception 'Ordinary user edited the editorial queue';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', false);

do $$
declare
  candidate uuid := '20000000-0000-0000-0000-000000000001';
  content jsonb := '{"published_date":"2026-01-01","category":"Railway","title_en":"Fixture","summary_en":"Fixture summary","relevance_en":"Fixture relevance","title_hi":"शीर्षक","summary_hi":"सारांश","relevance_hi":"महत्त्व"}';
begin
  if not public.is_news_editor() then raise exception 'Missing editor role'; end if;
  if (select count(*) from public.news_editor_queue()) <> 1 then raise exception 'Missing queue item'; end if;
  begin
    perform public.edit_news_article(candidate, 'publish', content - 'title_hi');
    raise exception 'Missing translation accepted';
  exception when invalid_parameter_value then null;
  end;
  perform public.edit_news_article(candidate, 'save', content);
  if exists (select from public.current_affairs_articles) then raise exception 'Draft leaked'; end if;
  perform public.edit_news_article(candidate, 'publish', content);
  if (select count(*) from public.current_affairs_articles) <> 1 then raise exception 'Published article missing'; end if;
  perform public.edit_news_article(candidate, 'unpublish', '{}');
  if exists (select from public.current_affairs_articles) then raise exception 'Unpublished article leaked'; end if;
  perform public.edit_news_article(candidate, 'reject', '{}');
  if (select queue_status from public.news_editor_queue()) <> 'rejected' then raise exception 'Rejection missing'; end if;
end;
$$;

reset role;
do $$
begin
  if (select count(*) from public.news_editorial_audit) <> 4 then raise exception 'Editorial audit incomplete'; end if;
  if has_function_privilege('anon','public.news_editor_queue()','EXECUTE') then raise exception 'Anonymous editor queue access'; end if;
end;
$$;
