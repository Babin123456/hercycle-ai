-- forum_categories table
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- forum_posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    author_alias TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- forum_comments table
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_alias TEXT NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- forum_votes table (to prevent multiple votes by same user on same item)
CREATE TABLE IF NOT EXISTS public.forum_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Hashed clerk ID
    item_type TEXT NOT NULL CHECK (item_type IN ('post', 'comment')),
    item_id UUID NOT NULL,
    vote_value INTEGER NOT NULL CHECK (vote_value IN (1, -1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- Enable Realtime for posts and comments
BEGIN;
  -- remove the supabase_realtime publication
  DROP PUBLICATION IF EXISTS supabase_realtime;
  -- re-create the publication
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;

-- Insert default categories
INSERT INTO public.forum_categories (name, slug, description)
VALUES 
    ('PCOD Advice', 'pcod-advice', 'Share tips and ask questions about managing PCOD.'),
    ('Cycle Tracking', 'cycle-tracking', 'Discuss period tracking, ovulation, and cycle irregularities.'),
    ('Mental Health', 'mental-health', 'A safe space to talk about emotional well-being and stress.'),
    ('General Discussion', 'general-discussion', 'Talk about anything else related to women''s health.')
ON CONFLICT (slug) DO NOTHING;
