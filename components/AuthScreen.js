'use client';

import { useState, useEffect } from 'react';
import { auth, supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { themes } from '@/lib/themes';

export default function AuthScreen() {
  const { language, toggleLanguage, currentTheme } = useStore();
  const t = translations[language] || translations.tr;
  const theme = themes[currentTheme] || themes.midnight;

  // States
  const [mode, setMode] = useState('login'); // login, register, forgot, reset, verified
  const [formData, setFormData] = useState({ email: '', password: '', username: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // URL hash kontrolü - email doğrulama ve şifre sıfırlama
  useEffect(() => {
    const hash = window.location.hash;
    
    // Email doğrulama başarılı
    if (hash.includes('access_token') && (hash.includes('type=signup') || hash.includes('type=email'))) {
      setMode('verified');
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    // Şifre sıfırlama linki
    if (hash.includes('type=recovery')) {
      setMode('reset');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Tema uygula
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.style.background = theme.colors.background;
  }, [currentTheme, theme]);

  // Kullanıcı adı kontrolü (debounced)
  useEffect(() => {
    if (mode !== 'register' || !formData.username || formData.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        if (supabase) {
          const { data } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', formData.username.toLowerCase())
            .maybeSingle();
          
          setUsernameAvailable(!data);
        } else {
          setUsernameAvailable(true);
        }
      } catch {
        setUsernameAvailable(true);
      }
      setCheckingUsername(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, mode]);

  // Hata mesajları
  const getErrorMessage = (err) => {
    const msg = err?.message || '';
    
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return language === 'tr' 
        ? '⚠️ Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.' 
        : '⚠️ This email is already registered. Try logging in.';
    }
    if (msg.includes('Invalid login') || msg.includes('Invalid credentials')) {
      return language === 'tr' 
        ? '⚠️ E-posta veya şifre hatalı.' 
        : '⚠️ Invalid email or password.';
    }
    if (msg.includes('not confirmed') || msg.includes('Email not confirmed')) {
      return language === 'tr' 
        ? '⚠️ E-postanızı henüz doğrulamadınız. Lütfen e-postanızı kontrol edin.' 
        : '⚠️ Please verify your email first. Check your inbox.';
    }
    if (msg.includes('6 characters') || msg.includes('at least 6')) {
      return language === 'tr' 
        ? '⚠️ Şifre en az 6 karakter olmalı.' 
        : '⚠️ Password must be at least 6 characters.';
    }
    if (msg.includes('invalid') && msg.includes('email')) {
      return language === 'tr' 
        ? '⚠️ Geçerli bir e-posta adresi girin.' 
        : '⚠️ Please enter a valid email address.';
    }
    if (msg.includes('rate limit') || msg.includes('too many')) {
      return language === 'tr' 
        ? '⚠️ Çok fazla deneme yaptınız. Lütfen birkaç dakika bekleyin.' 
        : '⚠️ Too many attempts. Please wait a few minutes.';
    }
    if (msg.includes('User not found')) {
      return language === 'tr' 
        ? '⚠️ Bu e-posta ile kayıtlı kullanıcı bulunamadı.' 
        : '⚠️ No user found with this email.';
    }
    
    return language === 'tr' 
      ? '⚠️ Bir hata oluştu. Lütfen tekrar deneyin.' 
      : '⚠️ An error occurred. Please try again.';
  };

  // Kayıt ol
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validasyonlar
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError(language === 'tr' ? '⚠️ Geçerli bir e-posta adresi girin.' : '⚠️ Enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError(language === 'tr' ? '⚠️ Şifre en az 6 karakter olmalı.' : '⚠️ Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(language === 'tr' ? '⚠️ Şifreler eşleşmiyor.' : '⚠️ Passwords do not match.');
      return;
    }
    if (!formData.username || formData.username.length < 3) {
      setError(language === 'tr' ? '⚠️ Kullanıcı adı en az 3 karakter olmalı.' : '⚠️ Username must be at least 3 characters.');
      return;
    }
    if (usernameAvailable === false) {
      setError(language === 'tr' ? '⚠️ Bu kullanıcı adı zaten alınmış.' : '⚠️ This username is already taken.');
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await auth.signUp(formData.email, formData.password, formData.username.toLowerCase());
      
      if (error) throw error;
      
      if (data?.user && !data?.session) {
        setSuccess(language === 'tr' 
          ? '🎉 Kayıt başarılı! E-posta adresinize doğrulama linki gönderdik. Lütfen e-postanızı kontrol edin ve linke tıklayın.' 
          : '🎉 Registration successful! We sent a verification link to your email. Please check your inbox and click the link.');
        setFormData({ email: '', password: '', username: '', confirmPassword: '' });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Giriş yap
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError(language === 'tr' ? '⚠️ E-posta ve şifre gerekli.' : '⚠️ Email and password are required.');
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await auth.signIn(formData.email, formData.password);
      if (error) throw error;
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Şifremi unuttum
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.email.includes('@')) {
      setError(language === 'tr' ? '⚠️ Geçerli bir e-posta adresi girin.' : '⚠️ Enter a valid email address.');
      return;
    }
    
    setLoading(true);

    try {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}`,
      });
      
      if (error) throw error;
      
      setSuccess(language === 'tr' 
        ? '📧 Şifre sıfırlama linki e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.' 
        : '📧 Password reset link has been sent to your email. Please check your inbox.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Şifre sıfırla (yeni şifre belirle)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password.length < 6) {
      setError(language === 'tr' ? '⚠️ Şifre en az 6 karakter olmalı.' : '⚠️ Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(language === 'tr' ? '⚠️ Şifreler eşleşmiyor.' : '⚠️ Passwords do not match.');
      return;
    }
    
    setLoading(true);

    try {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { error } = await supabase.auth.updateUser({ password: formData.password });
      
      if (error) throw error;
      
      setSuccess(language === 'tr' 
        ? '✅ Şifreniz başarıyla güncellendi! Şimdi giriş yapabilirsiniz.' 
        : '✅ Your password has been updated! You can now login.');
      
      setTimeout(() => {
        setMode('login');
        setFormData({ email: '', password: '', username: '', confirmPassword: '' });
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Mod değiştir
  const changeMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', username: '', confirmPassword: '' });
  };

  // Email doğrulandı ekranı
  if (mode === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: theme.colors.text }}>
              {language === 'tr' ? 'E-posta Doğrulandı!' : 'Email Verified!'}
            </h1>
            <p className="mb-6" style={{ color: theme.colors.textMuted }}>
              {language === 'tr' 
                ? 'Hesabınız başarıyla doğrulandı. Artık Pomonero\'ya giriş yapabilirsiniz.' 
                : 'Your account has been verified. You can now login to Pomonero.'}
            </p>
            <button onClick={() => changeMode('login')} className="w-full btn-primary py-3">
              🚀 {language === 'tr' ? 'Giriş Yap' : 'Login Now'}
            </button>
          </div>
          <div className="mt-6">
            <img src="/logo.png" alt="Pomonero" className="h-10 mx-auto opacity-50" />
          </div>
        </div>
      </div>
    );
  }

  // Şifre sıfırlama ekranı
  if (mode === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Pomonero" className="h-12 mx-auto mb-3" />
          </div>
          
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[var(--primary)]/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔐</span>
              </div>
              <h2 className="text-xl font-bold" style={{ color: theme.colors.text }}>
                {language === 'tr' ? 'Yeni Şifre Belirle' : 'Set New Password'}
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
                {language === 'tr' ? 'Hesabınız için yeni bir şifre oluşturun' : 'Create a new password for your account'}
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  🔒 {language === 'tr' ? 'Yeni Şifre' : 'New Password'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-modern"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  🔒 {language === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-modern"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="rounded" />
                <span className="text-sm" style={{ color: theme.colors.textMuted }}>
                  {language === 'tr' ? 'Şifreyi göster' : 'Show password'}
                </span>
              </label>

              {error && <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400">{error}</div>}
              {success && <div className="p-3 rounded-xl text-sm bg-green-500/20 text-green-400">{success}</div>}

              <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {language === 'tr' ? 'Güncelleniyor...' : 'Updating...'}
                  </span>
                ) : (
                  <span>✅ {language === 'tr' ? 'Şifreyi Güncelle' : 'Update Password'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Şifremi unuttum ekranı
  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: theme.colors.surface, color: theme.colors.text }}>
              {language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
            </button>
          </div>
          
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Pomonero" className="h-12 mx-auto mb-3" />
          </div>
          
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔑</span>
              </div>
              <h2 className="text-xl font-bold" style={{ color: theme.colors.text }}>
                {language === 'tr' ? 'Şifremi Unuttum' : 'Forgot Password'}
              </h2>
              <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
                {language === 'tr' ? 'E-posta adresinize şifre sıfırlama linki göndereceğiz' : 'We will send a password reset link to your email'}
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
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

              {error && <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400">{error}</div>}
              {success && <div className="p-3 rounded-xl text-sm bg-green-500/20 text-green-400">{success}</div>}

              <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {language === 'tr' ? 'Gönderiliyor...' : 'Sending...'}
                  </span>
                ) : (
                  <span>📧 {language === 'tr' ? 'Sıfırlama Linki Gönder' : 'Send Reset Link'}</span>
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-sm" style={{ color: theme.colors.textMuted }}>
              <button onClick={() => changeMode('login')} className="font-semibold hover:underline" style={{ color: theme.colors.primary }}>
                ← {language === 'tr' ? 'Giriş sayfasına dön' : 'Back to login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ana giriş/kayıt ekranı
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
          <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: theme.colors.surface, color: theme.colors.text }}>
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
              onClick={() => changeMode('login')}
              className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all"
              style={{ 
                background: mode === 'login' ? theme.colors.primary : 'transparent',
                color: mode === 'login' ? 'white' : theme.colors.textMuted
              }}
            >
              {t.login}
            </button>
            <button
              onClick={() => changeMode('register')}
              className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all"
              style={{ 
                background: mode === 'register' ? theme.colors.primary : 'transparent',
                color: mode === 'register' ? 'white' : theme.colors.textMuted
              }}
            >
              {t.register}
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: '#22c55e20', color: '#22c55e' }}>
              {success}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
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
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Şifremi Unuttum */}
              <div className="text-right">
                <button type="button" onClick={() => changeMode('forgot')} className="text-sm hover:underline" style={{ color: theme.colors.primary }}>
                  {language === 'tr' ? '🔑 Şifremi Unuttum' : '🔑 Forgot Password'}
                </button>
              </div>

              {error && <div className="p-3 rounded-xl text-sm" style={{ background: '#ef444420', color: '#ef4444' }}>{error}</div>}

              <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {language === 'tr' ? 'Giriş yapılıyor...' : 'Logging in...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">🚀 {t.login}</span>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  👤 {t.username}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className="input-modern pr-10"
                    placeholder="kullanici_adi"
                    minLength={3}
                    maxLength={20}
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block"></span>}
                    {!checkingUsername && usernameAvailable === true && <span className="text-green-500">✓</span>}
                    {!checkingUsername && usernameAvailable === false && <span className="text-red-500">✗</span>}
                  </span>
                </div>
                {usernameAvailable === false && (
                  <p className="text-xs text-red-400 mt-1">{language === 'tr' ? 'Bu kullanıcı adı zaten alınmış' : 'This username is taken'}</p>
                )}
                {usernameAvailable === true && formData.username.length >= 3 && (
                  <p className="text-xs text-green-400 mt-1">{language === 'tr' ? 'Kullanıcı adı müsait ✓' : 'Username available ✓'}</p>
                )}
                <p className="text-xs mt-1" style={{ color: theme.colors.textMuted }}>
                  {language === 'tr' ? 'Sadece küçük harf, rakam ve _' : 'Only lowercase, numbers and _'}
                </p>
              </div>

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
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-modern"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  🔒 {language === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-modern"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">{language === 'tr' ? 'Şifreler eşleşmiyor' : 'Passwords do not match'}</p>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="rounded" />
                <span className="text-sm" style={{ color: theme.colors.textMuted }}>
                  {language === 'tr' ? 'Şifreleri göster' : 'Show passwords'}
                </span>
              </label>

              {error && <div className="p-3 rounded-xl text-sm" style={{ background: '#ef444420', color: '#ef4444' }}>{error}</div>}

              <button 
                type="submit" 
                disabled={loading || usernameAvailable === false || checkingUsername}
                className="w-full btn-primary py-3 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {language === 'tr' ? 'Kayıt yapılıyor...' : 'Registering...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">✨ {t.register}</span>
                )}
              </button>
            </form>
          )}

          {/* Toggle Link */}
          <p className="text-center mt-6 text-sm" style={{ color: theme.colors.textMuted }}>
            {mode === 'login' ? t.noAccount : t.hasAccount}{' '}
            <button
              onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold hover:underline"
              style={{ color: theme.colors.primary }}
            >
              {mode === 'login' ? t.register : t.login}
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
