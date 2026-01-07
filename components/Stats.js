'use client';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Stats() {
  const { language, stats, settings } = useStore();
  const t = translations[language] || translations.tr;
  const { totalSessions, todaySessions, totalFocusMinutes, bestScore } = stats;
  const dailyGoal = settings.dailyGoal || 8;

  const getLevel = () => { if (totalSessions < 10) return 1; if (totalSessions < 25) return 2; if (totalSessions < 50) return 3; if (totalSessions < 100) return 4; if (totalSessions < 200) return 5; return Math.floor(totalSessions / 100) + 4; };
  const getLevelTitle = () => { const titles = language === 'tr' ? ['Çaylak', 'Öğrenci', 'Çalışkan', 'Uzman', 'Usta', 'Efsane'] : ['Rookie', 'Student', 'Worker', 'Expert', 'Master', 'Legend']; return titles[Math.min(getLevel() - 1, titles.length - 1)]; };
  const getNextLevelSessions = () => { const t = [10, 25, 50, 100, 200, 300, 500]; for (const th of t) if (totalSessions < th) return th; return Math.ceil(totalSessions / 100) * 100 + 100; };

  const level = getLevel();
  const nextLevel = getNextLevelSessions();
  const goalProgress = Math.min((todaySessions / dailyGoal) * 100, 100);

  const statItems = [
    { icon: '🎯', label: t.today, value: todaySessions, color: 'from-indigo-500 to-purple-600' },
    { icon: '📊', label: t.total, value: totalSessions, color: 'from-green-500 to-emerald-600' },
    { icon: '⏱️', label: t.hours, value: Math.floor(totalFocusMinutes / 60), suffix: 'h', color: 'from-blue-500 to-cyan-600' },
    { icon: '🏆', label: t.bestScore, value: bestScore, color: 'from-yellow-500 to-orange-500' }
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"><span className="text-lg">📈</span></div>
        <div><h3 className="font-semibold" style={{ color: 'var(--text)' }}>{t.statistics}</h3><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.level} {level} • {getLevelTitle()}</p></div>
      </div>
      <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-2xl">⭐</span><span className="font-bold" style={{ color: 'var(--text)' }}>{t.level} {level}</span></div><span className="text-sm" style={{ color: 'var(--text-muted)' }}>{totalSessions}/{nextLevel}</span></div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}><div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-500" style={{ width: `${(totalSessions / nextLevel) * 100}%` }} /></div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{t.toNextLevel}: {nextLevel - totalSessions} {t.sessions}</p>
      </div>
      <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between mb-2"><span className="font-medium" style={{ color: 'var(--text)' }}>{t.dailyGoal}</span><span className="text-sm font-bold" style={{ color: goalProgress >= 100 ? '#22c55e' : 'var(--primary)' }}>{todaySessions}/{dailyGoal}</span></div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}><div className={`h-full rounded-full transition-all duration-500 ${goalProgress >= 100 ? 'bg-green-500' : 'bg-[var(--primary)]'}`} style={{ width: `${goalProgress}%` }} /></div>
        {goalProgress >= 100 && <p className="text-xs mt-2 text-green-400 flex items-center gap-1"><span>✓</span> {t.goalReached}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">{statItems.map((item, i) => (<div key={i} className="p-4 rounded-xl text-center" style={{ background: 'var(--surface)' }}><span className="text-2xl mb-1 block">{item.icon}</span><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{item.value.toLocaleString()}{item.suffix || ''}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p></div>))}</div>
    </div>
  );
}
