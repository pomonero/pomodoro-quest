'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

const presets = [
  { id: 'classic', name: 'Klasik', nameEn: 'Classic', focus: 25, shortBreak: 5, longBreak: 30, icon: '🍅' },
  { id: 'short', name: 'Kısa', nameEn: 'Short', focus: 15, shortBreak: 3, longBreak: 15, icon: '⚡' },
  { id: 'long', name: 'Uzun', nameEn: 'Long', focus: 50, shortBreak: 10, longBreak: 30, icon: '🏃' },
  { id: '52-17', name: '52/17', nameEn: '52/17', focus: 52, shortBreak: 17, longBreak: 30, icon: '📊' },
  { id: 'test', name: 'Test', nameEn: 'Test', focus: 1, shortBreak: 1, longBreak: 1, icon: '🧪' },
];

export default function Settings() {
  const { showSettings, setShowSettings, timerSettings, setTimerSettings, language } = useStore();
  const t = translations[language] || translations.tr;

  const [localSettings, setLocalSettings] = useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 30,
    dailyGoal: 8,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    soundVolume: 50
  });

  useEffect(() => {
    if (timerSettings) {
      setLocalSettings(timerSettings);
    }
  }, [timerSettings, showSettings]);

  const applyPreset = (preset) => {
    setLocalSettings({
      ...localSettings,
      focusTime: preset.focus,
      shortBreakTime: preset.shortBreak,
      longBreakTime: preset.longBreak
    });
  };

  const handleSave = () => {
    setTimerSettings(localSettings);
    setShowSettings(false);
  };

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg rounded-2xl p-6 glass border" style={{ borderColor: 'var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span>⚙️</span> {t.settings}
          </h2>
          <button 
            onClick={() => setShowSettings(false)} 
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
            📋 {language === 'tr' ? 'Hazır Şablonlar' : 'Presets'}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="p-3 rounded-xl text-center transition-all hover:scale-105"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <span className="text-2xl block mb-1">{preset.icon}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                  {language === 'tr' ? preset.name : preset.nameEn}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Settings */}
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
            ⏱️ {language === 'tr' ? 'Süre Ayarları (dakika)' : 'Time Settings (minutes)'}
          </label>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Focus Time */}
            <div className="p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
              <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                🎯 {language === 'tr' ? 'Odaklan' : 'Focus'}
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={localSettings.focusTime}
                onChange={(e) => setLocalSettings({ ...localSettings, focusTime: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
                className="w-full p-2 rounded-lg text-center font-bold text-lg"
                style={{ background: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
            </div>

            {/* Short Break */}
            <div className="p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
              <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                ☕ {language === 'tr' ? 'Kısa Mola' : 'Short Break'}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreakTime}
                onChange={(e) => setLocalSettings({ ...localSettings, shortBreakTime: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) })}
                className="w-full p-2 rounded-lg text-center font-bold text-lg"
                style={{ background: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
            </div>

            {/* Long Break */}
            <div className="p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
              <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                🌴 {language === 'tr' ? 'Uzun Mola' : 'Long Break'}
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakTime}
                onChange={(e) => setLocalSettings({ ...localSettings, longBreakTime: Math.max(1, Math.min(60, parseInt(e.target.value) || 1)) })}
                className="w-full p-2 rounded-lg text-center font-bold text-lg"
                style={{ background: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
          
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            💡 {language === 'tr' ? 'Minimum 1 dakika, maksimum odaklanma 120, mola 30-60 dakika' : 'Minimum 1 minute, max focus 120, breaks 30-60 minutes'}
          </p>
        </div>

        {/* Daily Goal */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
            🎯 {language === 'tr' ? 'Günlük Hedef (oturum)' : 'Daily Goal (sessions)'}
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="20"
              value={localSettings.dailyGoal}
              onChange={(e) => setLocalSettings({ ...localSettings, dailyGoal: parseInt(e.target.value) })}
              className="flex-1"
              style={{ accentColor: 'var(--primary)' }}
            />
            <span className="w-12 text-center font-bold text-lg" style={{ color: 'var(--text)' }}>
              {localSettings.dailyGoal}
            </span>
          </div>
        </div>

        {/* Auto Settings */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer" style={{ background: 'var(--surface)' }}>
            <span className="text-sm" style={{ color: 'var(--text)' }}>
              ▶️ {language === 'tr' ? 'Molaları otomatik başlat' : 'Auto-start breaks'}
            </span>
            <input
              type="checkbox"
              checked={localSettings.autoStartBreaks}
              onChange={(e) => setLocalSettings({ ...localSettings, autoStartBreaks: e.target.checked })}
              className="w-5 h-5 rounded"
              style={{ accentColor: 'var(--primary)' }}
            />
          </label>
          
          <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer" style={{ background: 'var(--surface)' }}>
            <span className="text-sm" style={{ color: 'var(--text)' }}>
              ▶️ {language === 'tr' ? 'Odaklanmayı otomatik başlat' : 'Auto-start focus'}
            </span>
            <input
              type="checkbox"
              checked={localSettings.autoStartPomodoros}
              onChange={(e) => setLocalSettings({ ...localSettings, autoStartPomodoros: e.target.checked })}
              className="w-5 h-5 rounded"
              style={{ accentColor: 'var(--primary)' }}
            />
          </label>
        </div>

        {/* Sound Settings */}
        <div className="mb-6">
          <label className="flex items-center justify-between p-3 rounded-xl cursor-pointer mb-3" style={{ background: 'var(--surface)' }}>
            <span className="text-sm" style={{ color: 'var(--text)' }}>
              🔔 {language === 'tr' ? 'Ses bildirimleri' : 'Sound notifications'}
            </span>
            <input
              type="checkbox"
              checked={localSettings.soundEnabled}
              onChange={(e) => setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })}
              className="w-5 h-5 rounded"
              style={{ accentColor: 'var(--primary)' }}
            />
          </label>
          
          {localSettings.soundEnabled && (
            <div className="flex items-center gap-3 px-3">
              <span>🔈</span>
              <input
                type="range"
                min="0"
                max="100"
                value={localSettings.soundVolume}
                onChange={(e) => setLocalSettings({ ...localSettings, soundVolume: parseInt(e.target.value) })}
                className="flex-1"
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>🔊</span>
              <span className="text-sm w-10" style={{ color: 'var(--text-muted)' }}>{localSettings.soundVolume}%</span>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button onClick={handleSave} className="w-full btn-primary py-3">
          💾 {language === 'tr' ? 'Kaydet' : 'Save'}
        </button>
      </div>
    </div>
  );
}
