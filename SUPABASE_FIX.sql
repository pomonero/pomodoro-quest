-- ================================================
-- SUPABASE GÜVENLİK VE PERFORMANS DÜZELTME SQL'İ
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- ================================================

-- 1. SECURITY DEFINER VIEW'LARI DÜZELT
-- ====================================

DROP VIEW IF EXISTS public.today_leaderboard;
CREATE VIEW public.today_leaderboard 
WITH (security_invoker = on)
AS
SELECT 
  p.username,
  p.avatar_emoji,
  p.display_name,
  p.total_sessions,
  p.total_focus_minutes
FROM profiles p
ORDER BY p.total_sessions DESC, p.total_focus_minutes DESC
LIMIT 10;

DROP VIEW IF EXISTS public.top_players;
CREATE VIEW public.top_players 
WITH (security_invoker = on)
AS
SELECT 
  p.username,
  p.avatar_emoji,
  p.display_name,
  p.total_sessions,
  p.total_focus_minutes,
  COALESCE(MAX(gs.score), 0) as best_score
FROM profiles p
LEFT JOIN game_scores gs ON p.id = gs.user_id
GROUP BY p.id, p.username, p.avatar_emoji, p.display_name, p.total_sessions, p.total_focus_minutes
ORDER BY best_score DESC
LIMIT 10;

GRANT SELECT ON public.today_leaderboard TO authenticated, anon;
GRANT SELECT ON public.top_players TO authenticated, anon;

-- 2. FONKSİYONA SEARCH_PATH EKLE
-- ==============================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, display_name, avatar_emoji, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_emoji', '😊'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. PROFILES TABLOSUNA EKSİK KOLONLAR
-- ====================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_focus_minutes INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

UPDATE public.profiles 
SET email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id)
WHERE email IS NULL;

-- 4. DUPLICATE INDEX DÜZELT
-- =========================

DROP INDEX IF EXISTS public.profiles_username_key;

-- 5. TEMİZ RLS POLİCY'LER
-- =======================

-- Mevcut policy'leri sil ve yenilerini oluştur
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (id = (SELECT auth.uid()));

-- ================================================
-- SUPABASE DASHBOARD AYARLARI:
-- 
-- 1. Authentication > URL Configuration
--    Site URL: https://www.pomonero.com
--    Redirect URLs: 
--      - https://www.pomonero.com
--      - https://www.pomonero.com?type=signup
--      - https://www.pomonero.com?type=recovery
--
-- 2. Authentication > Email Templates > Confirm signup
--    URL'yi kontrol et
--
-- 3. Authentication > Settings > Password Settings
--    "Enable leaked password protection" AÇ
-- ================================================
