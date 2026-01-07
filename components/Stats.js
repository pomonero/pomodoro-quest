'use client';

import { useStore } from '@/lib/store';

export default function Stats() {
  const { darkMode, stats, profile } = useStore();

  const theme = darkMode ? {
    surface: 'bg-gray-900',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    border: 'border-cyan-500/30',
    neonPrimary: 'text-cyan-400',
    neonSecondary: 'text-fuchsia-400',
    neonAccent: 'text-lime-400',
  } : {
    surface: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    border: 'border-fuchsia-400/30',
    neonPrimary: 'text-fuchsia-600',
    neonSecondary: 'text-cyan-600',
    neonAccent: 'text-emerald-600',
  };

  const statItems = [
    { 
      icon: '🍅', 
      label: 'BUGÜN', 
      value: stats.todayPomodoros,
      suffix: 'POMODORO'
    },
    { 
      icon: '🔥', 
      label: 'TOPLAM', 
      value: stats.totalPomodoros,
      suffix: 'POMODORO'
    },
    { 
      icon: '⏱️', 
      label: 'ODAKLANMA', 
      value: Math.floor(stats.totalFocusMinutes / 60),
      suffix: 'SAAT'
    },
    { 
      icon: '🎮', 
      label: 'EN İYİ SKOR', 
      value: stats.bestScore,
      suffix: 'PUAN'
    },
  ];

  return (
    <div className={`${theme.surface} ${theme.border} border-4 p-4`}>
      <h3 
        className={`font-pixel text-xs ${theme.neonAccent} mb-4`}
        style={{ textShadow: darkMode ? '0 0 10px lime' : '0 0 10px emerald' }}
      >
        📊 İSTATİSTİKLERİN
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => (
          <div 
            key={index}
            className={`${theme.border} border-2 p-3 text-center`}
          >
            <div className="text-xl mb-1">{item.icon}</div>
            <div className={`font-pixel text-lg ${theme.neonPrimary}`}>
              {item.value.toLocaleString()}
            </div>
            <div className={`font-pixel text-xs ${theme.textMuted}`}>
              {item.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* Level/Badge Section */}
      <div className={`mt-4 pt-4 ${theme.border} border-t`}>
        <div className="flex items-center justify-between">
          <span className={`font-pixel text-xs ${theme.textMuted}`}>SEVİYE</span>
          <span className={`font-pixel text-sm ${theme.neonSecondary}`}>
            {Math.floor(stats.totalPomodoros / 10) + 1}
          </span>
        </div>
        <div className={`mt-2 h-2 bg-gray-800 rounded-full overflow-hidden`}>
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all"
            style={{ width: `${(stats.totalPomodoros % 10) * 10}%` }}
          />
        </div>
        <p className={`font-pixel text-xs ${theme.textMuted} mt-1 text-center`}>
          {10 - (stats.totalPomodoros % 10)} pomodoro sonra seviye atlayacaksın!
        </p>
      </div>
    </div>
  );
}
