'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function SupportPage() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;
  const [openFAQ, setOpenFAQ] = useState(null);

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
      icon: '🚀', 
      title: language === 'tr' ? 'Başlangıç Rehberi' : 'Getting Started',
      desc: language === 'tr' ? 'Pomonero\'yu nasıl kullanacağınızı öğrenin' : 'Learn how to use Pomonero'
    },
    { 
      icon: '⏱️', 
      title: language === 'tr' ? 'Timer Kullanımı' : 'Using the Timer',
      desc: language === 'tr' ? 'Pomodoro sayacını özelleştirin' : 'Customize the Pomodoro timer'
    },
    { 
      icon: '🎮', 
      title: language === 'tr' ? 'Oyun Rehberi' : 'Game Guide',
      desc: language === 'tr' ? 'Mini oyunlar hakkında ipuçları' : 'Tips about mini games'
    },
    { 
      icon: '📊', 
      title: language === 'tr' ? 'İstatistikler' : 'Statistics',
      desc: language === 'tr' ? 'İlerlemenizi takip edin' : 'Track your progress'
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
        {guides.map((guide, index) => (
          <div 
            key={index}
            className="card p-4 text-center cursor-pointer hover:border-[var(--primary)] transition-all"
          >
            <span className="text-3xl mb-2 block">{guide.icon}</span>
            <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>
              {guide.title}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {guide.desc}
            </p>
          </div>
        ))}
      </div>

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
