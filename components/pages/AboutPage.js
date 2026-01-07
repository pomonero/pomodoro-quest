'use client';
import { useStore } from '@/lib/store';

export default function AboutPage() {
  const { language } = useStore();

  const features = [
    { icon: '⏱️', title: language === 'tr' ? 'Pomodoro Zamanlayıcı' : 'Pomodoro Timer', desc: language === 'tr' ? 'Özelleştirilebilir süreler' : 'Customizable durations' },
    { icon: '🎮', title: language === 'tr' ? '5 Mini Oyun' : '5 Mini Games', desc: language === 'tr' ? 'Molalarda eğlence' : 'Fun during breaks' },
    { icon: '📊', title: language === 'tr' ? 'İstatistikler' : 'Statistics', desc: language === 'tr' ? 'İlerleme takibi' : 'Progress tracking' },
    { icon: '🏆', title: language === 'tr' ? 'Liderlik Tablosu' : 'Leaderboard', desc: language === 'tr' ? 'Rekabet et' : 'Compete' },
    { icon: '🎨', title: language === 'tr' ? '8 Tema' : '8 Themes', desc: language === 'tr' ? 'Kişiselleştir' : 'Personalize' },
    { icon: '📻', title: language === 'tr' ? 'Radyo' : 'Radio', desc: language === 'tr' ? 'Müzik dinle' : 'Listen to music' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <img src="/logo.png" alt="Pomonero" className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {language === 'tr' ? 'Hakkımızda' : 'About Us'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' ? 'Odaklan • Başar • Keşfet' : 'Focus • Achieve • Discover'}
        </p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
          {language === 'tr' ? 'Pomonero Nedir?' : 'What is Pomonero?'}
        </h2>
        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' 
            ? 'Pomonero, öğrenciler ve profesyoneller için tasarlanmış modern bir Pomodoro uygulamasıdır. Verimli çalışmayı oyunlaştırma ile birleştirerek odaklanmanızı artırır ve motivasyonunuzu yüksek tutar.'
            : 'Pomonero is a modern Pomodoro app designed for students and professionals. It increases your focus and keeps your motivation high by combining productive work with gamification.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {features.map((f, i) => (
          <div key={i} className="card p-4 text-center">
            <span className="text-3xl mb-2 block">{f.icon}</span>
            <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--text)' }}>{f.title}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Pomonero v2.1.0 • {language === 'tr' ? 'Türkiye' : 'Turkey'} 🇹🇷
        </p>
      </div>
    </div>
  );
}
