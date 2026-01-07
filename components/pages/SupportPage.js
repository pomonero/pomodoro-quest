'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function SupportPage() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;
  const [openFAQ, setOpenFAQ] = useState(null);
  const [openGuide, setOpenGuide] = useState(null);

  const faqs = [
    { q: t.supportQ1, a: t.supportA1 },
    { q: t.supportQ2, a: t.supportA2 },
    { q: t.supportQ3, a: t.supportA3 },
    { 
      q: language === 'tr' ? 'Tema ve dil nasıl değiştirilir?' : 'How to change theme and language?',
      a: language === 'tr' 
        ? 'Sağ üst köşedeki bayrak ikonuna tıklayarak dili, yanındaki emoji ikonuna tıklayarak temayı değiştirebilirsiniz.' 
        : 'Click the flag icon in the top right to change language, and the emoji icon next to it to change theme.'
    },
    { 
      q: language === 'tr' ? 'Verilerim kaybolur mu?' : 'Will I lose my data?',
      a: language === 'tr' 
        ? 'Hayır! Tüm verileriniz güvenli bir şekilde bulutta saklanır ve hesabınıza giriş yaptığınız her cihazdan erişebilirsiniz.' 
        : 'No! All your data is stored securely in the cloud and you can access it from any device when you log in.'
    },
    { 
      q: language === 'tr' ? 'Uygulama ücretsiz mi?' : 'Is the app free?',
      a: language === 'tr' 
        ? 'Evet, Pomonero tamamen ücretsizdir ve tüm özellikler herkes için açıktır.' 
        : 'Yes, Pomonero is completely free and all features are available to everyone.'
    },
  ];

  const guides = [
    { 
      id: 'getting-started',
      icon: '🚀', 
      title: t.guideGettingStarted,
      desc: t.guideGettingStartedDesc,
      content: language === 'tr' ? `
**Pomonero'ya Hoş Geldiniz! 🎉**

1. **Hesap Oluşturun**: E-posta adresiniz ve şifrenizle kayıt olun.

2. **Timer'ı Başlatın**: Ana sayfadaki "Başlat" butonuna tıklayın.

3. **25 Dakika Odaklanın**: Pomodoro tekniği ile çalışın.

4. **Mola Verin**: Her oturumdan sonra kısa mola alın.

5. **Oyun Oynayın**: Her 4 oturumdan sonra oyun ödülü kazanın!

**İpucu**: Bildirimlerinizi açık tutun, böylece mola zamanını kaçırmazsınız.
      ` : `
**Welcome to Pomonero! 🎉**

1. **Create Account**: Sign up with your email and password.

2. **Start Timer**: Click the "Start" button on the main page.

3. **Focus for 25 Minutes**: Work using the Pomodoro technique.

4. **Take Breaks**: Take short breaks after each session.

5. **Play Games**: Earn game rewards after every 4 sessions!

**Tip**: Keep notifications on so you don't miss break time.
      `
    },
    { 
      id: 'timer',
      icon: '⏱️', 
      title: t.guideTimer,
      desc: t.guideTimerDesc,
      content: language === 'tr' ? `
**Timer Kullanımı ⏱️**

**Oturum Türleri:**
- 🎯 **Odaklanma**: 25 dakika çalışma (özelleştirilebilir)
- ☕ **Kısa Mola**: 5 dakika dinlenme
- 🌴 **Uzun Mola**: 15-30 dakika (4 oturumdan sonra)

**Ayarları Özelleştirme:**
1. Sağ üstteki profil ikonuna tıklayın
2. "Ayarlar" seçeneğini seçin
3. Süreleri slider ile ayarlayın
4. Hazır şablonlardan birini seçebilirsiniz

**Hazır Şablonlar:**
- Klasik: 25/5/30
- Kısa: 15/3/15
- Uzun: 50/10/30
- 52/17: Bilimsel çalışmalarla desteklenen yöntem
      ` : `
**Using the Timer ⏱️**

**Session Types:**
- 🎯 **Focus**: 25 minutes work (customizable)
- ☕ **Short Break**: 5 minutes rest
- 🌴 **Long Break**: 15-30 minutes (after 4 sessions)

**Customizing Settings:**
1. Click profile icon in top right
2. Select "Settings"
3. Adjust durations with sliders
4. Choose from preset templates

**Presets:**
- Classic: 25/5/30
- Short: 15/3/15
- Long: 50/10/30
- 52/17: Scientifically backed method
      `
    },
    { 
      id: 'games',
      icon: '🎮', 
      title: t.guideGames,
      desc: t.guideGamesDesc,
      content: language === 'tr' ? `
**Mini Oyunlar Rehberi 🎮**

**Oyun Açma:**
- Her odaklanma oturumu sonunda oyun hakkı kazanırsınız
- Mola sırasında oynamanız önerilir

**Oyunlar:**

🚀 **Uzay Koşucusu**
- SPACE veya ↑ ile zıpla
- Asteroidlerden kaçın

🐸 **Platform Atlama**
- ← → ile hareket et
- Otomatik zıplama
- Düşmeden yukarı çık

⭐ **Yıldız Avcısı**
- ← → ile hareket et
- Yıldızları topla
- Bombalardan kaçın

💨 **Labirent Kaçışı**
- ↑↓←→ ile hareket et
- Kırmızı bloklardan kaç

🧗 **Gökyüzü Tırmanıcısı**
- ← → ile hareket et
- Platformlara atla
- Düşme!

**İpucu**: ESC ile istediğiniz zaman çıkabilirsiniz.
      ` : `
**Mini Games Guide 🎮**

**Unlocking Games:**
- Earn game access after each focus session
- Best played during breaks

**Games:**

🚀 **Space Runner**
- SPACE or ↑ to jump
- Dodge asteroids

🐸 **Platform Jump**
- ← → to move
- Auto-jump
- Climb without falling

⭐ **Star Catcher**
- ← → to move
- Collect stars
- Avoid bombs

💨 **Maze Escape**
- ↑↓←→ to move
- Escape red blocks

🧗 **Sky Climber**
- ← → to move
- Jump on platforms
- Don't fall!

**Tip**: Press ESC to exit anytime.
      `
    },
    { 
      id: 'stats',
      icon: '📊', 
      title: t.guideStats,
      desc: t.guideStatsDesc,
      content: language === 'tr' ? `
**İstatistikler Rehberi 📊**

**Takip Edilen Veriler:**
- 🎯 Günlük tamamlanan oturumlar
- 📊 Toplam oturum sayısı
- ⏱️ Toplam odaklanma saati
- 🏆 En yüksek oyun skoru

**Seviye Sistemi:**
- Her oturum sizi bir sonraki seviyeye yaklaştırır
- Seviyeniz arttıkça unvanınız değişir:
  - Seviye 1: Çaylak
  - Seviye 2: Öğrenci
  - Seviye 3: Çalışkan
  - Seviye 4: Uzman
  - Seviye 5+: Usta ve üstü

**Günlük Hedef:**
- Profilinizden günlük hedef belirleyin
- İlerleme çubuğunda takip edin
- Hedefe ulaşınca kutlama!

**Takvim:**
- Yeşil renkler aktivite yoğunluğunu gösterir
- Geçmiş günlere tıklayarak detay görün
      ` : `
**Statistics Guide 📊**

**Tracked Data:**
- 🎯 Daily completed sessions
- 📊 Total session count
- ⏱️ Total focus hours
- 🏆 Highest game score

**Level System:**
- Each session brings you closer to next level
- Your title changes as you level up:
  - Level 1: Rookie
  - Level 2: Student
  - Level 3: Worker
  - Level 4: Expert
  - Level 5+: Master and beyond

**Daily Goal:**
- Set daily goal in your profile
- Track progress in the progress bar
- Celebrate when reached!

**Calendar:**
- Green colors show activity intensity
- Click past days to see details
      `
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-6">
          <span className="text-4xl">❓</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          {t.supportTitle}
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' ? 'Size nasıl yardımcı olabiliriz?' : 'How can we help you?'}
        </p>
      </div>

      {/* Quick Guides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {guides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setOpenGuide(openGuide === guide.id ? null : guide.id)}
            className={`card p-4 text-center cursor-pointer transition-all ${
              openGuide === guide.id ? 'ring-2 ring-[var(--primary)]' : 'hover:border-[var(--primary)]'
            }`}
          >
            <span className="text-3xl mb-2 block">{guide.icon}</span>
            <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>
              {guide.title}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {guide.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Expanded Guide */}
      {openGuide && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{guides.find(g => g.id === openGuide)?.icon}</span>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {guides.find(g => g.id === openGuide)?.title}
              </h2>
            </div>
            <button
              onClick={() => setOpenGuide(null)}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)]"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>
          <div 
            className="prose prose-sm max-w-none"
            style={{ color: 'var(--text)' }}
          >
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed" style={{ background: 'transparent' }}>
              {guides.find(g => g.id === openGuide)?.content}
            </pre>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <span>💡</span> {t.supportFAQ}
        </h2>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--surface)' }}
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--surface-hover)] transition-colors"
              >
                <span className="font-medium" style={{ color: 'var(--text)' }}>
                  {faq.q}
                </span>
                <svg 
                  className={`w-5 h-5 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFAQ === index && (
                <div className="px-4 pb-4">
                  <p style={{ color: 'var(--text-muted)' }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mt-8 text-center">
        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' ? 'Cevabınızı bulamadınız mı?' : "Couldn't find your answer?"}
        </p>
        <button 
          onClick={() => useStore.getState().setCurrentPage('contact')}
          className="btn-primary"
        >
          📧 {t.contactTitle}
        </button>
      </div>
    </div>
  );
}
