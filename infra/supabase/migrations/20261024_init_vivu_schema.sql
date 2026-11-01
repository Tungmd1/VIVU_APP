-- ====================================================================
-- DỰ ÁN VIVU - SUPABASE DATABASE SCHEMA MIGRATION
-- ====================================================================

-- 1. Bật Extension PostGIS (Hỗ trợ tính toán toạ độ không gian GPS)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Bảng Hồ Sơ Người Dùng & Toạ Độ GPS Thật
CREATE TABLE IF NOT EXISTS public.profiles (
    id                  TEXT PRIMARY KEY,
    full_name           VARCHAR(100) NOT NULL,
    avatar_url          TEXT,
    custom_status       TEXT DEFAULT 'Đang rảnh quanh đây',
    lat                 DOUBLE PRECISION,
    lng                 DOUBLE PRECISION,
    battery             VARCHAR(10) DEFAULT '90%',
    last_seen_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Story (Hangout Stories & Khoảnh Khắc Công Khai)
CREATE TABLE IF NOT EXISTS public.hangout_stories (
    id                  TEXT PRIMARY KEY,
    host_name           VARCHAR(100) NOT NULL,
    host_avatar         TEXT,
    category            VARCHAR(50) DEFAULT 'moment',     -- 'moment', 'cafe', 'food', 'movie', 'sport'
    title               TEXT NOT NULL,
    description         TEXT,
    address             TEXT,
    planned_at          TEXT,
    lat                 DOUBLE PRECISION,
    lng                 DOUBLE PRECISION,
    lat_offset          DOUBLE PRECISION DEFAULT 0,
    lng_offset          DOUBLE PRECISION DEFAULT 0,
    expires_in          VARCHAR(50) DEFAULT 'Còn 3 giờ',
    image               TEXT,
    privacy             VARCHAR(20) DEFAULT 'public',     -- 'public', 'friends'
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Tin Nhắn (Messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id                  TEXT PRIMARY KEY,
    conversation_id     TEXT NOT NULL,
    sender              VARCHAR(20) NOT NULL,             -- 'me' hoặc 'them'
    sender_name         VARCHAR(100) NOT NULL,
    text                TEXT,
    image               TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bảng Nhóm Tự Tạo (Custom Circles)
CREATE TABLE IF NOT EXISTS public.custom_circles (
    id                  TEXT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    image               TEXT,
    member_ids          TEXT[] DEFAULT '{}',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BẬT SUPABASE REALTIME PUB/SUB CHO CÁC BẢNG QUAN TRỌNG
ALTER PUBLICATION supabase_realtime ADD TABLE public.hangout_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- BẬT ROW LEVEL SECURITY (RLS) - Cho phép đọc/ghi công khai cho phiên demo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hangout_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc profiles công khai" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Cho phép cập nhật profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Cho phép đọc stories công khai" ON public.hangout_stories FOR SELECT USING (true);
CREATE POLICY "Cho phép tạo stories công khai" ON public.hangout_stories FOR INSERT WITH CHECK (true);

CREATE POLICY "Cho phép đọc messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Cho phép gửi messages" ON public.messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Cho phép quản lý circles" ON public.custom_circles FOR ALL USING (true);
