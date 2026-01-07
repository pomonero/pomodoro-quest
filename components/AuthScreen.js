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

  // Tema tipine göre logo
  const logoSrc = theme.type === 'dark' ? '/logo-light.png' : '/logo-dark.png';

  // States
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '', username: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Kontrol states
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);

  // URL hash kontrolü
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token') && (hash.includes('type=signup') || hash.includes('type=email'))) {
      setMode('verified');
      window.history.replaceState(null, '', window.location.pathname);
    }
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

  // Kullanıcı adı kontrolü
  useEffect(() => {
    if (mode !== 'register' || !formData.username || formData.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', formData.username.toLowerCase())
            .maybeSingle();
          
          if (error) {
            console.log('Username check error:', error);
            setUsernameAvailable(true);
          } else {
            setUsernameAvailable(!data);
          }
        } else {
          setUsernameAvailable(true);
        }
      } catch (err) {
        console.log('Username check exception:', err);
        setUsernameAvailable(true);
      }
      setCheckingUsername(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.username, mode]);

  // Email kontrolü
  useEffect(() => {
    if (mode !== 'register' || !formData.email || !formData.email.includes('@') || !formData.email.includes('.')) {
      setEmailAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        if (supabase) {
          // auth.users tablosundan kontrol (profiles üzerinden)
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
          
          // Supabase'de email kontrolü için signInWithPassword deneyebiliriz
          // Ama bu güvenlik riski olabilir, o yüzden sadece kayıt sırasında kontrol edeceğiz
          // Email kontrolünü Supabase'in kendi hata mesajına bırakıyoruz
          setEmailAvailable(null); // Email kontrolünü kayıt sırasında yapacağız
        }
      } catch (err) {
        console.log('Email check exception:', err);
      }
      setCheckingEmail(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.email, mode]);

  // Hata mesajları
  const getErrorMessage = (err) => {
    const msg = err?.message?.toLowerCase() || '';
    
    if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already registered')) {
      return language === 'tr' 
        ? '⚠️ Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.' 
        : '⚠️ This email is already registered. Try logging in.';
    }
    if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
      return language === 'tr' 
        ? '⚠️ E-posta veya şifre hatalı.' 
        : '⚠️ Invalid email or password.';
    }
    if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
      return language === 'tr' 
        ? '⚠️ E-postanızı henüz doğrulamadınız. Lütfen e-postanızı kontrol edin.' 
        : '⚠️ Please verify your email first. Check your inbox.';
    }
    if (msg.includes('password') && (msg.includes('6') || msg.includes('short'))) {
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
      setError(language === 'tr' ? '⚠️ Bu kullanıcı adı zaten alınmış. Başka bir tane deneyin.' : '⚠️ This username is already taken. Try another one.');
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await auth.signUp(formData.email, formData.password, formData.username.toLowerCase());
      
      if (error) {
        // Supabase hatası - email zaten kayıtlı olabilir
        throw error;
      }
      
      if (data?.user && !data?.session) {
        setSuccess(language === 'tr' 
          ? '🎉 Kayıt başarılı! E-posta adresinize doğrulama linki gönderdik. Lütfen e-postanızı kontrol edin ve linke tıklayın.' 
          : '🎉 Registration successful! We sent a verification link to your email. Please check your inbox and click the link.');
        setFormData({ email: '', password: '', username: '', confirmPassword: '' });
        setUsernameAvailable(null);
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

  // Şifre sıfırla
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
    setUsernameAvailable(null);
    setEmailAvailable(null);
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
            <img src={logoSrc} alt="Pomonero" className="h-12 mx-auto opacity-50" />
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
            <img src={logoSrc} alt="Pomonero" className="h-14 mx-auto mb-3" />
          </div>
          
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[var(--primary)]/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔐</span>
              </div>
              <h2 className="text-xl font-bold" style={{ color: theme.colors.text }}>
                {language === 'tr' ? 'Yeni Şifre Belirle' : 'Set New Password'}
              </h2>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>🔒 {language === 'tr' ? 'Yeni Şifre' : 'New Password'}</label>
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-modern" placeholder="••••••••" required minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>🔒 {language === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}</label>
                <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="input-modern" placeholder="••••••••" required minLength={6} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="rounded" />
                <span className="text-sm" style={{ color: theme.colors.textMuted }}>{language === 'tr' ? 'Şifreyi göster' : 'Show password'}</span>
              </label>
              {error && <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400">{error}</div>}
              {success && <div className="p-3 rounded-xl text-sm bg-green-500/20 text-green-400">{success}</div>}
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span></span> : <span>✅ {language === 'tr' ? 'Şifreyi Güncelle' : 'Update Password'}</span>}
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
            <img src={logoSrc} alt="Pomonero" className="h-14 mx-auto mb-3" />
          </div>
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔑</span>
              </div>
              <h2 className="text-xl font-bold" style={{ color: theme.colors.text }}>{language === 'tr' ? 'Şifremi Unuttum' : 'Forgot Password'}</h2>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>✉️ {t.email}</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-modern" placeholder="email@example.com" required />
              </div>
              {error && <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400">{error}</div>}
              {success && <div className="p-3 rounded-xl text-sm bg-green-500/20 text-green-400">{success}</div>}
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span></span> : <span>📧 {language === 'tr' ? 'Sıfırlama Linki Gönder' : 'Send Reset Link'}</span>}
              </button>
            </form>
            <p className="text-center mt-6 text-sm" style={{ color: theme.colors.textMuted }}>
              <button onClick={() => changeMode('login')} className="font-semibold hover:underline" style={{ color: theme.colors.primary }}>← {language === 'tr' ? 'Giriş sayfasına dön' : 'Back to login'}</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ana giriş/kayıt ekranı
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: theme.colors.background }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 text-6xl opacity-10 animate-float">⏰</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🎯</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-end mb-4">
          <button onClick={toggleLanguage} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: theme.colors.surface, color: theme.colors.text }}>
            {language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
          </button>
        </div>

        <div className="text-center mb-8">
          <img src={logoSrc} alt="Pomonero" className="h-16 mx-auto mb-3" style={{ maxWidth: '200px' }} />
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>{t.slogan}</p>
        </div>

        <div className="card p-8">
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: theme.colors.background }}>
            <button onClick={() => changeMode('login')} className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all" style={{ background: mode === 'login' ? theme.colors.primary : 'transparent', color: mode === 'login' ? 'white' : theme.colors.textMuted }}>{t.login}</button>
            <button onClick={() => changeMode('register')} className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all" style={{ background: mode === 'register' ? theme.colors.primary : 'transparent', color: mode === 'register' ? 'white' : theme.colors.textMuted }}>{t.register}</button>
          </div>

          {success && <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: '#22c55e20', color: '#22c55e' }}>{success}</div>}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>✉️ {t.email}</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-modern" placeholder="email@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>🔒 {t.password}</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-modern pr-12" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">{showPassword ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={() => changeMode('forgot')} className="text-sm hover:underline" style={{ color: theme.colors.primary }}>🔑 {language === 'tr' ? 'Şifremi Unuttum' : 'Forgot Password'}</button>
              </div>
              {error && <div className="p-3 rounded-xl text-sm" style={{ background: '#ef444420', color: '#ef4444' }}>{error}</div>}
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>{language === 'tr' ? 'Giriş yapılıyor...' : 'Logging in...'}</span> : <span className="flex items-center justify-center gap-2">🚀 {t.login}</span>}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>👤 {t.username}</label>
                <div className="relative">
                  <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} className="input-modern pr-10" placeholder="kullanici_adi" minLength={3} maxLength={20} required />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block"></span>}
                    {!checkingUsername && usernameAvailable === true && formData.username.length >= 3 && <span className="text-green-500 text-lg">✓</span>}
                    {!checkingUsername && usernameAvailable === false && <span className="text-red-500 text-lg">✗</span>}
                  </span>
                </div>
                {usernameAvailable === false && <p className="text-xs text-red-400 mt-1">{language === 'tr' ? '❌ Bu kullanıcı adı zaten alınmış' : '❌ This username is taken'}</p>}
                {usernameAvailable === true && formData.username.length >= 3 && <p className="text-xs text-green-400 mt-1">{language === 'tr' ? '✅ Kullanıcı adı müsait' : '✅ Username available'}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>✉️ {t.email}</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-modern" placeholder="email@example.com" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>🔒 {t.password}</label>
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-modern" placeholder="••••••••" required minLength={6} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>🔒 {language === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}</label>
                <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="input-modern" placeholder="••••••••" required minLength={6} />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && <p className="text-xs text-red-400 mt-1">{language === 'tr' ? 'Şifreler eşleşmiyor' : 'Passwords do not match'}</p>}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="rounded" />
                <span className="text-sm" style={{ color: theme.colors.textMuted }}>{language === 'tr' ? 'Şifreleri göster' : 'Show passwords'}</span>
              </label>

              {error && <div className="p-3 rounded-xl text-sm" style={{ background: '#ef444420', color: '#ef4444' }}>{error}</div>}

              <button type="submit" disabled={loading || usernameAvailable === false || checkingUsername} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>{language === 'tr' ? 'Kayıt yapılıyor...' : 'Registering...'}</span> : <span className="flex items-center justify-center gap-2">✨ {t.register}</span>}
              </button>
            </form>
          )}

          <p className="text-center mt-6 text-sm" style={{ color: theme.colors.textMuted }}>
            {mode === 'login' ? t.noAccount : t.hasAccount}{' '}
            <button onClick={() => changeMode(mode === 'login' ? 'register' : 'login')} className="font-semibold hover:underline" style={{ color: theme.colors.primary }}>{mode === 'login' ? t.register : t.login}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
