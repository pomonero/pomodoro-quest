'use client';

import { useState } from 'react';
import { auth } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function AuthScreen() {
  const { darkMode, toggleDarkMode } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await auth.signIn(email, password);
        if (error) throw error;
      } else {
        if (username.length < 3) {
          throw new Error('Kullanıcı adı en az 3 karakter olmalı');
        }
        const { error } = await auth.signUp(email, password, username);
        if (error) throw error;
        setError('Kayıt başarılı! Email adresinizi kontrol edin.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Pomonero" 
            className="w-24 h-24 mx-auto mb-4 animate-float"
          />
          <h1 className="text-3xl font-bold font-display text-white mb-2">
            POMONERO
          </h1>
          <p className="text-gray-400">
            Çalış • Oyna • Kazan
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Tab Switcher */}
          <div className="flex mb-6 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-glow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full input-modern"
                  placeholder="kullanici_adi"
                  maxLength={16}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full input-modern"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full input-modern"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                error.includes('başarılı')
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-base disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Yükleniyor...</span>
                </div>
              ) : (
                isLogin ? 'Giriş Yap' : 'Kayıt Ol'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-gray-500 text-sm">veya</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-full py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            {darkMode ? '☀️ Açık Mod' : '🌙 Koyu Mod'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Pomodoro tekniği ile üretkenliğini artır 🍅
        </p>
      </div>
    </div>
  );
}
