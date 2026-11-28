create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create or replace function public.dispatch_news_ingestion()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  endpoint text;
  token text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
begin
  select decrypted_secret into endpoint
    from vault.decrypted_secrets where name = 'news_ingestion_endpoint';
  if endpoint is null or endpoint !~ '^https://[a-z0-9]{20}\.supabase\.co/functions/v1/ingest-news$' then
    raise exception 'News ingestion endpoint is missing or invalid';
  end if;
  delete from public.news_ingestion_dispatches where expires_at <= now();
  insert into public.news_ingestion_dispatches (token_hash, expires_at)
    values (encode(sha256(convert_to(token, 'UTF8')), 'hex'), now() + interval '2 minutes');
  return net.http_post(
    url := endpoint,
    headers := jsonb_build_object('X-Ingestion-Dispatch', token, 'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 100000
  );
end;
$$;

revoke all on function public.dispatch_news_ingestion() from public, anon, authenticated, service_role;
