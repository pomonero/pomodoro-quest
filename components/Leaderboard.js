'use client';

import { useStore } from '@/lib/store';

export default function Leaderboard() {
  const { darkMode, leaderboard, profile } = useStore();

  const theme = darkMode ? {
    surface: 'bg-gray-900',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    border: 'border-cyan-500/30',
    neonPrimary: 'text-cyan-400',
    neonSecondary: 'text-fuchsia-400',
    neonAccent: 'text-lime-400',
    highlight: 'bg-cyan-500/10',
  } : {
    surface: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    border: 'border-fuchsia-400/30',
    neonPrimary: 'text-fuchsia-600',
    neonSecondary: 'text-cyan-600',
    neonAccent: 'text-emerald-600',
    highlight: 'bg-fuchsia-500/10',
  };

  // Mock data if no leaderboard
  const displayData = leaderboard.length > 0 ? leaderboard : [
    { username: 'PLAYER1', game_type: 'runner', best_score: 9850 },
    { username: 'NINJA42', game_type: 'runner', best_score: 8720 },
    { username: 'CODER_X', game_type: 'runner', best_score: 7650 },
    { username: 'FOCUS99', game_type: 'runner', best_score: 5200 },
    { username: 'PRO_DEV', game_type: 'runner', best_score: 4100 },
  ];

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  return (
    <div className={`${theme.surface} ${theme.border} border-4 p-4 shadow-neon-pink`}>
      <h3 
        className={`font-pixel text-xs ${theme.neonSecondary} mb-4`}
        style={{ textShadow: darkMode ? '0 0 10px fuchsia' : '0 0 10px cyan' }}
      >
        🏆 BUGÜNÜN EN İYİLERİ
      </h3>

      <div className="space-y-2">
        {displayData.slice(0, 10).map((player, index) => {
          const isCurrentUser = player.username?.toLowerCase() === profile?.username?.toLowerCase();
          
          return (
            <div
              key={index}
              className={`flex justify-between items-center py-2 px-2 
                ${isCurrentUser ? theme.highlight : ''} 
                ${theme.border} border-b last:border-b-0`}
            >
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs w-6">
                  {getRankEmoji(index)}
                </span>
                <span className={`font-pixel text-xs ${isCurrentUser ? theme.neonAccent : theme.textMuted}`}>
                  {player.username?.toUpperCase().slice(0, 10) || 'ANONIM'}
                </span>
              </div>
              <span className={`font-pixel text-xs ${isCurrentUser ? theme.neonPrimary : theme.text}`}>
                {player.best_score?.toLocaleString() || 0}
              </span>
            </div>
          );
        })}
      </div>

      {displayData.length === 0 && (
        <p className={`font-pixel text-xs ${theme.textMuted} text-center py-4`}>
          Henüz skor yok. İlk sen ol! 🎮
        </p>
      )}

      <div className={`mt-4 pt-4 ${theme.border} border-t`}>
        <p className={`font-pixel text-xs ${theme.textMuted} text-center`}>
          Her 30 saniyede güncellenir
        </p>
      </div>
    </div>
  );
}
