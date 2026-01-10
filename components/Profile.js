'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

const AVATARS = [
  '😊', '😎', '🤓', '😇', '🥳', '😴', '🤔', '🙂',
  '👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍🚀', '👩‍🚀', '🧑‍🎨', '👨‍🔬',
  '🦊', '🐱', '🐶', '🐼', '🐨', '🦁', '🐯', '🐻',
  '🌟', '⭐', '🌙', '☀️', '🔥', '💎', '🎯', '🏆',
  '🎮', '🎲', '🎨', '🎭', '🎪', '🎸', '🎹', '🎺',
  '🍕', '🍔', '🍟', '🌮', '🍩', '🍪', '🧁', '🍰'
];

export default function Profile() {
  const { user, profile, setProfile, showProfile, setShowProfile, language } = useStore();
  const t = translations[language] || translations.tr;
  const tr = language === 'tr';
  
  const [displayName, setDisplayName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('😊');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAvatars, setShowAvatars] = useState(false);

  // Form'u doldur
  useEffect(() => {
    if (showProfile) {
      setDisplayName(profile?.display_name || profile?.username || '');
      setAvatarEmoji(profile?.avatar_emoji || '😊');
      setMessage({ type: '', text: '' });
    }
  }, [showProfile, profile]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: tr ? 'İsim gerekli' : 'Name required' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    const newProfile = {
      ...profile,
      display_name: displayName.trim(),
      avatar_emoji: avatarEmoji,
      updated_at: new Date().toISOString()
    };

    try {
      // 1. Local Storage'a kaydet (her zaman çalışır)
      localStorage.setItem('pomonero_profile', JSON.stringify(newProfile));
      
      // 2. Store'u güncelle
      setProfile(newProfile);

      // 3. Supabase'e kaydet (varsa)
      if (supabase && user?.id) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            display_name: displayName.trim(),
            avatar_emoji: avatarEmoji,
            username: profile?.username || user.email?.split('@')[0],
            email: user.email,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (error) {
          console.error('Supabase save error:', error);
          // Ama local'e kaydettik, sorun değil
        }
      }

      setMessage({ type: 'success', text: tr ? '✅ Kaydedildi!' : '✅ Saved!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (err) {
      console.error('Save error:', err);
      // Local'e kaydettik, sorun değil
      setMessage({ type: 'success', text: tr ? '✅ Kaydedildi!' : '✅ Saved!' });
    } finally {
      setSaving(false);
    }
  };

  if (!showProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scale-in" style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span>👤</span> {t.profile}
          </h2>
          <button onClick={() => setShowProfile(false)} className="p-2 rounded-lg hover:bg-[var(--surface)] text-xl">✕</button>
        </div>

        {/* Avatar */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowAvatars(!showAvatars)}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-5xl mx-auto mb-3 hover:scale-105 transition-transform shadow-lg hover-glow"
          >
            {avatarEmoji}
          </button>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {tr ? 'Avatar seçmek için tıkla' : 'Click to choose avatar'}
          </p>
        </div>

        {/* Avatar Grid */}
        {showAvatars && (
          <div className="mb-6 p-4 rounded-xl animate-slide-down" style={{ background: 'var(--surface)' }}>
            <div className="grid grid-cols-8 gap-2">
              {AVATARS.map((emoji, i) => (
                <button
                  key={emoji}
                  onClick={() => { setAvatarEmoji(emoji); setShowAvatars(false); }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 ${avatarEmoji === emoji ? 'ring-2 ring-[var(--primary)] bg-[var(--primary)]/20' : 'hover:bg-[var(--background)]'}`}
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
              📝 {tr ? 'Görünen İsim' : 'Display Name'}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder={tr ? 'İsminiz' : 'Your name'}
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
              👤 {t.username}
            </label>
            <input
              type="text"
              value={profile?.username || ''}
              className="w-full p-3 rounded-xl opacity-60 cursor-not-allowed"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              disabled
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {tr ? 'Kullanıcı adı değiştirilemez' : 'Username cannot be changed'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
              ✉️ {t.email}
            </label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full p-3 rounded-xl opacity-60 cursor-not-allowed"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              disabled
            />
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-3 rounded-xl text-sm font-medium animate-slide-up ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ background: 'var(--primary)' }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {tr ? 'Kaydediliyor...' : 'Saving...'}
              </span>
            ) : (
              <span>💾 {tr ? 'Kaydet' : 'Save'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
