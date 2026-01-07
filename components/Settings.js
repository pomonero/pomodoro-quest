'use client';

import { useState } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Settings({ onClose }) {
  const { user, language, settings, updateSettings, setTimerState, timerState } = useStore();
  const t = translations[language] || translations.tr;
  
  const [localSettings, setLocalSettings] = useState({
    workDuration: settings.workDuration,
    breakDuration: settings.breakDuration,
    longBreakDuration: settings.longBreakDuration,
    soundEnabled: settings.soundEnabled,
    notificationsEnabled: settings.notificationsEnabled || true
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
        sound_enabled: localSettings.soundEnabled
      });
    }
    
    setSaving(false);
    onClose();
  };

  const presets = [
    { name: t.classic, work: 25, break: 5, long: 30 },
    { name: t.short, work: 15, break: 3, long: 15 },
    { name: t.long, work: 50, break: 10, long: 30 },
    { name: '52/17', work: 52, break: 17, long: 30 },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl p-6 glass border" style={{ borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
              <span className="text-lg">⚙️</span>
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {t.settings}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
            {t.presets}
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
                    ? 'bg-[var(--primary)] text-white'
                    : ''
                }`}
                style={{ 
                  background: localSettings.workDuration === preset.work ? 'var(--primary)' : 'var(--surface)',
                  color: localSettings.workDuration === preset.work ? 'white' : 'var(--text)'
                }}
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
              <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                🎯 {t.workDuration}
              </label>
              <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                {localSettings.workDuration} {t.minutes}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              value={localSettings.workDuration}
              onChange={(e) => setLocalSettings({ ...localSettings, workDuration: parseInt(e.target.value) })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ background: 'var(--border)' }}
            />
          </div>

          {/* Break Duration */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                ☕ {t.breakDuration}
              </label>
              <span className="text-sm font-bold text-green-500">
                {localSettings.breakDuration} {t.minutes}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={localSettings.breakDuration}
              onChange={(e) => setLocalSettings({ ...localSettings, breakDuration: parseInt(e.target.value) })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ background: 'var(--border)' }}
            />
          </div>

          {/* Long Break Duration */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                🌴 {t.longBreakDuration}
              </label>
              <span className="text-sm font-bold text-orange-500">
                {localSettings.longBreakDuration} {t.minutes}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={localSettings.longBreakDuration}
              onChange={(e) => setLocalSettings({ ...localSettings, longBreakDuration: parseInt(e.target.value) })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ background: 'var(--border)' }}
            />
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">🔊</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {t.soundEffects}
              </span>
            </div>
            <button
              onClick={() => setLocalSettings({ ...localSettings, soundEnabled: !localSettings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-all ${
                localSettings.soundEnabled ? 'bg-[var(--primary)]' : ''
              }`}
              style={{ background: localSettings.soundEnabled ? 'var(--primary)' : 'var(--border)' }}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${
                localSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {t.notifications}
              </span>
            </div>
            <button
              onClick={() => setLocalSettings({ ...localSettings, notificationsEnabled: !localSettings.notificationsEnabled })}
              className={`w-12 h-6 rounded-full transition-all`}
              style={{ background: localSettings.notificationsEnabled ? 'var(--primary)' : 'var(--border)' }}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${
                localSettings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium btn-secondary"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {saving ? '...' : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
