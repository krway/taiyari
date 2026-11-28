-- Configure news_ingestion_endpoint in Vault before applying this migration.
-- 23:30 UTC is 05:00 IST on the following calendar day.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'news_ingestion_endpoint') then
    raise exception 'Configure the news_ingestion_endpoint Vault entry before scheduling';
  end if;
  perform cron.schedule('taiyari-news-ingestion', '30 23 * * *', 'select public.dispatch_news_ingestion()');
end;
$$;
