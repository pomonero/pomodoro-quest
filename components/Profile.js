'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

const avatarEmojis = [
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
  
  const [displayName, setDisplayName] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('😊');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAvatars, setShowAvatars] = useState(false);

  useEffect(() => {
    if (showProfile && profile) {
      setDisplayName(profile.display_name || profile.username || '');
      setAvatarEmoji(profile.avatar_emoji || '😊');
      setMessage({ type: '', text: '' });
    }
  }, [showProfile, profile]);

  const handleSave = async () => {
    if (!user) {
      setMessage({ type: 'error', text: language === 'tr' ? 'Oturum hatası' : 'Session error' });
      return;
    }
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: language === 'tr' ? 'İsim gerekli' : 'Name required' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (!supabase) throw new Error('DB not connected');

      const updateData = {
        display_name: displayName.trim(),
        avatar_emoji: avatarEmoji,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id);
      if (error) throw error;

      setProfile({ ...profile, ...updateData });
      setMessage({ type: 'success', text: language === 'tr' ? '✅ Kaydedildi!' : '✅ Saved!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: language === 'tr' ? '❌ Hata oluştu' : '❌ Error' });
    } finally {
      setSaving(false);
    }
  };

  if (!showProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}><span>👤</span> {t.profile}</h2>
          <button onClick={() => setShowProfile(false)} className="p-2 rounded-lg hover:bg-[var(--surface)]" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>

        <div className="text-center mb-6">
          <button onClick={() => setShowAvatars(!showAvatars)} className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-5xl mx-auto mb-3 hover:scale-105 transition-transform shadow-lg">
            {avatarEmoji}
          </button>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{language === 'tr' ? 'Avatar seçmek için tıkla' : 'Click to choose avatar'}</p>
        </div>

        {showAvatars && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
            <div className="grid grid-cols-8 gap-2">
              {avatarEmojis.map((emoji) => (
                <button key={emoji} onClick={() => { setAvatarEmoji(emoji); setShowAvatars(false); }} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 ${avatarEmoji === emoji ? 'ring-2 ring-[var(--primary)]' : ''}`}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>📝 {language === 'tr' ? 'Görünen İsim' : 'Display Name'}</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full p-3 rounded-xl outline-none" style={{ background: 'var(--surface)', border: '2px solid var(--border)', color: 'var(--text)' }} placeholder={language === 'tr' ? 'İsminiz' : 'Your name'} maxLength={30} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>👤 {t.username}</label>
            <input type="text" value={profile?.username || ''} className="w-full p-3 rounded-xl opacity-60" style={{ background: 'var(--surface)', border: '2px solid var(--border)', color: 'var(--text)' }} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>✉️ {t.email}</label>
            <input type="email" value={user?.email || ''} className="w-full p-3 rounded-xl opacity-60" style={{ background: 'var(--surface)', border: '2px solid var(--border)', color: 'var(--text)' }} disabled />
          </div>

          {message.text && <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{message.text}</div>}

          <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl font-semibold text-white hover:scale-[1.02] disabled:opacity-50" style={{ background: 'var(--primary)' }}>
            {saving ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span></span> : <span>💾 {language === 'tr' ? 'Kaydet' : 'Save'}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
