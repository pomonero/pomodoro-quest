'use client';

import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function AboutPage() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;

  const features = [
    { icon: '⏱️', title: language === 'tr' ? 'Pomodoro Timer' : 'Pomodoro Timer', desc: language === 'tr' ? 'Özelleştirilebilir zamanlayıcı' : 'Customizable timer' },
    { icon: '🎮', title: language === 'tr' ? 'Mini Oyunlar' : 'Mini Games', desc: language === 'tr' ? '5 eğlenceli ödül oyunu' : '5 fun reward games' },
    { icon: '📊', title: language === 'tr' ? 'İstatistikler' : 'Statistics', desc: language === 'tr' ? 'Detaylı ilerleme takibi' : 'Detailed progress tracking' },
    { icon: '🏆', title: language === 'tr' ? 'Liderlik' : 'Leaderboard', desc: language === 'tr' ? 'Arkadaşlarınla yarış' : 'Compete with friends' },
    { icon: '🎨', title: language === 'tr' ? '8 Tema' : '8 Themes', desc: language === 'tr' ? 'Kendi tarzını seç' : 'Choose your style' },
    { icon: '🌍', title: language === 'tr' ? 'Çok Dilli' : 'Multi-language', desc: language === 'tr' ? 'Türkçe ve İngilizce' : 'Turkish and English' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <img src="/logo.png" alt="Pomonero" className="h-16 mx-auto mb-6" />
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          {t.aboutTitle}
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          {t.aboutText}
        </p>
      </div>

      {/* Mission */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <span>🎯</span> {t.aboutMission}
        </h2>
        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
          {t.aboutMissionText}
        </p>
      </div>

      {/* Features */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <span>✨</span> {language === 'tr' ? 'Özellikler' : 'Features'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl text-center"
              style={{ background: 'var(--surface)' }}
            >
              <span className="text-3xl mb-2 block">{feature.icon}</span>
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>
                {feature.title}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <span>🛠️</span> {language === 'tr' ? 'Teknolojiler' : 'Tech Stack'}
        </h2>
        <div className="flex flex-wrap gap-2">
          {['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'Vercel'].map((tech) => (
            <span 
              key={tech}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Version Info */}
      <div className="text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="font-logo-thin">Pomo</span><span className="font-logo-bold">nero</span> v2.0
        </p>
      </div>
    </div>
  );
}
