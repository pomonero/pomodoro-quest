'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { themes } from '@/lib/themes';

export default function AuthScreen() {
  const { language, toggleLanguage, currentTheme } = useStore();
  const t = translations[language] || translations.tr;
  const theme = themes[currentTheme] || themes.midnight;

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // E-posta doğrulama kontrolü
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=recovery')) {
      setSuccess(language === 'tr' 
        ? '✅ E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.' 
        : '✅ Your email has been verified! You can now login.');
      setIsLogin(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.style.background = theme.colors.background;
  }, [currentTheme, theme]);

  const getErrorMessage = (err) => {
    const msg = err?.message || '';
    
    if (msg.includes('already registered')) {
      return language === 'tr' 
        ? '⚠️ Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.' 
        : '⚠️ This email is already registered. Try logging in.';
    }
    if (msg.includes('Invalid login')) {
      return language === 'tr' 
        ? '⚠️ E-posta veya şifre hatalı.' 
        : '⚠️ Invalid email or password.';
    }
    if (msg.includes('not confirmed')) {
      return language === 'tr' 
        ? '⚠️ E-postanızı henüz doğrulamadınız. Lütfen e-postanızı kontrol edin.' 
        : '⚠️ Please verify your email first.';
    }
    if (msg.includes('6 characters')) {
      return language === 'tr' 
        ? '⚠️ Şifre en az 6 karakter olmalı.' 
        : '⚠️ Password must be at least 6 characters.';
    }
    if (msg.includes('invalid format')) {
      return language === 'tr' 
        ? '⚠️ Geçerli bir e-posta adresi girin.' 
        : '⚠️ Please enter a valid email.';
    }
    if (msg.includes('rate limit')) {
      return language === 'tr' 
        ? '⚠️ Çok fazla deneme. Lütfen bekleyin.' 
        : '⚠️ Too many attempts. Please wait.';
    }
    
    return language === 'tr' 
      ? '⚠️ Bir hata oluştu. Lütfen tekrar deneyin.' 
      : '⚠️ An error occurred. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.email.includes('@')) {
      setError(language === 'tr' ? '⚠️ Geçerli bir e-posta girin.' : '⚠️ Enter a valid email.');
      return;
    }
    if (formData.password.length < 6) {
      setError(language === 'tr' ? '⚠️ Şifre en az 6 karakter olmalı.' : '⚠️ Password min 6 characters.');
      return;
    }
    if (!isLogin && (!formData.username || formData.username.length < 3)) {
      setError(language === 'tr' ? '⚠️ Kullanıcı adı en az 3 karakter olmalı.' : '⚠️ Username min 3 characters.');
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await auth.signIn(formData.email, formData.password);
        if (error) throw error;
      } else {
        const { data, error } = await auth.signUp(formData.email, formData.password, formData.username);
        if (error) throw error;
        
        if (data?.user && !data?.session) {
          setSuccess(language === 'tr' 
            ? '🎉 Kayıt başarılı! E-posta adresinize doğrulama linki gönderdik. Lütfen kontrol edin.' 
            : '🎉 Registration successful! Check your email for verification link.');
          setFormData({ email: '', password: '', username: '' });
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: theme.colors.background }}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 text-6xl opacity-10 animate-float">⏰</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🎯</div>
        <div className="absolute top-1/2 left-10 text-4xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>⭐</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: theme.colors.surface, color: theme.colors.text }}
          >
            {language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Pomonero" className="h-14 mx-auto mb-3" />
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>{t.slogan}</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: theme.colors.background }}>
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all"
              style={{ 
                background: isLogin ? theme.colors.primary : 'transparent',
                color: isLogin ? 'white' : theme.colors.textMuted
              }}
            >
              {t.login}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all"
              style={{ 
                background: !isLogin ? theme.colors.primary : 'transparent',
                color: !isLogin ? 'white' : theme.colors.textMuted
              }}
            >
              {t.register}
            </button>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: '#22c55e20', color: '#22c55e' }}>
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  👤 {t.username}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className="input-modern"
                  placeholder="kullanici_adi"
                  minLength={3}
                  maxLength={20}
                />
                <p className="text-xs mt-1" style={{ color: theme.colors.textMuted }}>
                  {language === 'tr' ? 'Sadece küçük harf, rakam ve _' : 'Only lowercase, numbers and _'}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                ✉️ {t.email}
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
                🔒 {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-modern pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: '#ef444420', color: '#ef4444' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? '🚀' : '✨'} {isLogin ? t.login : t.register}
                </span>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-sm" style={{ color: theme.colors.textMuted }}>
            {isLogin ? t.noAccount : t.hasAccount}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              className="font-semibold hover:underline"
              style={{ color: theme.colors.primary }}
            >
              {isLogin ? t.register : t.login}
            </button>
          </p>
        </div>

        {/* Decoration */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 text-xl opacity-30">
            <span className="animate-pixel-bounce">⭐</span>
            <span className="animate-pixel-bounce" style={{ animationDelay: '0.1s' }}>🎮</span>
            <span className="animate-pixel-bounce" style={{ animationDelay: '0.2s' }}>⏱️</span>
            <span className="animate-pixel-bounce" style={{ animationDelay: '0.3s' }}>🏆</span>
          </div>
        </div>
      </div>
    </div>
  );
}
