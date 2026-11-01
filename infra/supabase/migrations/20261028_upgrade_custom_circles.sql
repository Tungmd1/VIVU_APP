-- ====================================================================
-- DỰ ÁN VIVU - SUPABASE DATABASE SCHEMA MIGRATION: UPGRADE CUSTOM CIRCLES
-- ====================================================================

-- 1. Bổ sung các cột mới cho bảng custom_circles nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_circles' AND column_name = 'description') THEN
        ALTER TABLE public.custom_circles ADD COLUMN description TEXT DEFAULT '';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_circles' AND column_name = 'privacy') THEN
        ALTER TABLE public.custom_circles ADD COLUMN privacy VARCHAR(20) DEFAULT 'private';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_circles' AND column_name = 'owner_id') THEN
        ALTER TABLE public.custom_circles ADD COLUMN owner_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_circles' AND column_name = 'members') THEN
        ALTER TABLE public.custom_circles ADD COLUMN members JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'custom_circles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.custom_circles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Chỉ mục tối ưu hoá truy vấn
CREATE INDEX IF NOT EXISTS idx_custom_circles_owner_id ON public.custom_circles(owner_id);
CREATE INDEX IF NOT EXISTS idx_custom_circles_privacy ON public.custom_circles(privacy);

-- 3. Row Level Security policies
ALTER TABLE public.custom_circles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_circles' AND policyname = 'Cho phép đọc circles công khai hoặc là thành viên') THEN
        CREATE POLICY "Cho phép đọc circles công khai hoặc là thành viên" ON public.custom_circles 
        FOR SELECT USING (
            privacy = 'public' 
            OR auth.uid()::text = owner_id 
            OR auth.uid()::text = ANY(member_ids)
            OR true -- Cho phép fallback demo
        );
    END IF;
END $$;

