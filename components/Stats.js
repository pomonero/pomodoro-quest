'use client';

import { useStore } from '@/lib/store';

export default function Stats() {
  const { darkMode, stats, profile } = useStore();

  const statItems = [
    { 
      icon: '🍅', 
      label: 'Bugün', 
      value: stats.todayPomodoros,
      color: 'from-red-500 to-orange-500',
      goal: profile?.study_goal || 8
    },
    { 
      icon: '🔥', 
      label: 'Toplam', 
      value: stats.totalPomodoros,
      color: 'from-orange-500 to-yellow-500'
    },
    { 
      icon: '⏱️', 
      label: 'Saat', 
      value: Math.floor(stats.totalFocusMinutes / 60),
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: '🎮', 
      label: 'En İyi', 
      value: stats.bestScore,
      color: 'from-purple-500 to-pink-500'
    },
  ];

  // Level calculation
  const level = Math.floor(stats.totalPomodoros / 10) + 1;
  const levelProgress = (stats.totalPomodoros % 10) * 10;
  const pomodorosToNextLevel = 10 - (stats.totalPomodoros % 10);

  // Today's goal progress
  const todayGoal = profile?.study_goal || 8;
  const todayProgress = Math.min((stats.todayPomodoros / todayGoal) * 100, 100);

  return (
    <div className={`card p-6 ${darkMode ? '' : 'card-light'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            İstatistikler
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Seviye {level}
          </p>
        </div>
      </div>

      {/* Today's Goal */}
      <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Bugünkü Hedef
          </span>
          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.todayPomodoros}/{todayGoal}
          </span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500"
            style={{ width: `${todayProgress}%` }}
          />
        </div>
        {todayProgress >= 100 && (
          <p className="text-accent text-xs mt-2 flex items-center gap-1">
            <span>🎉</span> Günlük hedefe ulaştın!
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statItems.map((item, index) => (
          <div 
            key={index}
            className={`stat-card text-center ${darkMode ? '' : 'bg-gray-50 border-gray-200'}`}
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className={`text-xl font-bold font-display ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {item.value.toLocaleString()}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Level Progress */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-r from-primary/10 to-secondary/10' : 'bg-gradient-to-r from-primary/5 to-secondary/5'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Seviye {level}
            </span>
          </div>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {levelProgress}%
          </span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Seviye {level + 1} için {pomodorosToNextLevel} pomodoro daha
        </p>
      </div>
    </div>
  );
}
