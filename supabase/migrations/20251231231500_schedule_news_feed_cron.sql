-- Enable the pg_cron extension
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule the cron job (upsert behavior: updates if exists)
select cron.schedule(
    'generate-news-feed-every-6-hours',
    '0 */6 * * *', 
    $$
    select
        net.http_post(
            url:='https://ghwrdlymovztccdadvxl.supabase.co/functions/v1/generate-news-feed',
            headers:='{"Content-Type": "application/json"}'::jsonb,
            body:='{}'::jsonb
        ) as request_id;
    $$
);
