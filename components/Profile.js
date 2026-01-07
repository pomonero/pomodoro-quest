'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function Profile({ onClose }) {
  const { darkMode, user, profile, setProfile } = useStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: '',
    school: '',
    department: '',
    subjects: '',
    bio: '',
    study_goal: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        school: profile.school || '',
        department: profile.department || '',
        subjects: profile.subjects || '',
        bio: profile.bio || '',
        study_goal: profile.study_goal || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: formData.display_name,
        school: formData.school,
        department: formData.department,
        subjects: formData.subjects,
        bio: formData.bio,
        study_goal: formData.study_goal,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, ...formData });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-lg rounded-2xl p-6 ${darkMode ? 'bg-surface-dark border border-white/10' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
              {formData.display_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Profil Ayarları
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                @{profile?.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${
              darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Görünen Ad
            </label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              className={`w-full input-modern ${!darkMode && 'bg-gray-50 border-gray-200 text-gray-900'}`}
              placeholder="Adınız Soyadınız"
            />
          </div>

          {/* School */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              🏫 Okul
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              className={`w-full input-modern ${!darkMode && 'bg-gray-50 border-gray-200 text-gray-900'}`}
              placeholder="Üniversite veya okul adı"
            />
          </div>

          {/* Department */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              📚 Bölüm
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full input-modern ${!darkMode && 'bg-gray-50 border-gray-200 text-gray-900'}`}
              placeholder="Bölüm veya alan"
            />
          </div>

          {/* Subjects */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              📖 Dersler / Konular
            </label>
            <input
              type="text"
              name="subjects"
              value={formData.subjects}
              onChange={handleChange}
              className={`w-full input-modern ${!darkMode && 'bg-gray-50 border-gray-200 text-gray-900'}`}
              placeholder="Matematik, Fizik, Programlama..."
            />
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Virgülle ayırarak yazın
            </p>
          </div>

          {/* Study Goal */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              🎯 Günlük Hedef
            </label>
            <select
              name="study_goal"
              value={formData.study_goal}
              onChange={handleChange}
              className={`w-full input-modern ${!darkMode && 'bg-gray-50 border-gray-200 text-gray-900'}`}
            >
              <option value="">Hedef seç</option>
              <option value="4">4 Pomodoro (2 saat)</option>
              <option value="6">6 Pomodoro (3 saat)</option>
              <option value="8">8 Pomodoro (4 saat)</option>
              <option value="10">10 Pomodoro (5 saat)</option>
              <option value="12">12 Pomodoro (6 saat)</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              ✨ Hakkında
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className={`w-full input-modern resize-none ${!darkMode && 'bg-gray-50 border-gray-200 text-gray-900'}`}
              placeholder="Kısa bir tanıtım..."
            />
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg bg-accent/20 border border-accent/30 text-accent text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Profil güncellendi!
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                darkMode 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
