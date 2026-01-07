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

  const theme = darkMode ? {
    bg: 'bg-gray-950',
    surface: 'bg-gray-900',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    border: 'border-cyan-500/30',
    neonPrimary: 'text-cyan-400',
    neonSecondary: 'text-fuchsia-400',
    input: 'bg-gray-800 border-cyan-500/30 focus:border-cyan-400',
    button: 'bg-cyan-500 hover:bg-cyan-400 text-gray-950',
  } : {
    bg: 'bg-slate-100',
    surface: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    border: 'border-fuchsia-400/30',
    neonPrimary: 'text-fuchsia-600',
    neonSecondary: 'text-cyan-600',
    input: 'bg-slate-50 border-fuchsia-400/30 focus:border-fuchsia-400',
    button: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`}>
      <div className={`${theme.surface} ${theme.border} border-4 p-8 max-w-md w-full shadow-neon-cyan`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className={`text-2xl font-pixel ${theme.neonPrimary} neon-text-cyan mb-2`}>
            POMODORO
          </h1>
          <h2 className={`text-lg font-pixel ${theme.neonSecondary} neon-text-pink`}>
            QUEST
          </h2>
          
          {/* Pixel Tomato */}
          <div className="flex justify-center my-6">
            <div className="grid grid-cols-8 gap-0.5">
              {[
                '00011000',
                '00111100',
                '01111110',
                '11111111',
                '11111111',
                '11111111',
                '01111110',
                '00111100',
              ].map((row, i) => (
                row.split('').map((cell, j) => (
                  <div 
                    key={`${i}-${j}`} 
                    className={`w-3 h-3 ${cell === '1' ? (i < 2 ? 'bg-green-500' : 'bg-red-500') : 'bg-transparent'}`}
                    style={{ boxShadow: cell === '1' ? '0 0 5px currentColor' : 'none' }}
                  />
                ))
              ))}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-xs font-pixel border-2 ${theme.border} transition-all
              ${isLogin ? theme.button : `${theme.surface} ${theme.textMuted}`}`}
          >
            GİRİŞ
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-xs font-pixel border-2 ${theme.border} transition-all
              ${!isLogin ? theme.button : `${theme.surface} ${theme.textMuted}`}`}
          >
            KAYIT
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className={`block text-xs font-pixel ${theme.textMuted} mb-2`}>
                KULLANICI ADI
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className={`w-full p-3 font-pixel text-xs ${theme.input} ${theme.text} border-2 focus:outline-none`}
                placeholder="oyuncu_adi"
                maxLength={16}
              />
            </div>
          )}

          <div>
            <label className={`block text-xs font-pixel ${theme.textMuted} mb-2`}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 font-pixel text-xs ${theme.input} ${theme.text} border-2 focus:outline-none`}
              placeholder="email@ornek.com"
              required
            />
          </div>

          <div>
            <label className={`block text-xs font-pixel ${theme.textMuted} mb-2`}>
              ŞİFRE
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 font-pixel text-xs ${theme.input} ${theme.text} border-2 focus:outline-none`}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className={`text-xs font-pixel ${error.includes('başarılı') ? 'text-green-400' : 'text-red-400'}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 font-pixel text-xs ${theme.button} retro-btn transition-all
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {loading ? 'YÜKLENİYOR...' : isLogin ? '▶ GİRİŞ YAP' : '▶ KAYIT OL'}
          </button>
        </form>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`w-full mt-4 py-3 font-pixel text-xs ${theme.surface} ${theme.textMuted} ${theme.border} border-2`}
        >
          {darkMode ? '☀ AÇIK MOD' : '🌙 KOYU MOD'}
        </button>

        {/* Footer */}
        <p className={`text-center text-xs font-pixel ${theme.textMuted} mt-6`}>
          ÇALIŞ • OYNA • KAZAN
        </p>
      </div>
    </div>
  );
}
