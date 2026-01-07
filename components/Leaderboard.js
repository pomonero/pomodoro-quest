'use client';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Leaderboard() {
  const { language, leaderboard, profile } = useStore();
  const t = translations[language] || translations.tr;
  const displayData = leaderboard.length > 0 ? leaderboard : [
    { username: 'player1', best_score: 9850 }, { username: 'ninja42', best_score: 8720 },
    { username: 'coder_x', best_score: 7650 }, { username: 'focus99', best_score: 5200 }, { username: 'pro_dev', best_score: 4100 }
  ];
  const getRankBadge = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
  const getRankStyle = (i) => i === 0 ? 'border-yellow-500/50 bg-yellow-500/10' : i === 1 ? 'border-gray-400/50 bg-gray-400/10' : i === 2 ? 'border-orange-600/50 bg-orange-600/10' : 'border-transparent';

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center"><span className="text-lg">🏆</span></div>
        <div><h3 className="font-semibold" style={{ color: 'var(--text)' }}>{t.leaderboard}</h3><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.topPlayers}</p></div>
      </div>
      <div className="space-y-2">
        {displayData.slice(0, 10).map((player, i) => {
          const isCurrentUser = player.username?.toLowerCase() === profile?.username?.toLowerCase();
          return (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${getRankStyle(i)} ${isCurrentUser ? 'ring-2 ring-[var(--primary)]' : ''}`} style={{ background: 'var(--surface)' }}>
              <div className="flex items-center gap-3">
                <span className="text-lg w-8 text-center">{getRankBadge(i)}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-xs font-bold">{player.username?.[0]?.toUpperCase() || '?'}</div>
                <span className="font-medium" style={{ color: isCurrentUser ? 'var(--primary)' : 'var(--text)' }}>{player.username?.slice(0, 12) || 'Anonim'}{isCurrentUser && <span className="text-xs ml-1">({t.you})</span>}</span>
              </div>
              <span className={`font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : ''}`} style={{ color: i > 2 ? 'var(--text)' : undefined }}>{player.best_score?.toLocaleString() || 0}</span>
            </div>
          );
        })}
      </div>
      {displayData.length === 0 && <div className="text-center py-8"><span className="text-4xl mb-2 block">🎮</span><p style={{ color: 'var(--text-muted)' }}>{t.noScoresYet}</p></div>}
    </div>
  );
}
