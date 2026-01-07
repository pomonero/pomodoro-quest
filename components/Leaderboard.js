'use client';

import { useStore } from '@/lib/store';

export default function Leaderboard() {
  const { darkMode, leaderboard, profile } = useStore();

  const displayData = leaderboard.length > 0 ? leaderboard : [
    { username: 'player1', game_type: 'runner', best_score: 9850 },
    { username: 'ninja42', game_type: 'runner', best_score: 8720 },
    { username: 'coder_x', game_type: 'runner', best_score: 7650 },
    { username: 'focus99', game_type: 'runner', best_score: 5200 },
    { username: 'pro_dev', game_type: 'runner', best_score: 4100 },
  ];

  const getRankStyle = (index) => {
    if (index === 0) return 'leaderboard-item top-1';
    if (index === 1) return 'leaderboard-item top-2';
    if (index === 2) return 'leaderboard-item top-3';
    return 'leaderboard-item';
  };

  const getRankBadge = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  return (
    <div className={`card p-6 ${darkMode ? '' : 'card-light'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Liderlik Tablosu
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Bugünün en iyileri
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {displayData.slice(0, 10).map((player, index) => {
          const isCurrentUser = player.username?.toLowerCase() === profile?.username?.toLowerCase();
          
          return (
            <div
              key={index}
              className={`${getRankStyle(index)} ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg w-8 text-center">
                  {getRankBadge(index)}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                  {player.username?.[0]?.toUpperCase() || '?'}
                </div>
                <span className={`font-medium ${
                  isCurrentUser 
                    ? 'text-primary' 
                    : darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {player.username?.slice(0, 12) || 'Anonim'}
                  {isCurrentUser && <span className="text-xs ml-1">(sen)</span>}
                </span>
              </div>
              <span className={`font-display font-bold ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                index === 2 ? 'text-orange-600' :
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {player.best_score?.toLocaleString() || 0}
              </span>
            </div>
          );
        })}
      </div>

      {displayData.length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl mb-2 block">🎮</span>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Henüz skor yok. İlk sen ol!
          </p>
        </div>
      )}

      <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Her 30 saniyede güncellenir
        </p>
      </div>
    </div>
  );
}
