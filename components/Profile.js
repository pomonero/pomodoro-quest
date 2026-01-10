'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

const AVATARS = ['😊', '😎', '🤓', '😴', '🥳', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🦊', '🐱', '🐶', '🐼', '🦁', '🐯', '🐨', '🐵', '🌟', '⭐', '🔥', '💪', '🎯', '🚀', '💎', '🌈'];

export default function Profile() {
  const { user, profile, setProfile, showProfile, setShowProfile, language } = useStore();
  const tr = language === 'tr';
  
  const [displayName, setDisplayName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('😊');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profil yüklendiğinde
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || profile.username || '');
      setAvatarEmoji(profile.avatar_emoji || '😊');
    }
  }, [profile]);

  const t = tr ? {
    profile: 'Profil',
    displayName: 'Görünen İsim',
    avatar: 'Avatar',
    save: 'Kaydet',
    saving: 'Kaydediliyor...',
    close: 'Kapat',
    stats: 'İstatistikler',
    sessions: 'Tamamlanan',
    minutes: 'Dakika',
    username: 'Kullanıcı Adı',
    email: 'E-posta',
    member: 'Üyelik',
    saved: 'Kaydedildi!',
    error: 'Hata oluştu',
    nameRequired: 'İsim gerekli',
  } : {
    profile: 'Profile',
    displayName: 'Display Name',
    avatar: 'Avatar',
    save: 'Save',
    saving: 'Saving...',
    close: 'Close',
    stats: 'Statistics',
    sessions: 'Completed',
    minutes: 'Minutes',
    username: 'Username',
    email: 'Email',
    member: 'Member since',
    saved: 'Saved!',
    error: 'Error occurred',
    nameRequired: 'Name required',
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: t.nameRequired });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    const updatedProfile = {
      ...profile,
      display_name: displayName.trim(),
      avatar_emoji: avatarEmoji,
      updated_at: new Date().toISOString()
    };

    // 1. LocalStorage'a kaydet (her zaman çalışır)
    localStorage.setItem('pomonero_profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);

    // 2. Supabase'e kaydet
    if (supabase && user?.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: displayName.trim(),
            avatar_emoji: avatarEmoji,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.log('Supabase update error:', error.message);
          // LocalStorage'a kaydettik, sorun değil
        }
      } catch (err) {
        console.log('Save error:', err);
      }
    }

    setMessage({ type: 'success', text: '✅ ' + t.saved });
    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  if (!showProfile) return null;

  const memberDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString(tr ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long' })
    : '-';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowProfile(false)}>
      <div 
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl" 
        style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span>👤</span> {t.profile}
          </h2>
          <button 
            onClick={() => setShowProfile(false)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all hover:bg-[var(--surface)]"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Avatar büyük */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl text-5xl mb-2" style={{ background: 'var(--surface)' }}>
            {avatarEmoji}
          </div>
          <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>{displayName || profile?.username}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>@{profile?.username}</p>
        </div>

        {/* Avatar seçimi */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>{t.avatar}</label>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map(emoji => (
              <button
                key={emoji}
                onClick={() => setAvatarEmoji(emoji)}
                className={`text-2xl p-2 rounded-xl transition-all hover:scale-110 ${avatarEmoji === emoji ? 'ring-2 ring-[var(--primary)] bg-[var(--primary)]/20' : ''}`}
                style={{ background: 'var(--surface)' }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* İsim */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>{t.displayName}</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={30}
            className="w-full p-4 rounded-2xl outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Bilgiler */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.username}</p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>@{profile?.username || '-'}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.member}</p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>{memberDate}</p>
          </div>
        </div>

        {/* Mesaj */}
        {message.text && (
          <div className={`p-3 rounded-xl text-sm text-center mb-4 ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {message.text}
          </div>
        )}

        {/* Kaydet butonu */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: 'var(--primary)' }}
        >
          {saving ? t.saving : t.save}
        </button>
      </div>
    </div>
  );
}
