'use client';

import { useState } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function Settings({ onClose }) {
  const { user, darkMode, settings, updateSettings, setTimerState, timerState } = useStore();
  
  const [localSettings, setLocalSettings] = useState({
    workDuration: settings.workDuration,
    breakDuration: settings.breakDuration,
    longBreakDuration: settings.longBreakDuration,
    soundEnabled: settings.soundEnabled
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    updateSettings(localSettings);
    
    if (!timerState.isRunning) {
      const durations = {
        work: localSettings.workDuration,
        break: localSettings.breakDuration,
        longBreak: localSettings.longBreakDuration
      };
      setTimerState({ timeLeft: durations[timerState.sessionType] * 60 });
    }
    
    if (user) {
      await db.updateSettings(user.id, {
        work_duration: localSettings.workDuration,
        break_duration: localSettings.breakDuration,
        long_break_duration: localSettings.longBreakDuration,
        sound_enabled: localSettings.soundEnabled,
        dark_mode: darkMode
      });
    }
    
    setSaving(false);
    onClose();
  };

  const presets = [
    { name: 'Klasik', work: 25, break: 5, long: 30 },
    { name: 'Kısa', work: 15, break: 3, long: 15 },
    { name: 'Uzun', work: 50, break: 10, long: 30 },
    { name: '52/17', work: 52, break: 17, long: 30 },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-2xl p-6 ${darkMode ? 'bg-surface-dark border border-white/10' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ayarlar
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Hazır Şablonlar
          </p>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setLocalSettings({
                  ...localSettings,
                  workDuration: preset.work,
                  breakDuration: preset.break,
                  longBreakDuration: preset.long
                })}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  localSettings.workDuration === preset.work
                    ? 'bg-primary text-white'
                    : darkMode ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Work Duration */}
          <div>
            <div className="flex justify-between mb-2">
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                🍅 Çalışma Süresi
              </label>
              <span className={`text-sm font-bold ${darkMode ? 'text-primary' : 'text-primary-dark'}`}>
                {localSettings.workDuration} dk
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              value={localSettings.workDuration}
              onChange={(e) => setLocalSettings({ ...localSettings, workDuration: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Break Duration */}
          <div>
            <div className="flex justify-between mb-2">
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                ☕ Kısa Mola
              </label>
              <span className={`text-sm font-bold ${darkMode ? 'text-accent' : 'text-accent-dark'}`}>
                {localSettings.breakDuration} dk
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={localSettings.breakDuration}
              onChange={(e) => setLocalSettings({ ...localSettings, breakDuration: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Long Break Duration */}
          <div>
            <div className="flex justify-between mb-2">
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                🌴 Uzun Mola
              </label>
              <span className={`text-sm font-bold ${darkMode ? 'text-secondary' : 'text-secondary-dark'}`}>
                {localSettings.longBreakDuration} dk
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={localSettings.longBreakDuration}
              onChange={(e) => setLocalSettings({ ...localSettings, longBreakDuration: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Sound Toggle */}
          <div className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">🔊</span>
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Ses Efektleri
              </span>
            </div>
            <button
              onClick={() => setLocalSettings({ ...localSettings, soundEnabled: !localSettings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-all ${
                localSettings.soundEnabled ? 'bg-primary' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${
                localSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-medium ${
              darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
