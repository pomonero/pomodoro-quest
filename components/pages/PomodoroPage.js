'use client';

import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function PomodoroPage() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;

  const steps = [
    { icon: '🎯', text: t.pomodoroStep1, color: 'from-indigo-500 to-purple-600' },
    { icon: '☕', text: t.pomodoroStep2, color: 'from-green-500 to-emerald-600' },
    { icon: '🌴', text: t.pomodoroStep3, color: 'from-orange-500 to-amber-600' },
    { icon: '🔄', text: t.pomodoroStep4, color: 'from-pink-500 to-rose-600' },
  ];

  const benefits = [
    { icon: '🧠', text: t.pomodoroBenefit1 },
    { icon: '💪', text: t.pomodoroBenefit2 },
    { icon: '🚀', text: t.pomodoroBenefit3 },
    { icon: '⚖️', text: t.pomodoroBenefit4 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 mb-6">
          <span className="text-4xl">🍅</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
          {t.pomodoroTitle}
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          {t.pomodoroIntro}
        </p>
      </div>

      {/* Nasıl Çalışır */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <span>📋</span> {t.pomodoroHow}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: 'var(--surface)' }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}>
                <span className="text-2xl">{step.icon}</span>
              </div>
              <div>
                <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                  {language === 'tr' ? `Adım ${index + 1}` : `Step ${index + 1}`}
                </span>
                <p className="font-medium" style={{ color: 'var(--text)' }}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faydaları */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <span>✨</span> {t.pomodoroBenefits}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="text-center p-4 rounded-xl"
              style={{ background: 'var(--surface)' }}
            >
              <span className="text-3xl mb-2 block">{benefit.icon}</span>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {benefit.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pixel Art Deco */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 text-4xl opacity-50">
          <span className="animate-pixel-bounce" style={{ animationDelay: '0ms' }}>🍅</span>
          <span className="animate-pixel-bounce" style={{ animationDelay: '100ms' }}>🍅</span>
          <span className="animate-pixel-bounce" style={{ animationDelay: '200ms' }}>🍅</span>
          <span className="animate-pixel-bounce" style={{ animationDelay: '300ms' }}>🍅</span>
        </div>
      </div>
    </div>
  );
}
