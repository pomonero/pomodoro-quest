'use client';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Leaderboard() {
  const { language, leaderboard, profile } = useStore();
  const t = translations[language] || translations.tr;

  const displayData = leaderboard.length > 0 ? leaderboard : [
    { username: 'player1', best_score: 9850, avatar_emoji: '😎' },
    { username: 'ninja42', best_score: 8720, avatar_emoji: '🥷' },
    { username: 'coder_x', best_score: 7650, avatar_emoji: '👨‍💻' },
    { username: 'focus99', best_score: 5200, avatar_emoji: '🎯' },
    { username: 'pro_dev', best_score: 4100, avatar_emoji: '🚀' }
  ];

  const getRankBadge = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <span className="text-lg">🏆</span>
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.leaderboard}</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.topPlayers}</p>
        </div>
      </div>

      <div className="space-y-2">
        {displayData.slice(0, 5).map((player, i) => {
          const isCurrentUser = player.username?.toLowerCase() === profile?.username?.toLowerCase();
          return (
            <div
              key={i}
              className={`flex items-center justify-between p-2 rounded-xl transition-all ${isCurrentUser ? 'ring-2 ring-[var(--primary)]' : ''}`}
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg w-7 text-center">{getRankBadge(i)}</span>
                <span className="text-lg">{player.avatar_emoji || '😊'}</span>
                <span className="text-sm font-medium" style={{ color: isCurrentUser ? 'var(--primary)' : 'var(--text)' }}>
                  {player.username?.slice(0, 10)}
                  {isCurrentUser && <span className="text-xs ml-1">({t.you})</span>}
                </span>
              </div>
              <span className="text-sm font-bold" style={{ color: i < 3 ? 'var(--primary)' : 'var(--text)' }}>
                {player.best_score?.toLocaleString() || 0}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
