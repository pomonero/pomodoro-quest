'use client';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function PomodoroPage() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;

  const steps = [
    { icon: '🎯', title: t.pomodoroStep1 },
    { icon: '☕', title: t.pomodoroStep2 },
    { icon: '🔄', title: t.pomodoroStep3 },
    { icon: '✨', title: t.pomodoroStep4 },
  ];

  const benefits = [t.pomodoroBenefit1, t.pomodoroBenefit2, t.pomodoroBenefit3, t.pomodoroBenefit4];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 mb-6"><span className="text-4xl">⏱️</span></div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>{t.pomodoroTitle}</h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>{t.pomodoroIntro}</p>
      </div>
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}><span>📋</span> {t.pomodoroHow}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-2xl">{step.icon}</div>
              <div><span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{language === 'tr' ? 'ADIM' : 'STEP'} {i + 1}</span><p className="font-medium" style={{ color: 'var(--text)' }}>{step.title}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}><span>💪</span> {t.pomodoroBenefits}</h2>
        <div className="grid grid-cols-2 gap-4">
          {benefits.map((b, i) => (<div key={i} className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--surface)' }}><span className="text-green-500 text-xl">✓</span><span style={{ color: 'var(--text)' }}>{b}</span></div>))}
        </div>
      </div>
    </div>
  );
}
