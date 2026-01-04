-- Create news_feed table
CREATE TABLE IF NOT EXISTS public.news_feed (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    summary text,
    image_url text,
    source_url text,
    source_name text,
    category text CHECK (category IN ('coin', 'stamp', 'general')),
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_feed ENABLE ROW LEVEL SECURITY;

-- Create Policy: Read access for everyone (authenticated & anon)
CREATE POLICY "Enable read access for all users" ON public.news_feed
    FOR SELECT
    USING (true);

-- Create Policy: Insert/Update/Delete for Service Role only (Edge Functions)
CREATE POLICY "Enable write access for service role only" ON public.news_feed
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
