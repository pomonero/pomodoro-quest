-- ================================================
-- SUPABASE DÜZELTME SQL'İ
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- ================================================

-- 1. VIEW'LARI YENİDEN OLUŞTUR
-- ===================================

DROP VIEW IF EXISTS public.today_leaderboard CASCADE;
DROP VIEW IF EXISTS public.top_players CASCADE;

CREATE VIEW public.today_leaderboard 
WITH (security_invoker = on)
AS
SELECT 
  p.id,
  p.username,
  p.avatar_emoji,
  p.display_name
FROM profiles p
ORDER BY p.created_at DESC
LIMIT 10;

CREATE VIEW public.top_players 
WITH (security_invoker = on)
AS
SELECT 
  p.id,
  p.username,
  p.avatar_emoji,
  p.display_name,
  COALESCE(MAX(gs.score), 0) as best_score
FROM profiles p
LEFT JOIN game_scores gs ON p.id = gs.user_id
GROUP BY p.id, p.username, p.avatar_emoji, p.display_name
ORDER BY best_score DESC
LIMIT 10;

GRANT SELECT ON public.today_leaderboard TO authenticated, anon;
GRANT SELECT ON public.top_players TO authenticated, anon;

-- 2. PROFILES TABLOSU KOLON EKSİKLERİ
-- ====================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Email'leri güncelle
UPDATE public.profiles 
SET email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id)
WHERE email IS NULL;

-- 3. FONKSİYON DÜZELT
-- ==================

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
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger oluştur (yoksa)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS POLİCY DÜZELT
-- ====================

-- Profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "Herkes profilleri görebilir" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Kullanıcılar kendi profilini düzenleyebilir" ON public.profiles;
DROP POLICY IF EXISTS "Yeni kullanıcı profil oluşturabilir" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (id = (SELECT auth.uid()));

-- RLS aktif mi kontrol et
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TAMAMLANDI!
-- ================================================


/*
================================================
SUPABASE DASHBOARD AYARLARI
================================================

1. Authentication > URL Configuration
   - Site URL: https://www.pomonero.com
   - Redirect URLs:
     * https://www.pomonero.com
     * https://www.pomonero.com?type=signup
     * https://www.pomonero.com?type=recovery

2. Authentication > Email Templates > Confirm signup

Subject: Pomonero'ya Hoş Geldiniz! 🍅 E-postanızı Doğrulayın

Body (HTML):
---
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
    .logo { text-align: center; font-size: 48px; margin-bottom: 16px; }
    h1 { color: #f8fafc; text-align: center; margin: 0 0 8px 0; }
    .subtitle { color: #94a3b8; text-align: center; margin-bottom: 24px; }
    .features { background: #334155; border-radius: 12px; padding: 16px; margin: 24px 0; }
    .feature { display: flex; align-items: center; gap: 12px; padding: 8px 0; color: #e2e8f0; }
    .btn { display: block; background: linear-gradient(135deg, #6366f1, #ec4899); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; text-align: center; font-weight: bold; font-size: 16px; margin: 24px 0; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🍅</div>
    <h1>Pomonero'ya Hoş Geldiniz!</h1>
    <p class="subtitle">Hesabınızı doğrulamak için aşağıdaki butona tıklayın</p>
    
    <div class="features">
      <div class="feature">🎯 Pomodoro Tekniği ile Odaklanma</div>
      <div class="feature">📚 TYT/AYT Sınav Modları</div>
      <div class="feature">🎮 Mola Oyunları</div>
      <div class="feature">📊 Detaylı İstatistikler</div>
      <div class="feature">🏆 Liderlik Tablosu</div>
    </div>
    
    <a href="{{ .ConfirmationURL }}" class="btn">✅ E-postamı Doğrula</a>
    
    <p style="color: #94a3b8; text-align: center; font-size: 14px;">
      Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
    </p>
    
    <div class="footer">
      © 2026 Pomonero | Türkiye'de yapıldı 🇹🇷
    </div>
  </div>
</body>
</html>
---

3. Authentication > Email Templates > Reset password

Subject: Pomonero Şifre Sıfırlama 🔐

Body (HTML):
---
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
    .logo { text-align: center; font-size: 48px; margin-bottom: 16px; }
    h1 { color: #f8fafc; text-align: center; margin: 0 0 8px 0; }
    .subtitle { color: #94a3b8; text-align: center; margin-bottom: 24px; }
    .btn { display: block; background: linear-gradient(135deg, #6366f1, #ec4899); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; text-align: center; font-weight: bold; font-size: 16px; margin: 24px 0; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🔐</div>
    <h1>Şifre Sıfırlama</h1>
    <p class="subtitle">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın</p>
    
    <a href="{{ .ConfirmationURL }}" class="btn">🔑 Şifremi Sıfırla</a>
    
    <p style="color: #94a3b8; text-align: center; font-size: 14px;">
      Bu link 24 saat geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.
    </p>
    
    <div class="footer">
      © 2026 Pomonero | Türkiye'de yapıldı 🇹🇷
    </div>
  </div>
</body>
</html>
---

4. Authentication > Settings
   - Password Settings > "Enable protection against leaked passwords" AÇ

================================================
*/
