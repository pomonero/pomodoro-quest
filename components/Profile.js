'use client';
import { useState } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

const avatarEmojis = [
  '😊', '😎', '🤓', '😇', '🥳', '😜', '🤩', '😏',
  '👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '🧑‍💼', '👨‍🔬', '👩‍🎨', '🧑‍🚀',
  '🦊', '🐱', '🐶', '🐼', '🐨', '🦁', '🐯', '🐸',
  '🦄', '🐲', '🦋', '🌟', '🔥', '💎', '🎮', '🎯',
  '🚀', '⭐', '🌙', '☀️', '🌈', '🍀', '🎸', '🎨',
];

export default function Profile({ onClose }) {
  const { user, language, profile, setProfile } = useStore();
  const t = translations[language] || translations.tr;

  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    avatar_emoji: profile?.avatar_emoji || '😊',
    school: profile?.school || '',
    department: profile?.department || '',
    bio: profile?.bio || ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { data, error } = await db.updateProfile(user.id, formData);
    if (!error && data) {
      setProfile({ ...profile, ...formData });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 glass border" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-3xl hover:scale-105 transition-transform">
              {formData.avatar_emoji}
            </button>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{t.profile}</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{profile?.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>{t.selectAvatar}</p>
            <div className="grid grid-cols-8 gap-2">
              {avatarEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { setFormData({ ...formData, avatar_emoji: emoji }); setShowAvatarPicker(false); }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl hover:scale-110 transition-transform ${formData.avatar_emoji === emoji ? 'ring-2 ring-[var(--primary)]' : ''}`}
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>{t.displayName}</label>
            <input type="text" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} className="input-modern" placeholder={language === 'tr' ? 'Görünen adınız' : 'Your display name'} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>🏫 {t.school}</label>
            <input type="text" value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} className="input-modern" placeholder={language === 'tr' ? 'Okul adı' : 'School name'} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>📚 {t.department}</label>
            <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-modern" placeholder={language === 'tr' ? 'Bölüm / Alan' : 'Department'} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>✏️ {t.bio}</label>
            <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="input-modern min-h-[80px] resize-none" placeholder={language === 'tr' ? 'Kendinizden bahsedin...' : 'Tell us about yourself...'} maxLength={200} />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formData.bio.length}/200</p>
          </div>
        </div>

        {saved && <div className="mt-4 p-3 rounded-xl bg-green-500/20 text-green-400 text-sm text-center">✓ {t.profileUpdated}</div>}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary">{t.cancel}</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? '...' : t.save}</button>
        </div>
      </div>
    </div>
  );
}
