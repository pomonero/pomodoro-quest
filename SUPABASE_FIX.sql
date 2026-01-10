-- ================================================
-- SUPABASE GÜVENLİK VE PERFORMANS DÜZELTME SQL'İ
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- ================================================

-- 1. SECURITY DEFINER VIEW'LARI DÜZELT
-- ====================================

-- today_leaderboard view'ını yeniden oluştur (SECURITY INVOKER ile)
DROP VIEW IF EXISTS public.today_leaderboard;
CREATE VIEW public.today_leaderboard 
WITH (security_invoker = on)
AS
SELECT 
  p.username,
  p.avatar_emoji,
  p.display_name,
  SUM(CASE WHEN ps.session_type = 'work' AND ps.completed = true THEN 1 ELSE 0 END) as today_sessions,
  SUM(CASE WHEN ps.session_type = 'work' AND ps.completed = true THEN ps.duration ELSE 0 END) as today_minutes
FROM profiles p
LEFT JOIN pomodoro_sessions ps ON p.id = ps.user_id 
  AND DATE(ps.completed_at) = CURRENT_DATE
GROUP BY p.id, p.username, p.avatar_emoji, p.display_name
ORDER BY today_sessions DESC, today_minutes DESC
LIMIT 10;

-- top_players view'ını yeniden oluştur (SECURITY INVOKER ile)
DROP VIEW IF EXISTS public.top_players;
CREATE VIEW public.top_players 
WITH (security_invoker = on)
AS
SELECT 
  p.username,
  p.avatar_emoji,
  p.display_name,
  COALESCE(MAX(gs.score), 0) as best_score,
  p.total_sessions,
  p.total_focus_minutes
FROM profiles p
LEFT JOIN game_scores gs ON p.id = gs.user_id
GROUP BY p.id, p.username, p.avatar_emoji, p.display_name, p.total_sessions, p.total_focus_minutes
ORDER BY best_score DESC
LIMIT 10;

-- View'lara SELECT izni ver
GRANT SELECT ON public.today_leaderboard TO authenticated, anon;
GRANT SELECT ON public.top_players TO authenticated, anon;

-- 2. FONKSİYONLARA SEARCH_PATH EKLE
-- =================================

-- handle_new_user fonksiyonunu düzelt
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

-- update_leaderboard fonksiyonunu düzelt (varsa)
CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Profil istatistiklerini güncelle
  UPDATE public.profiles
  SET 
    total_sessions = (SELECT COUNT(*) FROM public.pomodoro_sessions WHERE user_id = NEW.user_id AND completed = true AND session_type = 'work'),
    total_focus_minutes = (SELECT COALESCE(SUM(duration), 0) FROM public.pomodoro_sessions WHERE user_id = NEW.user_id AND completed = true AND session_type = 'work'),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- update_profile_stats fonksiyonunu düzelt (varsa)
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_sessions = total_sessions + 1,
    total_focus_minutes = total_focus_minutes + NEW.duration,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- 3. RLS POLİCY'LERİ OPTİMİZE ET
-- ==============================
-- auth.uid() yerine (select auth.uid()) kullan

-- profiles tablosu policy'leri
DROP POLICY IF EXISTS "Kullanıcılar kendi profilini düzenleyebilir" ON public.profiles;
CREATE POLICY "Kullanıcılar kendi profilini düzenleyebilir" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Yeni kullanıcı profil oluşturabilir" ON public.profiles;
CREATE POLICY "Yeni kullanıcı profil oluşturabilir" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- game_scores tablosu policy'leri
DROP POLICY IF EXISTS "Kullanıcılar kendi skorunu ekleyebilir" ON public.game_scores;
CREATE POLICY "Kullanıcılar kendi skorunu ekleyebilir" ON public.game_scores
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- pomodoro_sessions tablosu policy'leri
DROP POLICY IF EXISTS "Kullanıcılar kendi oturumlarını görebilir" ON public.pomodoro_sessions;
CREATE POLICY "Kullanıcılar kendi oturumlarını görebilir" ON public.pomodoro_sessions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Kullanıcılar oturum ekleyebilir" ON public.pomodoro_sessions;
CREATE POLICY "Kullanıcılar oturum ekleyebilir" ON public.pomodoro_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Kullanıcılar kendi oturumunu güncelleyebilir" ON public.pomodoro_sessions;
CREATE POLICY "Kullanıcılar kendi oturumunu güncelleyebilir" ON public.pomodoro_sessions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- user_settings tablosu - ÇOKLU POLİCY DÜZELT
DROP POLICY IF EXISTS "Kullanıcılar kendi ayarlarını görebilir" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Kullanıcılar ayar oluşturabilir" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Kullanıcılar kendi ayarlarını güncelleyebilir" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- 4. DUPLICATE INDEX DÜZELT
-- =========================
DROP INDEX IF EXISTS public.profiles_username_key;
-- profiles_username_unique indexi kalacak

-- 5. PROFILES TABLOSUNA EMAIL KOLONU (eğer yoksa)
-- ===============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Mevcut kullanıcıların email'lerini auth'dan çek
UPDATE public.profiles 
SET email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id)
WHERE email IS NULL;

-- 6. LEAKED PASSWORD PROTECTION
-- =============================
-- Bu ayar Supabase Dashboard'dan yapılır:
-- Authentication > Settings > Password Settings > "Enable protection against leaked passwords"

-- ================================================
-- SQL TAMAMLANDI
-- Şimdi Supabase Dashboard'dan:
-- 1. Authentication > Settings > Password Settings
-- 2. "Enable protection against leaked passwords" seçeneğini AÇ
-- ================================================
