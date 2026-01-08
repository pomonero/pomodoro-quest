'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { themes, getDarkThemes, getLightThemes } from '@/lib/themes';

export default function Header() {
  const { profile, language, toggleLanguage, currentTheme, setTheme, setShowSettings, setShowProfile, currentPage, setCurrentPage, setUser, setProfile } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
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

  // ÇIKIŞ - KESİNLİKLE ÇALIŞACAK
  const handleLogout = async () => {
    setShowUserMenu(false);
    
    // Store temizle
    setUser(null);
    setProfile(null);
    
    // Supabase logout
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Signout error:', e);
    }
    
    // Storage temizle
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    
    // Sayfa yenile
    window.location.href = '/';
  };

  const navItems = [
    { id: 'home', label: t.home, icon: '🏠' },
    { id: 'pomodoro', label: t.whatIsPomodoro, icon: '📖' },
    { id: 'about', label: t.about, icon: '👥' },
    { id: 'contact', label: t.contact, icon: '📧' },
    { id: 'support', label: t.support, icon: '❓' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          
          {/* LOGO - ÇOK BÜYÜK */}
          <div 
            className="flex items-center cursor-pointer flex-shrink-0" 
            onClick={() => setCurrentPage('home')}
          >
            <img 
              src={logoSrc} 
              alt="Pomonero" 
              className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto"
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
          <div className="flex items-center gap-2">
            
            {/* Language */}
            <button 
              onClick={toggleLanguage} 
              className="p-2 rounded-lg transition-all text-xl"
              style={{ background: 'transparent' }}
            >
              {language === 'tr' ? '🇹🇷' : '🇬🇧'}
            </button>

            {/* Theme */}
            <div className="relative" ref={themeRef}>
              <button 
                onClick={() => setShowThemeMenu(!showThemeMenu)} 
                className="p-2 rounded-lg transition-all text-xl"
                style={{ background: 'transparent' }}
              >
                {theme.pixelArt}
              </button>
              
              {showThemeMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-xl p-4 shadow-2xl z-50" 
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    {t.darkThemes}
                  </p>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {getDarkThemes().map((th) => (
                      <button
                        key={th.id}
                        onClick={() => { setTheme(th.id); setShowThemeMenu(false); }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110"
                        style={{ 
                          background: currentTheme === th.id ? 'var(--primary)' : th.colors.surface,
                          border: currentTheme === th.id ? '2px solid var(--primary)' : '2px solid transparent'
                        }}
                        title={language === 'tr' ? th.name : th.nameEn}
                      >
                        {th.pixelArt}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    {t.lightThemes}
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {getLightThemes().map((th) => (
                      <button
                        key={th.id}
                        onClick={() => { setTheme(th.id); setShowThemeMenu(false); }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-110"
                        style={{ 
                          background: currentTheme === th.id ? 'var(--primary)' : th.colors.surface,
                          border: currentTheme === th.id ? '2px solid var(--primary)' : '2px solid transparent'
                        }}
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
                className="p-1 rounded-xl transition-all"
                style={{ background: 'transparent' }}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-xl">
                  {profile?.avatar_emoji || '😊'}
                </div>
              </button>
              
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-60 rounded-xl p-2 shadow-2xl z-50" 
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  {/* User Info */}
                  <div className="px-3 py-3 border-b mb-2" style={{ borderColor: 'var(--border)' }}>
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>
                      {profile?.display_name || profile?.username || 'Kullanıcı'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      @{profile?.username}
                    </p>
                  </div>
                  
                  {/* Mobile Nav */}
                  <div className="lg:hidden border-b mb-2 pb-2" style={{ borderColor: 'var(--border)' }}>
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setCurrentPage(item.id); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                        style={{ 
                          background: currentPage === item.id ? 'var(--primary)' : 'transparent',
                          color: currentPage === item.id ? 'white' : 'var(--text)' 
                        }}
                      >
                        <span>{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Menu Items */}
                  <button 
                    onClick={() => { setShowProfile(true); setShowUserMenu(false); }} 
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface)] transition-all" 
                    style={{ color: 'var(--text)' }}
                  >
                    <span>👤</span>
                    <span className="text-sm font-medium">{t.profile}</span>
                  </button>
                  
                  <button 
                    onClick={() => { setShowSettings(true); setShowUserMenu(false); }} 
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface)] transition-all" 
                    style={{ color: 'var(--text)' }}
                  >
                    <span>⚙️</span>
                    <span className="text-sm font-medium">{t.settings}</span>
                  </button>
                  
                  <button 
                    onClick={() => { setCurrentPage('privacy'); setShowUserMenu(false); }} 
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface)] transition-all" 
                    style={{ color: 'var(--text)' }}
                  >
                    <span>🔒</span>
                    <span className="text-sm font-medium">{t.privacy}</span>
                  </button>
                  
                  {/* Logout */}
                  <div className="border-t mt-2 pt-2" style={{ borderColor: 'var(--border)' }}>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-semibold"
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
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
