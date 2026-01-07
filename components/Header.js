'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { themes, getDarkThemes, getLightThemes } from '@/lib/themes';

export default function Header() {
  const { profile, language, toggleLanguage, currentTheme, setTheme, setUser, setProfile, setShowSettings, setShowProfile, currentPage, setCurrentPage } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const themeRef = useRef(null);
  const t = translations[language] || translations.tr;
  const theme = themes[currentTheme] || themes.midnight;

  const logoSrc = theme.type === 'dark' ? '/logo-light.png' : '/logo-dark.png';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
      if (themeRef.current && !themeRef.current.contains(e.target)) setShowThemeMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setShowUserMenu(false);
    
    try {
      // 1. Supabase oturumunu kapat
      if (supabase) {
        await supabase.auth.signOut({ scope: 'global' });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // 2. Her şeyi temizle ve sayfayı yenile
    try {
      // Store temizle
      setUser(null);
      setProfile(null);
      
      // LocalStorage tamamen temizle
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch {}
    
    // 3. Sayfayı kesinlikle yenile
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const navItems = [
    { id: 'home', label: t.home, icon: '🏠' },
    { id: 'pomodoro', label: t.whatIsPomodoro, icon: '📖' },
    { id: 'about', label: t.about, icon: '👥' },
    { id: 'contact', label: t.contact, icon: '📧' },
    { id: 'support', label: t.support, icon: '❓' },
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - DEVASA */}
          <div className="flex items-center cursor-pointer flex-shrink-0" onClick={() => setCurrentPage('home')}>
            <img 
              src={logoSrc} 
              alt="Pomonero" 
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ 
                  background: currentPage === item.id ? 'var(--primary)' : 'transparent',
                  color: currentPage === item.id ? 'white' : 'var(--text)'
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Language */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-all text-base sm:text-lg"
              style={{ color: 'var(--text)' }}
            >
              {language === 'tr' ? '🇹🇷' : '🇬🇧'}
            </button>

            {/* Theme */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-all text-base sm:text-lg"
              >
                {theme.pixelArt}
              </button>
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl p-3 glass border shadow-xl" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t.darkThemes}</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {getDarkThemes().map((th) => (
                      <button
                        key={th.id}
                        onClick={() => { setTheme(th.id); setShowThemeMenu(false); }}
                        className={`p-2 rounded-lg text-xl transition-all ${currentTheme === th.id ? 'ring-2 ring-[var(--primary)]' : ''}`}
                        style={{ background: th.colors.surface }}
                        title={language === 'tr' ? th.name : th.nameEn}
                      >
                        {th.pixelArt}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t.lightThemes}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {getLightThemes().map((th) => (
                      <button
                        key={th.id}
                        onClick={() => { setTheme(th.id); setShowThemeMenu(false); }}
                        className={`p-2 rounded-lg text-xl transition-all ${currentTheme === th.id ? 'ring-2 ring-[var(--primary)]' : ''}`}
                        style={{ background: th.colors.surface }}
                        title={language === 'tr' ? th.name : th.nameEn}
                      >
                        {th.pixelArt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-all"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-lg sm:text-xl">
                  {profile?.avatar_emoji || '😊'}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl p-2 glass border shadow-xl" style={{ borderColor: 'var(--border)' }}>
                  <div className="px-3 py-2 border-b mb-2" style={{ borderColor: 'var(--border)' }}>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{profile?.display_name || profile?.username || 'Kullanıcı'}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{profile?.username}</p>
                  </div>
                  
                  {/* Mobile Nav */}
                  <div className="lg:hidden border-b mb-2 pb-2" style={{ borderColor: 'var(--border)' }}>
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setCurrentPage(item.id); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition-all"
                        style={{ color: 'var(--text)' }}
                      >
                        <span>{item.icon}</span>
                        <span className="text-sm">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => { setShowProfile(true); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition-all"
                    style={{ color: 'var(--text)' }}
                  >
                    <span>👤</span>
                    <span className="text-sm">{t.profile}</span>
                  </button>
                  <button
                    onClick={() => { setShowSettings(true); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition-all"
                    style={{ color: 'var(--text)' }}
                  >
                    <span>⚙️</span>
                    <span className="text-sm">{t.settings}</span>
                  </button>
                  <button
                    onClick={() => { setCurrentPage('privacy'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition-all"
                    style={{ color: 'var(--text)' }}
                  >
                    <span>🔒</span>
                    <span className="text-sm">{t.privacy}</span>
                  </button>
                  <div className="border-t mt-2 pt-2" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-all text-red-400 disabled:opacity-50"
                    >
                      {loggingOut ? (
                        <>
                          <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></span>
                          <span className="text-sm">{language === 'tr' ? 'Çıkış yapılıyor...' : 'Logging out...'}</span>
                        </>
                      ) : (
                        <>
                          <span>🚪</span>
                          <span className="text-sm">{t.logout}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
