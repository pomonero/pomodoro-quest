# 🍅 Pomodoro Quest

Çalış, Oyna, Kazan! - Gamified Pomodoro Timer

![Pomodoro Quest](https://via.placeholder.com/800x400/1a1a2e/22d3ee?text=POMODORO+QUEST)

## ✨ Özellikler

- 🍅 **Klasik Pomodoro Timer** - 25dk çalışma + 5dk mola (özelleştirilebilir)
- 🎮 **5 Mini Oyun** - Her pomodoro bitişinde oyun ödülü
- 🏆 **Liderlik Tablosu** - Diğer oyuncularla yarış
- 👤 **Kullanıcı Sistemi** - Kayıt/giriş ile ilerlemeyi kaydet
- 🌙 **Açık/Koyu Mod** - Neon temalı pixel art tasarım
- 📊 **İstatistikler** - Toplam pomodoro, odaklanma süresi, en yüksek skor
- 📱 **Responsive** - Mobil uyumlu tasarım

## 🚀 Kurulum

### Adım 1: Supabase Hesabı Oluştur

1. [supabase.com](https://supabase.com) adresine git
2. GitHub ile giriş yap
3. "New Project" tıkla
4. Proje bilgilerini gir:
   - **Name:** pomodoro-quest
   - **Database Password:** Güçlü bir şifre (not al!)
   - **Region:** Frankfurt (Türkiye'ye yakın)
5. "Create new project" tıkla

### Adım 2: Veritabanını Kur

1. Sol menüden **SQL Editor** seç
2. `supabase-schema.sql` dosyasındaki tüm kodu yapıştır
3. **Run** butonuna bas
4. "Success" mesajını gör

### Adım 3: API Anahtarlarını Al

1. Sol menüden **Settings** > **API** git
2. Şu değerleri kopyala:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Adım 4: Projeyi İndir ve Kur

```bash
# Projeyi indir (veya GitHub'dan clone et)
cd pomodoro-quest

# Bağımlılıkları yükle
npm install

# .env.local dosyası oluştur
cp .env.local.example .env.local

# .env.local dosyasını düzenle ve Supabase anahtarlarını ekle
```

### Adım 5: Lokalde Çalıştır

```bash
npm run dev
```

Tarayıcıda aç: [http://localhost:3000](http://localhost:3000)

## 🌐 Vercel'e Deploy Etme

### Adım 1: GitHub'a Yükle

```bash
# Git başlat
git init
git add .
git commit -m "Initial commit"

# GitHub'da yeni repo oluştur, sonra:
git remote add origin https://github.com/KULLANICI_ADIN/pomodoro-quest.git
git push -u origin main
```

### Adım 2: Vercel'e Bağla

1. [vercel.com](https://vercel.com) adresine git
2. GitHub ile giriş yap
3. "Add New Project" tıkla
4. GitHub reposunu seç
5. **Environment Variables** bölümüne Supabase anahtarlarını ekle:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. "Deploy" tıkla

🎉 **Tebrikler!** Siten yayında!

## 🛡️ Güvenlik Ayarları

### Cloudflare Kurulumu (Ücretsiz DDoS Koruması)

1. [cloudflare.com](https://cloudflare.com) hesabı oluştur
2. "Add a Site" tıkla, domain'ini ekle
3. Free plan seç
4. DNS kayıtlarını güncelle (Cloudflare'in verdiği nameserver'ları domain sağlayıcına ekle)
5. SSL/TLS: "Full (strict)" seç
6. Security: "Under Attack Mode" gerektiğinde aktive et

### Supabase Güvenlik Kontrolleri

- ✅ Row Level Security (RLS) aktif
- ✅ Sadece authenticated kullanıcılar veri yazabilir
- ✅ Herkes skorları okuyabilir (liderlik için)
- ✅ Kullanıcılar sadece kendi verilerini düzenleyebilir

## 📁 Proje Yapısı

```
pomodoro-quest/
├── app/
│   ├── layout.js          # Root layout
│   ├── page.js             # Ana sayfa
│   └── globals.css         # Global stiller
├── components/
│   ├── AuthScreen.js       # Giriş/Kayıt
│   ├── Header.js           # Üst menü
│   ├── Timer.js            # Pomodoro timer
│   ├── Leaderboard.js      # Liderlik tablosu
│   ├── Stats.js            # İstatistikler
│   ├── Settings.js         # Ayarlar modal
│   ├── GameModal.js        # 5 mini oyun
│   └── AdSpace.js          # Reklam alanları
├── lib/
│   ├── supabase.js         # Supabase client
│   └── store.js            # Zustand state
├── public/
│   └── sounds/             # Ses dosyaları
├── supabase-schema.sql     # Veritabanı şeması
└── package.json
```

## 🎮 Oyunlar

| Oyun | Açıklama | Kontroller |
|------|----------|------------|
| 🏃 Runner | Engellere atlayarak koş | ↑ Zıpla |
| 🐸 Jumper | Platformlara zıpla | ← → Hareket, ↑ Zıpla |
| ⭐ Collector | Yıldızları topla | ← → Hareket |
| 💨 Dodger | Düşmanlardan kaç | ↑ ↓ ← → Hareket |
| 🧗 Climber | Yukarı tırman | ← → Hareket, ↑ Zıpla |

## 💰 Reklam Entegrasyonu

`components/AdSpace.js` dosyasında reklam kodlarını ekleyebilirsin:

```jsx
// Google AdSense örneği
<ins className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client="ca-pub-XXXXX"
  data-ad-slot="XXXXX"
  data-ad-format="auto">
</ins>
```

## 🔧 Özelleştirme

### Renkleri Değiştirme
`tailwind.config.js` dosyasında `colors.neon` altındaki değerleri değiştir.

### Yeni Oyun Ekleme
`components/GameModal.js` dosyasına yeni bir oyun fonksiyonu ekle ve `games` objesine kaydet.

### Süreleri Değiştirme
Varsayılan süreler `lib/store.js` dosyasında `settings` altında.

## 📞 Destek

Sorun mu var? Issue aç veya pull request gönder!

## 📄 Lisans

MIT License - İstediğin gibi kullan, değiştir, dağıt!

---

**Pomodoro Quest** ile verimli çalış, eğlenceli molalar geçir! 🍅🎮
