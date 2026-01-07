-- =====================================================
-- POMONERO V2 - VERİTABANI GÜNCELLEMESİ
-- Bu SQL'i Supabase SQL Editor'da çalıştır
-- =====================================================

-- 1. Profiles tablosuna yeni alanlar ekle
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS subjects TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS study_goal INTEGER DEFAULT 8;

-- 2. User Settings tablosu (eğer yoksa)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  work_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  long_break_duration INTEGER DEFAULT 30,
  sound_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'midnight',
  language TEXT DEFAULT 'tr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. RLS politikaları
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Başarılı
SELECT 'Veritabanı başarıyla güncellendi!' as message;
