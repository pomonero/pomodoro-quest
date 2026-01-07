'use client';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Stats() {
  const { language, stats, settings } = useStore();
  const t = translations[language] || translations.tr;
  const { totalSessions, todaySessions, totalFocusMinutes, bestScore } = stats;
  const dailyGoal = settings.dailyGoal || 8;

  const getLevel = () => {
    if (totalSessions < 10) return 1;
    if (totalSessions < 25) return 2;
    if (totalSessions < 50) return 3;
    if (totalSessions < 100) return 4;
    if (totalSessions < 200) return 5;
    return Math.floor(totalSessions / 100) + 4;
  };

  const getLevelTitle = () => {
    const titles = language === 'tr' 
      ? ['Çaylak', 'Öğrenci', 'Çalışkan', 'Uzman', 'Usta', 'Efsane']
      : ['Rookie', 'Student', 'Worker', 'Expert', 'Master', 'Legend'];
    return titles[Math.min(getLevel() - 1, titles.length - 1)];
  };

  const getNextLevelSessions = () => {
    const thresholds = [10, 25, 50, 100, 200, 300, 500];
    for (const th of thresholds) {
      if (totalSessions < th) return th;
    }
    return Math.ceil(totalSessions / 100) * 100 + 100;
  };

  const level = getLevel();
  const nextLevel = getNextLevelSessions();
  const goalProgress = Math.min((todaySessions / dailyGoal) * 100, 100);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <span className="text-lg">📈</span>
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.statistics}</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.level} {level} • {getLevelTitle()}</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>⭐ {t.level} {level}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{totalSessions}/{nextLevel}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" style={{ width: `${(totalSessions / nextLevel) * 100}%` }} />
        </div>
      </div>

      {/* Daily Goal */}
      <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm" style={{ color: 'var(--text)' }}>{t.dailyGoal}</span>
          <span className="text-sm font-bold" style={{ color: goalProgress >= 100 ? '#22c55e' : 'var(--primary)' }}>{todaySessions}/{dailyGoal}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className={`h-full rounded-full ${goalProgress >= 100 ? 'bg-green-500' : 'bg-[var(--primary)]'}`} style={{ width: `${goalProgress}%` }} />
        </div>
        {goalProgress >= 100 && <p className="text-xs mt-1 text-green-400">✓ {t.goalReached}</p>}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface)' }}>
          <span className="text-xl">🎯</span>
          <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{todaySessions}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.today}</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface)' }}>
          <span className="text-xl">📊</span>
          <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{totalSessions}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.total}</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface)' }}>
          <span className="text-xl">⏱️</span>
          <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{Math.floor(totalFocusMinutes / 60)}h</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.hours}</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--surface)' }}>
          <span className="text-xl">🏆</span>
          <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{bestScore}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.bestScore}</p>
        </div>
      </div>
    </div>
  );
}
