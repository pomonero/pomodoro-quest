'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { themes } from '@/lib/themes';

export default function AuthScreen() {
  const { language, toggleLanguage, currentTheme, setTheme } = useStore();
  const t = translations[language] || translations.tr;
  const theme = themes[currentTheme] || themes.midnight;

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.style.background = theme.colors.background;
  }, [currentTheme, theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await auth.signIn(formData.email, formData.password);
        if (error) throw error;
      } else {
        if (!formData.username || formData.username.length < 3) {
          throw new Error(language === 'tr' ? 'Kullanıcı adı en az 3 karakter olmalı' : 'Username must be at least 3 characters');
        }
        const { error } = await auth.signUp(formData.email, formData.password, formData.username);
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">⭐</div>
        <div className="absolute top-40 right-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🌙</div>
        <div className="absolute bottom-40 left-20 text-4xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>✨</div>
        <div className="absolute bottom-20 right-10 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🚀</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4 gap-2">
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: theme.colors.surface, color: theme.colors.text }}
          >
            {language === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Pomonero" 
            className="w-24 h-24 mx-auto mb-4 animate-float"
          />
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
            POMONERO
          </h1>
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>
            {t.slogan}
          </p>
        </div>

        {/* Auth Form */}
        <div className="card p-6">
          {/* Tabs */}
          <div className="flex mb-6 p-1 rounded-xl" style={{ background: theme.colors.surface }}>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                isLogin ? 'text-white' : ''
              }`}
              style={{ 
                background: isLogin ? theme.colors.primary : 'transparent',
                color: isLogin ? 'white' : theme.colors.textMuted
              }}
            >
              {t.login}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                !isLogin ? 'text-white' : ''
              }`}
              style={{ 
                background: !isLogin ? theme.colors.primary : 'transparent',
                color: !isLogin ? 'white' : theme.colors.textMuted
              }}
            >
              {t.register}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  {t.username}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-modern"
                  placeholder={language === 'tr' ? 'kullanici_adi' : 'username'}
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                {t.email}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-modern"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                {t.password}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-modern"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? '...' : (isLogin ? t.login : t.register)}
            </button>
          </form>

          {/* Toggle Link */}
          <p className="text-center mt-4 text-sm" style={{ color: theme.colors.textMuted }}>
            {isLogin ? t.noAccount : t.hasAccount}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium hover:underline"
              style={{ color: theme.colors.primary }}
            >
              {isLogin ? t.register : t.login}
            </button>
          </p>
        </div>

        {/* Pixel art decoration */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-2xl opacity-30">
            <span className="animate-pixel-bounce" style={{ animationDelay: '0ms' }}>⭐</span>
            <span className="animate-pixel-bounce" style={{ animationDelay: '100ms' }}>🎮</span>
            <span className="animate-pixel-bounce" style={{ animationDelay: '200ms' }}>⭐</span>
          </div>
        </div>
      </div>
    </div>
  );
}
