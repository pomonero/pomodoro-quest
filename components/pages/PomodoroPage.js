'use client';
import { useStore } from '@/lib/store';

export default function PomodoroPage() {
  const { language } = useStore();

  const steps = language === 'tr' ? [
    { icon: '🎯', title: '25 dakika odaklanın' },
    { icon: '☕', title: '5 dakika mola verin' },
    { icon: '🔄', title: '4 kez tekrarlayın' },
    { icon: '🌴', title: '30 dakika uzun mola' },
  ] : [
    { icon: '🎯', title: 'Focus for 25 minutes' },
    { icon: '☕', title: 'Take a 5-minute break' },
    { icon: '🔄', title: 'Repeat 4 times' },
    { icon: '🌴', title: '30-minute long break' },
  ];

  const benefits = language === 'tr' 
    ? ['Odaklanmayı artırır', 'Yorgunluğu azaltır', 'Verimliliği yükseltir', 'Motivasyonu korur']
    : ['Increases focus', 'Reduces fatigue', 'Boosts productivity', 'Maintains motivation'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 mb-4">
          <span className="text-3xl">⏱️</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {language === 'tr' ? 'Pomodoro Tekniği Nedir?' : 'What is Pomodoro Technique?'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' 
            ? '1980\'lerde Francesco Cirillo tarafından geliştirilen zaman yönetimi tekniği'
            : 'Time management technique developed by Francesco Cirillo in the 1980s'}
        </p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
          📋 {language === 'tr' ? 'Nasıl Çalışır?' : 'How It Works?'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="p-4 rounded-xl text-center" style={{ background: 'var(--surface)' }}>
              <span className="text-3xl mb-2 block">{step.icon}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{language === 'tr' ? 'ADIM' : 'STEP'} {i + 1}</span>
              <p className="text-sm mt-1" style={{ color: 'var(--text)' }}>{step.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
          💪 {language === 'tr' ? 'Faydaları' : 'Benefits'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {benefits.map((b, i) => (
            <div key={i} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--surface)' }}>
              <span className="text-green-500">✓</span>
              <span className="text-sm" style={{ color: 'var(--text)' }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
