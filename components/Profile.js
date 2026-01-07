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
  
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    avatar_emoji: '😊'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAvatars, setShowAvatars] = useState(false);

  // Profile yüklendiğinde form'u doldur
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        avatar_emoji: profile.avatar_emoji || '😊'
      });
    }
  }, [profile, showProfile]);

  const handleSave = async () => {
    if (!user || !supabase) {
      setMessage({ type: 'error', text: language === 'tr' ? 'Bağlantı hatası' : 'Connection error' });
      return;
    }

    if (!formData.display_name.trim()) {
      setMessage({ type: 'error', text: language === 'tr' ? 'Görünen isim gerekli' : 'Display name is required' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        display_name: formData.display_name.trim(),
        avatar_emoji: formData.avatar_emoji,
        updated_at: new Date().toISOString()
      };

      console.log('Updating profile:', updateData);

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Update success:', data);

      // Store'u güncelle
      setProfile({ ...profile, ...updateData });
      
      setMessage({ type: 'success', text: language === 'tr' ? '✅ Profil kaydedildi!' : '✅ Profile saved!' });
      
      // 2 saniye sonra mesajı temizle
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } catch (err) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: language === 'tr' ? '❌ Kaydetme hatası' : '❌ Save failed' });
    } finally {
      setSaving(false);
    }
  };

  if (!showProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl p-6 glass border" style={{ borderColor: 'var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span>👤</span> {t.profile}
          </h2>
          <button 
            onClick={() => setShowProfile(false)} 
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Avatar Section */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowAvatars(!showAvatars)}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-5xl mx-auto mb-3 hover:scale-105 transition-transform"
          >
            {formData.avatar_emoji}
          </button>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {language === 'tr' ? 'Avatar seçmek için tıkla' : 'Click to choose avatar'}
          </p>
        </div>

        {/* Avatar Grid */}
        {showAvatars && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
            <div className="grid grid-cols-8 gap-2">
              {avatarEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setFormData({ ...formData, avatar_emoji: emoji });
                    setShowAvatars(false);
                  }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 ${
                    formData.avatar_emoji === emoji ? 'ring-2 ring-[var(--primary)] bg-[var(--primary)]/20' : 'hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
              {language === 'tr' ? '📝 Görünen İsim' : '📝 Display Name'}
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="input-modern"
              placeholder={language === 'tr' ? 'İsminiz' : 'Your name'}
              maxLength={30}
            />
          </div>

          {/* Username (readonly) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
              👤 {t.username}
            </label>
            <input
              type="text"
              value={formData.username}
              className="input-modern opacity-60"
              disabled
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {language === 'tr' ? 'Kullanıcı adı değiştirilemez' : 'Username cannot be changed'}
            </p>
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
              ✉️ {t.email}
            </label>
            <input
              type="email"
              value={user?.email || ''}
              className="input-modern opacity-60"
              disabled
            />
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {language === 'tr' ? 'Kaydediliyor...' : 'Saving...'}
              </span>
            ) : (
              <span>💾 {language === 'tr' ? 'Kaydet' : 'Save'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
