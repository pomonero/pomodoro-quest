'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { themes } from '@/lib/themes';

export default function AuthScreen() {
  const { language, toggleLanguage, currentTheme } = useStore();
  const t = translations[language] || translations.tr;
  const theme = themes[currentTheme] || themes.midnight;
  const logoSrc = theme.type === 'dark' ? '/logo-light.png' : '/logo-dark.png';

  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '', username: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // URL kontrolü - email doğrulama ve şifre sıfırlama
  useEffect(() => {
    const processAuthCallback = async () => {
      // URL hash veya query params kontrol
      const hash = window.location.hash;
      const search = window.location.search;
      
      // Hash içinde token var mı?
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        if (type === 'recovery' && accessToken && refreshToken && supabase) {
          // Şifre sıfırlama - session ayarla
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            setMode('reset');
          } catch (err) {
            console.error('Session error:', err);
            setError(language === 'tr' ? 'Link geçersiz veya süresi dolmuş.' : 'Invalid or expired link.');
          }
        } else if (type === 'signup' || type === 'email' || type === 'magiclink') {
          // Email doğrulama
          setMode('verified');
        }
        
        // URL'i temizle
        window.history.replaceState(null, '', window.location.pathname);
      }
      
      // Error varsa göster
      if (hash && hash.includes('error')) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDesc = params.get('error_description');
        if (errorDesc) {
          setError(decodeURIComponent(errorDesc));
        }
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    
    processAuthCallback();
  }, [language]);

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
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.username, mode]);

  const getErrorMessage = (err) => {
    const msg = err?.message?.toLowerCase() || '';
    if (msg.includes('already registered') || msg.includes('already exists')) return language === 'tr' ? '⚠️ Bu e-posta zaten kayıtlı.' : '⚠️ Email already registered.';
    if (msg.includes('invalid login') || msg.includes('invalid credentials')) return language === 'tr' ? '⚠️ E-posta veya şifre hatalı.' : '⚠️ Invalid email or password.';
    if (msg.includes('email not confirmed')) return language === 'tr' ? '⚠️ E-postanızı doğrulayın.' : '⚠️ Please verify your email.';
    if (msg.includes('password') && msg.includes('6')) return language === 'tr' ? '⚠️ Şifre en az 6 karakter.' : '⚠️ Password min 6 characters.';
    if (msg.includes('rate limit')) return language === 'tr' ? '⚠️ Çok fazla deneme. Bekleyin.' : '⚠️ Too many attempts. Wait.';
    if (msg.includes('expired') || msg.includes('invalid')) return language === 'tr' ? '⚠️ Link geçersiz veya süresi dolmuş.' : '⚠️ Invalid or expired link.';
    return language === 'tr' ? '⚠️ Bir hata oluştu.' : '⚠️ An error occurred.';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    if (formData.password.length < 6) { setError(language === 'tr' ? '⚠️ Şifre en az 6 karakter.' : '⚠️ Min 6 characters.'); return; }
    if (formData.password !== formData.confirmPassword) { setError(language === 'tr' ? '⚠️ Şifreler eşleşmiyor.' : '⚠️ Passwords don\'t match.'); return; }
    if (usernameAvailable === false) { setError(language === 'tr' ? '⚠️ Kullanıcı adı alınmış.' : '⚠️ Username taken.'); return; }
    
    setLoading(true);
    try {
      if (!supabase) throw new Error('Not configured');
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { username: formData.username.toLowerCase() },
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      if (data?.user && !data?.session) {
        setSuccess(language === 'tr' ? '🎉 Kayıt başarılı! E-postanızı kontrol edin.' : '🎉 Success! Check your email.');
        setFormData({ email: '', password: '', username: '', confirmPassword: '' });
      }
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) { setError(language === 'tr' ? '⚠️ Tüm alanları doldurun.' : '⚠️ Fill all fields.'); return; }
    setLoading(true);
    try {
      if (!supabase) throw new Error('Not configured');
      const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
      if (error) throw error;
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.email.includes('@')) { setError(language === 'tr' ? '⚠️ Geçerli e-posta girin.' : '⚠️ Enter valid email.'); return; }
    setLoading(true);
    try {
      if (!supabase) throw new Error('Not configured');
      
      // Redirect URL - tam site URL'i kullan
      const redirectUrl = window.location.origin;
      
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
      setSuccess(language === 'tr' ? '📧 Şifre sıfırlama linki gönderildi! E-postanızı kontrol edin.' : '📧 Reset link sent! Check your email.');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (formData.password.length < 6) { setError(language === 'tr' ? '⚠️ Şifre en az 6 karakter.' : '⚠️ Min 6 characters.'); return; }
    if (formData.password !== formData.confirmPassword) { setError(language === 'tr' ? '⚠️ Şifreler eşleşmiyor.' : '⚠️ Passwords don\'t match.'); return; }
    setLoading(true);
    try {
      if (!supabase) throw new Error('Not configured');
      const { error } = await supabase.auth.updateUser({ password: formData.password });
      if (error) throw error;
      setSuccess(language === 'tr' ? '✅ Şifre güncellendi! Giriş yapabilirsiniz.' : '✅ Password updated!');
      
      // Oturumu kapat ve login'e yönlendir
      setTimeout(async () => {
        await supabase.auth.signOut();
        setMode('login');
        setFormData({ email: '', password: '', username: '', confirmPassword: '' });
      }, 2000);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const changeMode = (newMode) => {
    setMode(newMode); setError(''); setSuccess('');
    setFormData({ email: '', password: '', username: '', confirmPassword: '' });
    setUsernameAvailable(null);
  };

  // Doğrulama ekranı
  if (mode === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: theme.colors.text }}>
              {language === 'tr' ? 'E-posta Doğrulandı!' : 'Email Verified!'}
            </h1>
            <p className="mb-6" style={{ color: theme.colors.textMuted }}>
              {language === 'tr' ? 'Artık giriş yapabilirsiniz.' : 'You can now login.'}
            </p>
            <button onClick={() => changeMode('login')} className="w-full btn-primary py-3 text-lg">
              🚀 {language === 'tr' ? 'Giriş Yap' : 'Login'}
            </button>
          </div>
          <img src={logoSrc} alt="Pomonero" className="h-12 sm:h-14 md:h-16 mx-auto mt-8 opacity-50" />
        </div>
      </div>
    );
  }

  // Şifre sıfırlama ekranı
  if (mode === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logoSrc} alt="Pomonero" className="h-14 sm:h-16 md:h-20 mx-auto mb-4" />
          </div>
          <div className="card p-8">
            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block">🔐</span>
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
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>🔒 {language === 'tr' ? 'Tekrar' : 'Confirm'}</label>
                <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="input-modern" placeholder="••••••••" required minLength={6} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                <span className="text-sm" style={{ color: theme.colors.textMuted }}>{language === 'tr' ? 'Şifreyi göster' : 'Show password'}</span>
              </label>
              {error && <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400">{error}</div>}
              {success && <div className="p-3 rounded-xl text-sm bg-green-500/20 text-green-400">{success}</div>}
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? '...' : '✅ ' + (language === 'tr' ? 'Şifreyi Güncelle' : 'Update Password')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Şifremi unuttum
  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <button onClick={toggleLanguage} className="px-4 py-2 rounded-xl text-sm" style={{ background: theme.colors.surface, color: theme.colors.text }}>
              {language === 'tr' ? '🇹🇷' : '🇬🇧'}
            </button>
          </div>
          <div className="text-center mb-8">
            <img src={logoSrc} alt="Pomonero" className="h-14 sm:h-16 md:h-20 mx-auto mb-4" />
          </div>
          <div className="card p-8">
            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block">🔑</span>
              <h2 className="text-xl font-bold" style={{ color: theme.colors.text }}>{language === 'tr' ? 'Şifremi Unuttum' : 'Forgot Password'}</h2>
              <p className="text-sm mt-2" style={{ color: theme.colors.textMuted }}>
                {language === 'tr' ? 'E-posta adresinize sıfırlama linki göndereceğiz' : 'We will send a reset link to your email'}
              </p>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>✉️ E-posta</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-modern" placeholder="email@example.com" required />
              </div>
              {error && <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400">{error}</div>}
              {success && <div className="p-3 rounded-xl text-sm bg-green-500/20 text-green-400">{success}</div>}
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? '...' : '📧 ' + (language === 'tr' ? 'Sıfırlama Linki Gönder' : 'Send Reset Link')}
              </button>
            </form>
            <p className="text-center mt-6">
              <button onClick={() => changeMode('login')} className="text-sm font-medium" style={{ color: theme.colors.primary }}>← {language === 'tr' ? 'Giriş sayfasına dön' : 'Back to login'}</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ana giriş/kayıt
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button onClick={toggleLanguage} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: theme.colors.surface, color: theme.colors.text }}>
            {language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
          </button>
        </div>

        <div className="text-center mb-8">
          <img src={logoSrc} alt="Pomonero" className="h-14 sm:h-16 md:h-20 lg:h-24 mx-auto mb-4" />
          <p style={{ color: theme.colors.textMuted }}>{t.slogan}</p>
        </div>

        <div className="card p-8">
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: theme.colors.background }}>
            <button onClick={() => changeMode('login')} className="flex-1 py-3 rounded-lg font-semibold transition-all" style={{ background: mode === 'login' ? theme.colors.primary : 'transparent', color: mode === 'login' ? 'white' : theme.colors.textMuted }}>{t.login}</button>
            <button onClick={() => changeMode('register')} className="flex-1 py-3 rounded-lg font-semibold transition-all" style={{ background: mode === 'register' ? theme.colors.primary : 'transparent', color: mode === 'register' ? 'white' : theme.colors.textMuted }}>{t.register}</button>
          </div>

          {success && <div className="mb-4 p-4 rounded-xl text-sm bg-green-500/20 text-green-400">{success}</div>}

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
                <button type="button" onClick={() => changeMode('forgot')} className="text-sm font-medium" style={{ color: theme.colors.primary }}>🔑 {language === 'tr' ? 'Şifremi Unuttum' : 'Forgot Password'}</button>
              </div>
              {error && <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400">{error}</div>}
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? '...' : '🚀 ' + t.login}
              </button>
            </form>
          )}

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
                {usernameAvailable === false && <p className="text-xs text-red-400 mt-1">{language === 'tr' ? 'Bu kullanıcı adı alınmış' : 'Username taken'}</p>}
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
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                <span className="text-sm" style={{ color: theme.colors.textMuted }}>{language === 'tr' ? 'Şifreleri göster' : 'Show passwords'}</span>
              </label>
              {error && <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-400">{error}</div>}
              <button type="submit" disabled={loading || usernameAvailable === false || checkingUsername} className="w-full btn-primary py-3 disabled:opacity-50">
                {loading ? '...' : '✨ ' + t.register}
              </button>
            </form>
          )}

          <p className="text-center mt-6 text-sm" style={{ color: theme.colors.textMuted }}>
            {mode === 'login' ? t.noAccount : t.hasAccount}{' '}
            <button onClick={() => changeMode(mode === 'login' ? 'register' : 'login')} className="font-semibold" style={{ color: theme.colors.primary }}>{mode === 'login' ? t.register : t.login}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
