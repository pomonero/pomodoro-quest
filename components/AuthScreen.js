'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/themes';

export default function AuthScreen() {
  const { setUser, setProfile, currentTheme, language, toggleLanguage } = useStore();
  const theme = themes[currentTheme] || themes.midnight;
  const logoSrc = theme.type === 'dark' ? '/logo-light.png' : '/logo-dark.png';

  // Ekran: login, register, forgot, reset, verified
  const [screen, setScreen] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form alanları
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Kontroller
  const [emailExists, setEmailExists] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const t = language === 'tr' ? {
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    email: 'E-posta',
    password: 'Şifre',
    passwordConfirm: 'Şifre Tekrar',
    username: 'Kullanıcı Adı',
    forgotPassword: 'Şifremi Unuttum',
    noAccount: 'Hesabın yok mu?',
    hasAccount: 'Zaten hesabın var mı?',
    sendResetLink: 'Sıfırlama Linki Gönder',
    backToLogin: 'Girişe Dön',
    resetPassword: 'Şifre Sıfırla',
    newPassword: 'Yeni Şifre',
    setNewPassword: 'Yeni Şifreyi Kaydet',
    emailVerified: 'E-posta Doğrulandı!',
    canLogin: 'Artık giriş yapabilirsiniz.',
    // Hatalar
    emailRequired: 'E-posta gerekli',
    passwordRequired: 'Şifre gerekli (min 6 karakter)',
    passwordMismatch: 'Şifreler eşleşmiyor',
    usernameRequired: 'Kullanıcı adı gerekli (min 3 karakter)',
    emailInUse: 'Bu e-posta zaten kayıtlı',
    usernameInUse: 'Bu kullanıcı adı alınmış',
    invalidCredentials: 'E-posta veya şifre hatalı',
    emailNotVerified: 'Lütfen e-postanızı doğrulayın',
    resetLinkSent: 'Sıfırlama linki gönderildi! E-postanızı kontrol edin.',
    passwordUpdated: 'Şifre güncellendi! Giriş yapabilirsiniz.',
    registerSuccess: 'Kayıt başarılı! E-postanızı doğrulayın.',
    unknownError: 'Bir hata oluştu, tekrar deneyin',
  } : {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    passwordConfirm: 'Confirm Password',
    username: 'Username',
    forgotPassword: 'Forgot Password',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    resetPassword: 'Reset Password',
    newPassword: 'New Password',
    setNewPassword: 'Set New Password',
    emailVerified: 'Email Verified!',
    canLogin: 'You can now login.',
    emailRequired: 'Email required',
    passwordRequired: 'Password required (min 6 chars)',
    passwordMismatch: 'Passwords do not match',
    usernameRequired: 'Username required (min 3 chars)',
    emailInUse: 'Email already registered',
    usernameInUse: 'Username taken',
    invalidCredentials: 'Invalid email or password',
    emailNotVerified: 'Please verify your email',
    resetLinkSent: 'Reset link sent! Check your email.',
    passwordUpdated: 'Password updated! You can login.',
    registerSuccess: 'Registered! Please verify your email.',
    unknownError: 'An error occurred, try again',
  };

  // URL'den token kontrolü (şifre sıfırlama veya email doğrulama)
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Email doğrulama başarılı
    if (hash.includes('type=signup') || search.includes('type=signup')) {
      setScreen('verified');
      window.history.replaceState(null, '', window.location.pathname);
    }
    // Şifre sıfırlama
    else if (hash.includes('type=recovery') || search.includes('type=recovery')) {
      setScreen('reset');
      // Token'ı Supabase'e ver
      const params = new URLSearchParams(hash.replace('#', '') || search.replace('?', ''));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        }).catch(console.error);
      }
    }
  }, []);

  // Email kontrolü (register sırasında)
  useEffect(() => {
    if (screen !== 'register' || !email || !email.includes('@')) {
      setEmailExists(false);
      return;
    }
    
    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const { data } = await supabase.from('profiles').select('id').eq('email', email.toLowerCase()).single();
        setEmailExists(!!data);
      } catch {
        setEmailExists(false);
      }
      setCheckingEmail(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [email, screen]);

  // Username kontrolü
  useEffect(() => {
    if (screen !== 'register' || !username || username.length < 3) {
      setUsernameExists(false);
      return;
    }
    
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const { data } = await supabase.from('profiles').select('id').eq('username', username.toLowerCase()).single();
        setUsernameExists(!!data);
      } catch {
        setUsernameExists(false);
      }
      setCheckingUsername(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [username, screen]);

  // GİRİŞ
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!email) return setMessage({ type: 'error', text: t.emailRequired });
    if (!password || password.length < 6) return setMessage({ type: 'error', text: t.passwordRequired });
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message.includes('Invalid login')) {
          setMessage({ type: 'error', text: t.invalidCredentials });
        } else if (error.message.includes('Email not confirmed')) {
          setMessage({ type: 'error', text: t.emailNotVerified });
        } else {
          setMessage({ type: 'error', text: t.unknownError });
        }
        setLoading(false);
        return;
      }
      
      if (data.user) {
        setUser(data.user);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (profile) {
          setProfile(profile);
          localStorage.setItem('pomonero_profile', JSON.stringify(profile));
        }
      }
    } catch {
      setMessage({ type: 'error', text: t.unknownError });
    }
    setLoading(false);
  };

  // KAYIT
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!email || !email.includes('@')) return setMessage({ type: 'error', text: t.emailRequired });
    if (!username || username.length < 3) return setMessage({ type: 'error', text: t.usernameRequired });
    if (!password || password.length < 6) return setMessage({ type: 'error', text: t.passwordRequired });
    if (password !== passwordConfirm) return setMessage({ type: 'error', text: t.passwordMismatch });
    if (emailExists) return setMessage({ type: 'error', text: t.emailInUse });
    if (usernameExists) return setMessage({ type: 'error', text: t.usernameInUse });
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username.toLowerCase(), display_name: username },
          emailRedirectTo: `${window.location.origin}?type=signup`
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          setMessage({ type: 'error', text: t.emailInUse });
        } else {
          setMessage({ type: 'error', text: t.unknownError });
        }
        setLoading(false);
        return;
      }
      
      if (data.user) {
        // Profile oluştur
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          display_name: username,
          avatar_emoji: '😊',
          created_at: new Date().toISOString()
        });
        
        setMessage({ type: 'success', text: t.registerSuccess });
        setTimeout(() => setScreen('login'), 3000);
      }
    } catch {
      setMessage({ type: 'error', text: t.unknownError });
    }
    setLoading(false);
  };

  // ŞİFREMİ UNUTTUM
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!email || !email.includes('@')) return setMessage({ type: 'error', text: t.emailRequired });
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}?type=recovery`
      });
      
      if (error) {
        setMessage({ type: 'error', text: t.unknownError });
      } else {
        setMessage({ type: 'success', text: t.resetLinkSent });
      }
    } catch {
      setMessage({ type: 'error', text: t.unknownError });
    }
    setLoading(false);
  };

  // YENİ ŞİFRE KAYDET
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!password || password.length < 6) return setMessage({ type: 'error', text: t.passwordRequired });
    if (password !== passwordConfirm) return setMessage({ type: 'error', text: t.passwordMismatch });
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setMessage({ type: 'error', text: t.unknownError });
      } else {
        setMessage({ type: 'success', text: t.passwordUpdated });
        await supabase.auth.signOut();
        setTimeout(() => {
          setScreen('login');
          window.history.replaceState(null, '', window.location.pathname);
        }, 2000);
      }
    } catch {
      setMessage({ type: 'error', text: t.unknownError });
    }
    setLoading(false);
  };

  // Form temizle
  const switchScreen = (newScreen) => {
    setScreen(newScreen);
    setMessage({ type: '', text: '' });
    setPassword('');
    setPasswordConfirm('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: theme.colors.background }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['🍅', '⏰', '📚', '☕', '🎯', '⭐', '🎮', '🌙'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-20 animate-float"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i % 3}s`
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 p-2 rounded-lg text-2xl hover:scale-110 transition-transform z-10"
      >
        {language === 'tr' ? '🇹🇷' : '🇬🇧'}
      </button>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl relative z-10 animate-fadeIn" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logoSrc} alt="Pomonero" className="h-16 mx-auto mb-4" />
        </div>

        {/* EMAIL DOĞRULANDI */}
        {screen === 'verified' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{t.emailVerified}</h2>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>{t.canLogin}</p>
            <button onClick={() => switchScreen('login')} className="w-full py-3 rounded-xl font-semibold text-white" style={{ background: 'var(--primary)' }}>
              {t.login}
            </button>
          </div>
        )}

        {/* GİRİŞ */}
        {screen === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--text)' }}>{t.login}</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                placeholder="ornek@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{t.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl outline-none pr-12 transition-all focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>
            
            <button type="button" onClick={() => switchScreen('forgot')} className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>
              {t.forgotPassword}
            </button>
            
            {message.text && (
              <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}
            
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {loading ? '...' : t.login}
            </button>
            
            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              {t.noAccount}{' '}
              <button type="button" onClick={() => switchScreen('register')} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                {t.register}
              </button>
            </p>
          </form>
        )}

        {/* KAYIT */}
        {screen === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--text)' }}>{t.register}</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{t.email}</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl outline-none pr-10 transition-all focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ background: 'var(--surface)', border: `1px solid ${emailExists ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                  placeholder="ornek@email.com"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingEmail ? '⏳' : emailExists ? '❌' : email.includes('@') ? '✅' : ''}
                </span>
              </div>
              {emailExists && <p className="text-xs text-red-400 mt-1">{t.emailInUse}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{t.username}</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full p-3 rounded-xl outline-none pr-10 transition-all focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ background: 'var(--surface)', border: `1px solid ${usernameExists ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                  placeholder="kullaniciadi"
                  maxLength={20}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername ? '⏳' : usernameExists ? '❌' : username.length >= 3 ? '✅' : ''}
                </span>
              </div>
              {usernameExists && <p className="text-xs text-red-400 mt-1">{t.usernameInUse}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{t.password}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                placeholder="••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{t.passwordConfirm}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full p-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--surface)', border: `1px solid ${passwordConfirm && password !== passwordConfirm ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                placeholder="••••••"
              />
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="rounded" />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{language === 'tr' ? 'Şifreyi göster' : 'Show password'}</span>
            </label>
            
            {message.text && (
              <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}
            
            <button type="submit" disabled={loading || emailExists || usernameExists} className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {loading ? '...' : t.register}
            </button>
            
            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              {t.hasAccount}{' '}
              <button type="button" onClick={() => switchScreen('login')} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                {t.login}
              </button>
            </p>
          </form>
        )}

        {/* ŞİFREMİ UNUTTUM */}
        {screen === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--text)' }}>{t.forgotPassword}</h2>
            <p className="text-center text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {language === 'tr' ? 'E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.' : 'Enter your email and we will send you a reset link.'}
            </p>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                placeholder="ornek@email.com"
              />
            </div>
            
            {message.text && (
              <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}
            
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {loading ? '...' : t.sendResetLink}
            </button>
            
            <button type="button" onClick={() => switchScreen('login')} className="w-full py-2 text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
              ← {t.backToLogin}
            </button>
          </form>
        )}

        {/* YENİ ŞİFRE BELİRLE */}
        {screen === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--text)' }}>{t.resetPassword}</h2>
            <div className="text-center text-4xl mb-4">🔐</div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{t.newPassword}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                placeholder="••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{t.passwordConfirm}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full p-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                placeholder="••••••"
              />
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="rounded" />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{language === 'tr' ? 'Şifreyi göster' : 'Show password'}</span>
            </label>
            
            {message.text && (
              <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}
            
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50" style={{ background: 'var(--primary)' }}>
              {loading ? '...' : t.setNewPassword}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}
