'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function SupportPage() {
  const { language } = useStore();
  const [openGuide, setOpenGuide] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const guides = [
    {
      id: 'start',
      icon: '🚀',
      title: language === 'tr' ? 'Başlangıç Rehberi' : 'Getting Started',
      content: language === 'tr' ? [
        '1. Hesap oluşturun veya giriş yapın',
        '2. Ana sayfada Pomodoro zamanlayıcısını göreceksiniz',
        '3. "Başlat" butonuna tıklayarak çalışmaya başlayın',
        '4. 25 dakikalık odaklanma süresini tamamlayın',
        '5. Mola zamanında oyun oynayarak dinlenin',
        '6. 4 oturum sonra uzun mola verin'
      ] : [
        '1. Create an account or login',
        '2. You will see the Pomodoro timer on the main page',
        '3. Click "Start" to begin working',
        '4. Complete the 25-minute focus session',
        '5. Play a game during break time to relax',
        '6. Take a long break after 4 sessions'
      ]
    },
    {
      id: 'timer',
      icon: '⏱️',
      title: language === 'tr' ? 'Zamanlayıcı Kullanımı' : 'Timer Usage',
      content: language === 'tr' ? [
        '• Odaklan (🎯): 25 dakika çalışma süresi',
        '• Kısa Mola (☕): 5 dakika dinlenme',
        '• Uzun Mola (🌴): 30 dakika dinlenme (her 4 oturumda)',
        '• Ayarlardan süreleri özelleştirebilirsiniz',
        '• Hazır şablonlar: Klasik, Kısa, Uzun, 52/17'
      ] : [
        '• Focus (🎯): 25 minutes work time',
        '• Short Break (☕): 5 minutes rest',
        '• Long Break (🌴): 30 minutes rest (every 4 sessions)',
        '• Customize durations in settings',
        '• Presets: Classic, Short, Long, 52/17'
      ]
    },
    {
      id: 'games',
      icon: '🎮',
      title: language === 'tr' ? 'Oyun Rehberi' : 'Games Guide',
      content: language === 'tr' ? [
        '🚀 Uzay Koşucusu: SPACE ile zıpla, engellerden kaç',
        '🐸 Platform Atlama: ← → ile hareket, platformlara zıpla',
        '⭐ Yıldız Avcısı: ← → ile sepeti hareket ettir',
        '💨 Labirent: Ok tuşları ile hareket, kırmızılardan kaç',
        '🧗 Tırmanıcı: ← → ile hareket, platformlara zıpla',
        '💡 İpucu: Oyunlar sadece mola zamanında açılır!'
      ] : [
        '🚀 Space Runner: SPACE to jump, avoid obstacles',
        '🐸 Platform Jump: ← → to move, jump on platforms',
        '⭐ Star Catcher: ← → to move the basket',
        '💨 Maze: Arrow keys to move, avoid reds',
        '🧗 Climber: ← → to move, jump on platforms',
        '💡 Tip: Games only unlock during break time!'
      ]
    },
    {
      id: 'stats',
      icon: '📊',
      title: language === 'tr' ? 'İstatistikler' : 'Statistics',
      content: language === 'tr' ? [
        '📈 Seviye sistemi ile ilerlemenizi takip edin',
        '🎯 Günlük hedef belirleyin (varsayılan: 8 oturum)',
        '📅 Takvimde aktivite geçmişinizi görün',
        '🏆 Liderlik tablosunda sıralamanızı kontrol edin',
        '⭐ Oyunlarda en iyi skorunuzu geçmeye çalışın'
      ] : [
        '📈 Track your progress with the level system',
        '🎯 Set daily goals (default: 8 sessions)',
        '📅 View your activity history in the calendar',
        '🏆 Check your ranking on the leaderboard',
        '⭐ Try to beat your best score in games'
      ]
    }
  ];

  const faqs = [
    {
      q: language === 'tr' ? 'Neden Pomodoro Tekniği?' : 'Why Pomodoro Technique?',
      a: language === 'tr' ? 'Pomodoro Tekniği, odaklanmayı artırır ve tükenmişliği önler. Kısa molalar beynin dinlenmesini sağlar.' : 'Pomodoro Technique increases focus and prevents burnout. Short breaks allow the brain to rest.'
    },
    {
      q: language === 'tr' ? 'Verilerim güvende mi?' : 'Is my data safe?',
      a: language === 'tr' ? 'Evet, verileriniz şifreli olarak saklanır ve üçüncü taraflarla paylaşılmaz.' : 'Yes, your data is stored encrypted and not shared with third parties.'
    },
    {
      q: language === 'tr' ? 'Oyunları nasıl açarım?' : 'How do I unlock games?',
      a: language === 'tr' ? 'Bir odaklanma oturumunu tamamladığınızda mola zamanında oyunlar otomatik açılır.' : 'When you complete a focus session, games automatically unlock during break time.'
    },
    {
      q: language === 'tr' ? 'Süreleri değiştirebilir miyim?' : 'Can I change the durations?',
      a: language === 'tr' ? 'Evet, sağ üstteki menüden Ayarlara giderek süreleri özelleştirebilirsiniz.' : 'Yes, you can customize durations by going to Settings from the top right menu.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
          <span className="text-3xl">❓</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {language === 'tr' ? 'Destek Merkezi' : 'Support Center'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' ? 'Rehberler ve sık sorulan sorular' : 'Guides and frequently asked questions'}
        </p>
      </div>

      {/* Guides */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
          📚 {language === 'tr' ? 'Rehberler' : 'Guides'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((guide) => (
            <div key={guide.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenGuide(openGuide === guide.id ? null : guide.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{guide.icon}</span>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>{guide.title}</span>
                </div>
                <span className={`transition-transform ${openGuide === guide.id ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }}>▼</span>
              </button>
              {openGuide === guide.id && (
                <div className="px-4 pb-4">
                  <div className="p-3 rounded-xl text-sm space-y-1" style={{ background: 'var(--surface)' }}>
                    {guide.content.map((line, i) => (
                      <p key={i} style={{ color: 'var(--text-muted)' }}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
          💬 {language === 'tr' ? 'Sık Sorulan Sorular' : 'FAQ'}
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <span className="font-medium" style={{ color: 'var(--text)' }}>{faq.q}</span>
                <span className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }}>▼</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
