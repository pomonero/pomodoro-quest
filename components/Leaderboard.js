'use client';

import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Leaderboard() {
  const { language, leaderboard, profile } = useStore();
  const t = translations[language] || translations.tr;

  const displayData = leaderboard.length > 0 ? leaderboard : [
    { username: 'player1', game_type: 'runner', best_score: 9850 },
    { username: 'ninja42', game_type: 'runner', best_score: 8720 },
    { username: 'coder_x', game_type: 'runner', best_score: 7650 },
    { username: 'focus99', game_type: 'runner', best_score: 5200 },
    { username: 'pro_dev', game_type: 'runner', best_score: 4100 },
  ];

  const getRankBadge = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const getRankStyle = (index) => {
    if (index === 0) return 'border-yellow-500/50 bg-yellow-500/10';
    if (index === 1) return 'border-gray-400/50 bg-gray-400/10';
    if (index === 2) return 'border-orange-600/50 bg-orange-600/10';
    return 'border-transparent';
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <span className="text-lg">🏆</span>
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
            {t.leaderboard}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t.topPlayers}
          </p>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {displayData.slice(0, 10).map((player, index) => {
          const isCurrentUser = player.username?.toLowerCase() === profile?.username?.toLowerCase();
          
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${getRankStyle(index)} ${
                isCurrentUser ? 'ring-2 ring-[var(--primary)]' : ''
              }`}
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg w-8 text-center">
                  {getRankBadge(index)}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-xs font-bold">
                  {player.username?.[0]?.toUpperCase() || '?'}
                </div>
                <span className={`font-medium ${isCurrentUser ? 'text-[var(--primary)]' : ''}`} style={{ color: isCurrentUser ? 'var(--primary)' : 'var(--text)' }}>
                  {player.username?.slice(0, 12) || 'Anonim'}
                  {isCurrentUser && <span className="text-xs ml-1">({t.you})</span>}
                </span>
              </div>
              <span className={`font-bold ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                index === 2 ? 'text-orange-600' : ''
              }`} style={{ color: index > 2 ? 'var(--text)' : undefined }}>
                {player.best_score?.toLocaleString() || 0}
              </span>
            </div>
          );
        })}
      </div>

      {displayData.length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl mb-2 block">🎮</span>
          <p style={{ color: 'var(--text-muted)' }}>
            {t.noScoresYet}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t.beFirst}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' ? 'Her 30 saniyede güncellenir' : 'Updates every 30 seconds'}
        </p>
      </div>
    </div>
  );
}
