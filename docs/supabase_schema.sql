-- ====================================================================
-- DỰ ÁN VIVU - SUPABASE DATABASE SCHEMA (1-CLICK RUN IN SUPABASE SQL EDITOR)
-- Phiên bản V2.0 đồng bộ với Custom Circles 2-Tier & PostGIS
-- ====================================================================

-- 1. Bật Extension PostGIS (Hỗ trợ tính toán toạ độ không gian GPS)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Bảng Tài Khoản Người Dùng (Users)
CREATE TABLE IF NOT EXISTS public.users (
    id                  TEXT PRIMARY KEY,
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    user_code           VARCHAR(10) UNIQUE NOT NULL, -- VU-XXXX
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Hồ Sơ Người Dùng & Toạ Độ GPS Thật (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id                  TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    username            VARCHAR(50) UNIQUE,
    full_name           VARCHAR(100) NOT NULL,
    avatar_url          TEXT,
    bio                 TEXT DEFAULT '',
    custom_status       TEXT DEFAULT 'Đang rảnh quanh đây',
    status_icon         VARCHAR(50) DEFAULT 'bi-geo-alt',
    status_audio        TEXT,
    privacy_mode        VARCHAR(20) DEFAULT 'normal', -- 'normal', 'blurred', 'ghost'
    user_code           VARCHAR(10),
    lat                 DOUBLE PRECISION,
    lng                 DOUBLE PRECISION,
    battery             VARCHAR(10) DEFAULT '95%',
    is_online           BOOLEAN DEFAULT true,
    last_seen_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Story (Hangout Stories & Khoảnh Khắc Công Khai)
CREATE TABLE IF NOT EXISTS public.hangout_stories (
    id                  TEXT PRIMARY KEY,
    host_id             TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    user_code           VARCHAR(10),
    host_name           VARCHAR(100) NOT NULL,
    host_avatar         TEXT,
    category            VARCHAR(50) DEFAULT 'moment', -- 'moment', 'cafe', 'food', 'movie', 'sport'
    title               TEXT NOT NULL,
    description         TEXT,
    address             TEXT DEFAULT 'Quanh đây',
    planned_at          TEXT DEFAULT 'Ngay bây giờ',
    lat                 DOUBLE PRECISION NOT NULL,
    lng                 DOUBLE PRECISION NOT NULL,
    lat_offset          DOUBLE PRECISION DEFAULT 0,
    lng_offset          DOUBLE PRECISION DEFAULT 0,
    expiry_hours        INT DEFAULT 3,
    expires_at          TIMESTAMP WITH TIME ZONE,
    image               TEXT,
    privacy             VARCHAR(20) DEFAULT 'public', -- 'public', 'friends'
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bảng Nhóm Tùy Chỉnh (Custom Circles V2.0 - Phân quyền 2 tầng)
CREATE TABLE IF NOT EXISTS public.custom_circles (
    id                  TEXT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    description         TEXT DEFAULT '',
    privacy             VARCHAR(20) DEFAULT 'private',
    icon                VARCHAR(50) DEFAULT 'bi-people',
    color               VARCHAR(30) DEFAULT 'neon-cyan',
    owner_id            TEXT NOT NULL,
    members             JSONB DEFAULT '[]'::jsonb, -- [{ user_id, role, status, joined_at }]
    member_ids          TEXT[] DEFAULT '{}',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Bảng Lời Mời Kết Bạn (Friend Requests)
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id                  TEXT PRIMARY KEY,
    sender_id           TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status              VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Bảng Quan Hệ Bạn Bè (Friendships)
CREATE TABLE IF NOT EXISTS public.friendships (
    id                  TEXT PRIMARY KEY,
    user_a_id           TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_b_id           TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Bảng Tin Nhắn (Messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id                  TEXT PRIMARY KEY,
    conversation_id     TEXT NOT NULL,
    sender              TEXT NOT NULL,
    sender_name         VARCHAR(100) NOT NULL,
    sender_avatar       TEXT,
    text                TEXT NOT NULL,
    media_url           TEXT,
    timestamp           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Bảng Thông Báo (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id                  TEXT PRIMARY KEY,
    user_id             TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type                VARCHAR(50) NOT NULL,
    title               VARCHAR(200) NOT NULL,
    body                TEXT NOT NULL,
    data                JSONB DEFAULT '{}'::jsonb,
    is_read             BOOLEAN DEFAULT false,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- CHỈ MỤC TỐI ƯU HÓA TRUY VẤN
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_custom_circles_owner ON public.custom_circles(owner_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_friend_reqs_lookup ON public.friend_requests(receiver_id, status);

-- ====================================================================
-- BẬT SUPABASE REALTIME PUB/SUB
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.hangout_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_circles;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hangout_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all modify profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow public read stories" ON public.hangout_stories FOR SELECT USING (true);
CREATE POLICY "Allow insert stories" ON public.hangout_stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow circles management" ON public.custom_circles FOR ALL USING (true);
CREATE POLICY "Allow user notifications" ON public.notifications FOR ALL USING (true);
