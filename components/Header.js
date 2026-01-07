'use client';

import { auth } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function Header({ onSettingsClick }) {
  const { profile, darkMode, toggleDarkMode, setUser, setProfile } = useStore();

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const theme = darkMode ? {
    bg: 'bg-gray-900',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    border: 'border-cyan-500/30',
    neonPrimary: 'text-cyan-400',
    neonSecondary: 'text-fuchsia-400',
  } : {
    bg: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    border: 'border-fuchsia-400/30',
    neonPrimary: 'text-fuchsia-600',
    neonSecondary: 'text-cyan-600',
  };

  return (
    <header className={`${theme.bg} ${theme.border} border-b-4 sticky top-0 z-40`}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍅</span>
            <div>
              <h1 className={`text-sm font-pixel ${theme.neonPrimary} neon-text-cyan`}>
                POMODORO QUEST
              </h1>
              <p className={`text-xs font-pixel ${theme.textMuted} hidden sm:block`}>
                ÇALIŞ • OYNA • KAZAN
              </p>
            </div>
          </div>

          {/* User Info & Controls */}
          <div className="flex items-center gap-4">
            {/* Username */}
            <div className={`hidden sm:flex items-center gap-2 ${theme.neonSecondary}`}>
              <span className="text-lg">👤</span>
              <span className="font-pixel text-xs">
                {profile?.username?.toUpperCase() || 'OYUNCU'}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 font-pixel text-lg ${theme.textMuted} hover:scale-110 transition-transform`}
              title={darkMode ? 'Açık Mod' : 'Koyu Mod'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className={`p-2 font-pixel text-lg ${theme.textMuted} hover:scale-110 transition-transform`}
              title="Ayarlar"
            >
              ⚙️
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`px-3 py-2 font-pixel text-xs ${theme.border} border-2 ${theme.textMuted} 
                hover:text-red-400 hover:border-red-400/50 transition-colors`}
            >
              ÇIKIŞ
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
