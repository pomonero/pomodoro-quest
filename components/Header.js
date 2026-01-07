'use client';

import { auth } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function Header() {
  const { 
    profile, darkMode, toggleDarkMode, 
    setUser, setProfile,
    setShowSettings, setShowProfile 
  } = useStore();

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <header className={`sticky top-0 z-40 ${darkMode ? 'glass' : 'glass-light'}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Pomonero" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className={`text-xl font-bold font-display ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                POMONERO
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Çalış • Oyna • Kazan
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {/* Profile Button */}
            <button
              onClick={() => setShowProfile(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                darkMode 
                  ? 'hover:bg-white/10 text-white' 
                  : 'hover:bg-black/5 text-gray-700'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'P'}
              </div>
              <span className="hidden sm:block text-sm font-medium">
                {profile?.display_name || profile?.username || 'Profil'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl transition-all ${
                darkMode 
                  ? 'hover:bg-white/10 text-yellow-400' 
                  : 'hover:bg-black/5 text-gray-600'
              }`}
              title={darkMode ? 'Açık Mod' : 'Koyu Mod'}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2.5 rounded-xl transition-all ${
                darkMode 
                  ? 'hover:bg-white/10 text-gray-300' 
                  : 'hover:bg-black/5 text-gray-600'
              }`}
              title="Ayarlar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`p-2.5 rounded-xl transition-all ${
                darkMode 
                  ? 'hover:bg-red-500/20 text-gray-300 hover:text-red-400' 
                  : 'hover:bg-red-50 text-gray-600 hover:text-red-500'
              }`}
              title="Çıkış"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
