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

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token') || hash.includes('type=signup')) {
      setSuccess(language === 'tr' ? '✅ E-posta doğrulandı! Giriş yapabilirsiniz.' : '✅ Email verified! You can login now.');
      window.location.hash = '';
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.style.background = theme.colors.background;
  }, [currentTheme, theme]);

  const getErrorMessage = (err) => {
    const msg = err.message || '';
    if (msg.includes('already registered')) return language === 'tr' ? 'Bu e-posta zaten kayıtlı.' : 'Email already registered.';
    if (msg.includes('Invalid login')) return language === 'tr' ? 'E-posta veya şifre hatalı.' : 'Invalid email or password.';
    if (msg.includes('not confirmed')) return language === 'tr' ? 'E-postanızı doğrulayın.' : 'Please verify your email.';
    if (msg.includes('6 characters')) return language === 'tr' ? 'Şifre en az 6 karakter.' : 'Password min 6 characters.';
    return language === 'tr' ? 'Bir hata oluştu.' : 'An error occurred.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (isLogin) {
        const { error } = await auth.signIn(formData.email, formData.password);
        if (error) throw error;
      } else {
        if (!formData.username || formData.username.length < 3) throw new Error(language === 'tr' ? 'Kullanıcı adı en az 3 karakter' : 'Username min 3 chars');
        const { data, error } = await auth.signUp(formData.email, formData.password, formData.username);
        if (error) throw error;
        if (data?.user && !data?.session) {
          setSuccess(language === 'tr' ? '✅ Kayıt başarılı! E-postanızı kontrol edin.' : '✅ Registration successful! Check your email.');
          setFormData({ email: '', password: '', username: '' });
        }
      }
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme.colors.background }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">⭐</div>
        <div className="absolute bottom-20 right-10 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🚀</div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-end mb-4">
          <button onClick={toggleLanguage} className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: theme.colors.surface, color: theme.colors.text }}>
            {language === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
          </button>
        </div>
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Pomonero" className="h-16 mx-auto mb-4" />
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>{t.slogan}</p>
        </div>
        <div className="card p-6">
          <div className="flex mb-6 p-1 rounded-xl" style={{ background: theme.colors.surface }}>
            <button onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: isLogin ? theme.colors.primary : 'transparent', color: isLogin ? 'white' : theme.colors.textMuted }}>{t.login}</button>
            <button onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: !isLogin ? theme.colors.primary : 'transparent', color: !isLogin ? 'white' : theme.colors.textMuted }}>{t.register}</button>
          </div>
          {success && <div className="mb-4 p-3 rounded-lg bg-green-500/20 text-green-400 text-sm">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>{t.username}</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} className="input-modern" placeholder="kullanici_adi" required={!isLogin} minLength={3} maxLength={20} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>{t.email}</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-modern" placeholder="email@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>{t.password}</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-modern" placeholder="••••••••" required minLength={6} />
            </div>
            {error && <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">⚠️ {error}</div>}
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">{loading ? '...' : (isLogin ? t.login : t.register)}</button>
          </form>
          <p className="text-center mt-4 text-sm" style={{ color: theme.colors.textMuted }}>
            {isLogin ? t.noAccount : t.hasAccount}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} className="font-medium hover:underline" style={{ color: theme.colors.primary }}>{isLogin ? t.register : t.login}</button>
          </p>
        </div>
      </div>
    </div>
  );
}
