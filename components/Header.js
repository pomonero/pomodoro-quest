'use client';

import { useState, useRef, useEffect } from 'react';
import { auth } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { themes, getDarkThemes, getLightThemes } from '@/lib/themes';

export default function Header() {
  const { 
    profile, language, toggleLanguage, setLanguage,
    currentTheme, setTheme,
    setUser, setProfile,
    setShowSettings, setShowProfile,
    currentPage, setCurrentPage,
    showSidebar, setShowSidebar
  } = useStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef(null);
  const themeRef = useRef(null);

  const t = translations[language] || translations.tr;
  const theme = themes[currentTheme] || themes.midnight;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const navItems = [
    { id: 'home', label: t.home, icon: '🏠' },
    { id: 'pomodoro', label: t.whatIsPomodoro, icon: '📖' },
    { id: 'about', label: t.about, icon: '👥' },
    { id: 'contact', label: t.contact, icon: '📧' },
    { id: 'support', label: t.support, icon: '❓' },
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Pomonero" 
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold" style={{ color: 'var(--text)' }}>
                POMONERO
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t.slogan}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-[var(--primary)] text-white'
                    : 'hover:bg-[var(--surface-hover)]'
                }`}
                style={{ color: currentPage === item.id ? 'white' : 'var(--text)' }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-all text-sm font-medium"
              style={{ color: 'var(--text)' }}
              title={t.language}
            >
              {language === 'tr' ? '🇹🇷' : '🇬🇧'}
            </button>

            {/* Theme Menu */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-all"
                style={{ color: 'var(--text)' }}
                title={t.theme}
              >
                {theme.pixelArt}
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl p-3 glass border border-[var(--border)] shadow-xl">
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                    {t.darkThemes}
                  </p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {getDarkThemes().map((th) => (
                      <button
                        key={th.id}
                        onClick={() => { setTheme(th.id); setShowThemeMenu(false); }}
                        className={`p-2 rounded-lg text-xl transition-all ${
                          currentTheme === th.id ? 'ring-2 ring-[var(--primary)]' : ''
                        }`}
                        style={{ background: th.colors.surface }}
                        title={language === 'tr' ? th.name : th.nameEn}
                      >
                        {th.pixelArt}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                    {t.lightThemes}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {getLightThemes().map((th) => (
                      <button
                        key={th.id}
                        onClick={() => { setTheme(th.id); setShowThemeMenu(false); }}
                        className={`p-2 rounded-lg text-xl transition-all ${
                          currentTheme === th.id ? 'ring-2 ring-[var(--primary)]' : ''
                        }`}
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
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-sm font-bold">
                  {profile?.username?.[0]?.toUpperCase() || 'P'}
                </div>
                <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl p-2 glass border border-[var(--border)] shadow-xl">
                  {/* User Info */}
                  <div className="px-3 py-2 border-b border-[var(--border)] mb-2">
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      {profile?.display_name || profile?.username || 'Kullanıcı'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      @{profile?.username}
                    </p>
                  </div>

                  {/* Mobile Nav */}
                  <div className="lg:hidden border-b border-[var(--border)] mb-2 pb-2">
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

                  {/* Menu Items */}
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

                  <div className="border-t border-[var(--border)] mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-all text-red-400"
                    >
                      <span>🚪</span>
                      <span className="text-sm">{t.logout}</span>
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
