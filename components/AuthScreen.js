'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/themes';

export default function AuthScreen() {
  const { setUser, setProfile, currentTheme, language, toggleLanguage } = useStore();
  const theme = themes[currentTheme] || themes.midnight;

  const [screen, setScreen] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [emailStatus, setEmailStatus] = useState({ checking: false, exists: false });
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, exists: false });

  const tr = language === 'tr';
  const t = tr ? {
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
    emailVerified: '🎉 E-posta Doğrulandı!',
    canLogin: 'Harika! Artık Pomonero\'ya giriş yapabilirsiniz.',
    welcomeTitle: 'Pomonero\'ya Hoş Geldiniz!',
    welcomeText: 'Hesabınız başarıyla doğrulandı. Şimdi giriş yaparak odaklanmaya başlayabilirsiniz.',
    invalidEmail: 'Geçerli bir e-posta girin',
    passwordRequired: 'Şifre gerekli (min 6 karakter)',
    passwordMismatch: 'Şifreler eşleşmiyor',
    usernameRequired: 'Kullanıcı adı gerekli (3-20 karakter)',
    usernameInvalid: 'Sadece harf, rakam ve alt çizgi',
    emailInUse: 'Bu e-posta zaten kayıtlı',
    usernameInUse: 'Bu kullanıcı adı alınmış',
    available: '✓ Kullanılabilir',
    checking: 'Kontrol ediliyor...',
    invalidCredentials: 'E-posta veya şifre hatalı',
    emailNotVerified: 'Lütfen e-postanızı doğrulayın',
    resetLinkSent: 'Sıfırlama linki gönderildi!',
    passwordUpdated: 'Şifre güncellendi!',
    registerSuccess: 'Kayıt başarılı! E-postanızı kontrol edin.',
    unknownError: 'Bir hata oluştu',
    welcomeBack: 'Tekrar hoş geldiniz!',
    createAccount: 'Hesap oluşturun',
    features: ['🎯 Pomodoro Tekniği', '🎮 Mola Oyunları', '📊 İstatistikler', '🏆 Liderlik Tablosu']
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
    emailVerified: '🎉 Email Verified!',
    canLogin: 'Great! You can now login to Pomonero.',
    welcomeTitle: 'Welcome to Pomonero!',
    welcomeText: 'Your account has been verified. You can now login and start focusing.',
    invalidEmail: 'Enter a valid email',
    passwordRequired: 'Password required (min 6 chars)',
    passwordMismatch: 'Passwords do not match',
    usernameRequired: 'Username required (3-20 chars)',
    usernameInvalid: 'Only letters, numbers, underscore',
    emailInUse: 'Email already registered',
    usernameInUse: 'Username taken',
    available: '✓ Available',
    checking: 'Checking...',
    invalidCredentials: 'Invalid email or password',
    emailNotVerified: 'Please verify your email',
    resetLinkSent: 'Reset link sent!',
    passwordUpdated: 'Password updated!',
    registerSuccess: 'Registered! Check your email.',
    unknownError: 'An error occurred',
    welcomeBack: 'Welcome back!',
    createAccount: 'Create account',
    features: ['🎯 Pomodoro Technique', '🎮 Break Games', '📊 Statistics', '🏆 Leaderboard']
  };

  // URL kontrolü - email doğrulama ve şifre sıfırlama
  useEffect(() => {
    const checkUrl = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const fullUrl = hash + search;
      
      if (fullUrl.includes('type=signup') || fullUrl.includes('type=email') || fullUrl.includes('confirmation_token')) {
        setScreen('verified');
        window.history.replaceState(null, '', window.location.pathname);
      } else if (fullUrl.includes('type=recovery')) {
        setScreen('reset');
        const params = new URLSearchParams(hash.replace('#', '') || search.replace('?', ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && supabase) {
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          }).catch(console.error);
        }
      }
    };
    checkUrl();
  }, []);

  // Email validasyonu
  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  
  // Username validasyonu  
  const isValidUsername = (u) => /^[a-zA-Z0-9_]{3,20}$/.test(u);

  // EMAIL KONTROLÜ
  useEffect(() => {
    if (screen !== 'register' || !email || !isValidEmail(email)) {
      setEmailStatus({ checking: false, exists: false });
      return;
    }

    setEmailStatus({ checking: true, exists: false });
    
    const timer = setTimeout(async () => {
      try {
        // Profiles tablosundan kontrol
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle();

        setEmailStatus({ checking: false, exists: !!data && !error });
      } catch {
        setEmailStatus({ checking: false, exists: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, screen]);

  // USERNAME KONTROLÜ
  useEffect(() => {
    if (screen !== 'register' || !username || !isValidUsername(username)) {
      setUsernameStatus({ checking: false, exists: false });
      return;
    }

    setUsernameStatus({ checking: true, exists: false });

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.toLowerCase())
          .maybeSingle();

        setUsernameStatus({ checking: false, exists: !!data && !error });
      } catch {
        setUsernameStatus({ checking: false, exists: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, screen]);

  // GİRİŞ
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!email || !isValidEmail(email)) return setMessage({ type: 'error', text: t.invalidEmail });
    if (!password || password.length < 6) return setMessage({ type: 'error', text: t.passwordRequired });
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase(), 
        password 
      });
      
      if (error) {
        if (error.message.includes('Invalid login')) {
          setMessage({ type: 'error', text: t.invalidCredentials });
        } else if (error.message.includes('Email not confirmed')) {
          setMessage({ type: 'error', text: t.emailNotVerified });
        } else {
          setMessage({ type: 'error', text: error.message });
        }
        setLoading(false);
        return;
      }
      
      if (data.user) {
        setUser(data.user);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          localStorage.setItem('pomonero_profile', JSON.stringify(profileData));
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
    
    if (!email || !isValidEmail(email)) return setMessage({ type: 'error', text: t.invalidEmail });
    if (emailStatus.exists) return setMessage({ type: 'error', text: t.emailInUse });
    if (!username || !isValidUsername(username)) return setMessage({ type: 'error', text: t.usernameInvalid });
    if (usernameStatus.exists) return setMessage({ type: 'error', text: t.usernameInUse });
    if (!password || password.length < 6) return setMessage({ type: 'error', text: t.passwordRequired });
    if (password !== passwordConfirm) return setMessage({ type: 'error', text: t.passwordMismatch });
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            username: username.toLowerCase(),
            display_name: username,
            avatar_emoji: '😊'
          },
          emailRedirectTo: `${window.location.origin}?type=signup`
        }
      });
      
      if (error) {
        setMessage({ type: 'error', text: error.message.includes('already') ? t.emailInUse : error.message });
        setLoading(false);
        return;
      }
      
      if (data.user) {
        // Profil oluştur
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          display_name: username,
          avatar_emoji: '😊',
          created_at: new Date().toISOString()
        }, { onConflict: 'id' }).catch(() => {});
        
        setMessage({ type: 'success', text: t.registerSuccess });
      }
    } catch {
      setMessage({ type: 'error', text: t.unknownError });
    }
    setLoading(false);
  };

  // ŞİFRE SIFIRLAMA
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email || !isValidEmail(email)) return setMessage({ type: 'error', text: t.invalidEmail });
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
        redirectTo: `${window.location.origin}?type=recovery`
      });
      setMessage({ type: error ? 'error' : 'success', text: error ? error.message : t.resetLinkSent });
    } catch {
      setMessage({ type: 'error', text: t.unknownError });
    }
    setLoading(false);
  };

  // YENİ ŞİFRE
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) return setMessage({ type: 'error', text: t.passwordRequired });
    if (password !== passwordConfirm) return setMessage({ type: 'error', text: t.passwordMismatch });
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (!error) {
        setMessage({ type: 'success', text: t.passwordUpdated });
        setTimeout(() => { setScreen('login'); setPassword(''); setPasswordConfirm(''); }, 2000);
      } else {
        setMessage({ type: 'error', text: error.message });
      }
    } catch {
      setMessage({ type: 'error', text: t.unknownError });
    }
    setLoading(false);
  };

  // Input component
  const Input = ({ icon, type, value, onChange, placeholder, disabled }) => (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-12 pr-12 py-4 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
      />
    </div>
  );

  // Status badge
  const StatusBadge = ({ status, existsText }) => {
    if (status.checking) return <span className="text-xs text-blue-400">⏳ {t.checking}</span>;
    if (status.exists) return <span className="text-xs text-red-400">❌ {existsText}</span>;
    return <span className="text-xs text-green-400">{t.available}</span>;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: theme.colors.background }}>
      {/* Arka plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 -top-48 -left-48" style={{ background: theme.colors.primary }} />
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 -bottom-48 -right-48" style={{ background: theme.colors.secondary }} />
      </div>

      {/* Dil butonu */}
      <button onClick={toggleLanguage} className="absolute top-4 right-4 px-4 py-2 rounded-xl text-sm font-medium z-10" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
        {language === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-2xl" style={{ background: 'var(--card)' }}>
            <span className="text-4xl">🍅</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Pomonero</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {screen === 'login' ? t.welcomeBack : screen === 'register' ? t.createAccount : ''}
          </p>
        </div>

        <div className="rounded-3xl p-8 shadow-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          
          {/* DOĞRULANDI */}
          {screen === 'verified' && (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{t.emailVerified}</h2>
              <p className="mb-4" style={{ color: 'var(--text-muted)' }}>{t.welcomeText}</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {t.features.map((f, i) => (
                  <div key={i} className="p-2 rounded-xl text-sm" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>{f}</div>
                ))}
              </div>
              <button onClick={() => setScreen('login')} className="w-full py-4 rounded-2xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
                {t.login}
              </button>
            </div>
          )}

          {/* GİRİŞ */}
          {screen === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input icon="📧" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} disabled={loading} />
              <div className="relative">
                <Input icon="🔒" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password} disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">{showPassword ? '🙈' : '👁️'}</button>
              </div>
              {message.text && <div className={`p-3 rounded-xl text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{message.text}</div>}
              <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
                {loading ? '⏳' : t.login}
              </button>
              <button type="button" onClick={() => { setScreen('forgot'); setMessage({ type: '', text: '' }); }} className="w-full text-sm" style={{ color: 'var(--primary)' }}>{t.forgotPassword}</button>
              <div className="text-center pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t.noAccount} </span>
                <button type="button" onClick={() => { setScreen('register'); setMessage({ type: '', text: '' }); }} className="font-semibold" style={{ color: 'var(--primary)' }}>{t.register}</button>
              </div>
            </form>
          )}

          {/* KAYIT */}
          {screen === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Input icon="📧" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} disabled={loading} />
                {email && isValidEmail(email) && <div className="mt-1 ml-2"><StatusBadge status={emailStatus} existsText={t.emailInUse} /></div>}
              </div>
              <div>
                <Input icon="👤" type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder={t.username} disabled={loading} />
                {username && isValidUsername(username) && <div className="mt-1 ml-2"><StatusBadge status={usernameStatus} existsText={t.usernameInUse} /></div>}
                {username && !isValidUsername(username) && <div className="mt-1 ml-2 text-xs text-red-400">{t.usernameInvalid}</div>}
              </div>
              <div className="relative">
                <Input icon="🔒" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password} disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">{showPassword ? '🙈' : '👁️'}</button>
              </div>
              <Input icon="🔐" type={showPassword ? 'text' : 'password'} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder={t.passwordConfirm} disabled={loading} />
              {password && passwordConfirm && password !== passwordConfirm && <div className="text-xs text-red-400 ml-2">{t.passwordMismatch}</div>}
              {message.text && <div className={`p-3 rounded-xl text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{message.text}</div>}
              <button type="submit" disabled={loading || emailStatus.exists || usernameStatus.exists || emailStatus.checking || usernameStatus.checking} className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
                {loading ? '⏳' : t.register}
              </button>
              <div className="text-center pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t.hasAccount} </span>
                <button type="button" onClick={() => { setScreen('login'); setMessage({ type: '', text: '' }); }} className="font-semibold" style={{ color: 'var(--primary)' }}>{t.login}</button>
              </div>
            </form>
          )}

          {/* ŞİFREMİ UNUTTUM */}
          {screen === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-4">
                <span className="text-4xl">🔑</span>
                <h2 className="text-xl font-bold mt-2" style={{ color: 'var(--text)' }}>{t.forgotPassword}</h2>
              </div>
              <Input icon="📧" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} disabled={loading} />
              {message.text && <div className={`p-3 rounded-xl text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{message.text}</div>}
              <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>{loading ? '⏳' : t.sendResetLink}</button>
              <button type="button" onClick={() => { setScreen('login'); setMessage({ type: '', text: '' }); }} className="w-full text-sm" style={{ color: 'var(--text-muted)' }}>← {t.backToLogin}</button>
            </form>
          )}

          {/* ŞİFRE SIFIRLA */}
          {screen === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-4">
                <span className="text-4xl">🔐</span>
                <h2 className="text-xl font-bold mt-2" style={{ color: 'var(--text)' }}>{t.resetPassword}</h2>
              </div>
              <div className="relative">
                <Input icon="🔒" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.newPassword} disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">{showPassword ? '🙈' : '👁️'}</button>
              </div>
              <Input icon="🔐" type={showPassword ? 'text' : 'password'} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder={t.passwordConfirm} disabled={loading} />
              {message.text && <div className={`p-3 rounded-xl text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{message.text}</div>}
              <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>{loading ? '⏳' : t.setNewPassword}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
