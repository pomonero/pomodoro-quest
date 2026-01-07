-- =====================================================
-- POMONERO - PROFİL ALANLARI GÜNCELLEMESİ
-- Bu kodu Supabase SQL Editor'da çalıştır
-- =====================================================

-- Profiles tablosuna yeni alanlar ekle
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS subjects TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS study_goal INTEGER DEFAULT 8;

-- Success mesajı
SELECT 'Profil alanları başarıyla eklendi!' as message;
