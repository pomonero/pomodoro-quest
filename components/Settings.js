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
    
    // Lokal state güncelle
    updateSettings(localSettings);
    
    // Timer'ı güncelle (eğer çalışmıyorsa)
    if (!timerState.isRunning) {
      const durations = {
        work: localSettings.workDuration,
        break: localSettings.breakDuration,
        longBreak: localSettings.longBreakDuration
      };
      setTimerState({ 
        timeLeft: durations[timerState.sessionType] * 60 
      });
    }
    
    // Veritabanına kaydet
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

  const theme = darkMode ? {
    overlay: 'bg-black/80',
    surface: 'bg-gray-900',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    border: 'border-cyan-500/30',
    neonPrimary: 'text-cyan-400',
    input: 'bg-gray-800 border-cyan-500/30',
    button: 'bg-cyan-500 hover:bg-cyan-400 text-gray-950',
    buttonSecondary: 'bg-gray-800 hover:bg-gray-700 text-gray-300',
  } : {
    overlay: 'bg-black/50',
    surface: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    border: 'border-fuchsia-400/30',
    neonPrimary: 'text-fuchsia-600',
    input: 'bg-slate-50 border-fuchsia-400/30',
    button: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
    buttonSecondary: 'bg-slate-200 hover:bg-slate-300 text-gray-700',
  };

  return (
    <div className={`fixed inset-0 ${theme.overlay} flex items-center justify-center z-50 p-4`}>
      <div className={`${theme.surface} ${theme.border} border-4 p-6 max-w-md w-full shadow-neon-cyan`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`font-pixel text-sm ${theme.neonPrimary}`}>
            ⚙️ AYARLAR
          </h2>
          <button
            onClick={onClose}
            className={`font-pixel text-xl ${theme.textMuted} hover:text-red-400`}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Work Duration */}
          <div>
            <label className={`block font-pixel text-xs ${theme.textMuted} mb-2`}>
              🍅 ÇALIŞMA SÜRESİ (DAKİKA)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={localSettings.workDuration}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                workDuration: parseInt(e.target.value) || 25
              })}
              className={`w-full p-3 font-pixel text-sm ${theme.input} ${theme.text} border-2 focus:outline-none`}
            />
          </div>

          {/* Break Duration */}
          <div>
            <label className={`block font-pixel text-xs ${theme.textMuted} mb-2`}>
              ☕ MOLA SÜRESİ (DAKİKA)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={localSettings.breakDuration}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                breakDuration: parseInt(e.target.value) || 5
              })}
              className={`w-full p-3 font-pixel text-sm ${theme.input} ${theme.text} border-2 focus:outline-none`}
            />
          </div>

          {/* Long Break Duration */}
          <div>
            <label className={`block font-pixel text-xs ${theme.textMuted} mb-2`}>
              🛋️ UZUN MOLA SÜRESİ (DAKİKA)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={localSettings.longBreakDuration}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                longBreakDuration: parseInt(e.target.value) || 30
              })}
              className={`w-full p-3 font-pixel text-sm ${theme.input} ${theme.text} border-2 focus:outline-none`}
            />
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <label className={`font-pixel text-xs ${theme.textMuted}`}>
              🔊 SES EFEKTLERİ
            </label>
            <button
              onClick={() => setLocalSettings({
                ...localSettings,
                soundEnabled: !localSettings.soundEnabled
              })}
              className={`w-16 h-8 rounded-full transition-all ${
                localSettings.soundEnabled 
                  ? 'bg-cyan-500' 
                  : 'bg-gray-600'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform mx-1 ${
                localSettings.soundEnabled ? 'translate-x-8' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className={`mt-6 p-3 ${theme.border} border-2`}>
          <p className={`font-pixel text-xs ${theme.textMuted}`}>
            💡 Her 5 pomodoro'dan sonra uzun mola gelir. Ayarlar anında uygulanır.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 py-3 font-pixel text-xs ${theme.buttonSecondary} ${theme.border} border-2`}
          >
            İPTAL
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 py-3 font-pixel text-xs ${theme.button} transition-all
              ${saving ? 'opacity-50' : 'hover:scale-105'}`}
          >
            {saving ? 'KAYDEDİLİYOR...' : '✓ KAYDET'}
          </button>
        </div>
      </div>
    </div>
  );
}
