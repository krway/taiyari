update public.news_sources set enabled = true where id in ('pib', 'rbi');
insert into public.news_ingestion_queue (source_id, source_url, headline, source_published_at, status)
values
  ('pib', 'https://www.pib.gov.in/headline', 'Visible headline', now() - interval '1 day', 'pending'),
  ('pib', 'https://www.pib.gov.in/rejected', 'Rejected headline', now() - interval '1 day', 'rejected'),
  ('pib', 'https://www.pib.gov.in/future', 'Future headline', now() + interval '1 day', 'pending'),
  ('pib', 'https://www.pib.gov.in.example.com/spoof', 'Wrong publisher', now() - interval '1 day', 'pending'),
  ('isro', 'https://www.isro.gov.in/disabled', 'Disabled publisher', now() - interval '1 day', 'pending'),
  ('rbi', 'https://www.rbi.org.in/published', 'Existing briefing', now() - interval '1 day', 'processed');
insert into public.current_affairs_articles
  (source_url, source_name, published_date, category, title_en, summary_en, relevance_en, status)
values ('https://www.rbi.org.in/published', 'RBI', current_date, 'Fixture', 'Title', 'Summary', 'Relevance', 'published');

set role anon;
do $$
begin
  if has_table_privilege('public.news_ingestion_queue', 'SELECT') then
    raise exception 'Queue data exposed';
  end if;
  if (select array_agg(headline) from public.official_current_affairs_headlines()) is distinct from array['Visible headline'] then
    raise exception 'Public headlines contain an invalid row';
  end if;
end;
$$;
reset role;
