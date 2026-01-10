'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

// Preset modları
const PRESETS = {
  focus: { time: 25, icon: '🎯', color: '#6366f1' },
  shortBreak: { time: 5, icon: '☕', color: '#22c55e' },
  longBreak: { time: 30, icon: '🌴', color: '#f59e0b' },
  tyt: { time: 120, icon: '📚', color: '#8b5cf6' },
  ayt: { time: 165, icon: '🎓', color: '#ec4899' },
};

export default function Timer() {
  const { user, timerSettings, stats, setStats, setCanPlayGame, setShowGame, language } = useStore();
  const t = translations[language] || translations.tr;
  const tr = language === 'tr';

  const [mode, setMode] = useState('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showPresets, setShowPresets] = useState(false);
  
  const getInitialTime = useCallback(() => {
    if (mode === 'focus') return (timerSettings?.focusTime || 25) * 60;
    if (mode === 'shortBreak') return (timerSettings?.shortBreakTime || 5) * 60;
    if (mode === 'longBreak') return (timerSettings?.longBreakTime || 30) * 60;
    if (mode === 'tyt') return 120 * 60; // 2 saat
    if (mode === 'ayt') return 165 * 60; // 2 saat 45 dk
    return 25 * 60;
  }, [mode, timerSettings]);
  
  const [timeLeft, setTimeLeft] = useState(() => (timerSettings?.focusTime || 25) * 60);
  const [totalTime, setTotalTime] = useState(() => (timerSettings?.focusTime || 25) * 60);
  
  const intervalRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Mode değişince
  useEffect(() => {
    if (!hasStartedRef.current) {
      const newTime = getInitialTime();
      setTimeLeft(newTime);
      setTotalTime(newTime);
    }
  }, [timerSettings, mode, getInitialTime]);

  const handleComplete = async () => {
    setIsRunning(false);
    hasStartedRef.current = false;
    
    // Ses çal
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback beep
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.start();
        setTimeout(() => osc.stop(), 200);
      });
    } catch {}

    // Focus veya sınav modu bittiyse
    if (['focus', 'tyt', 'ayt'].includes(mode)) {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      setCanPlayGame(true);

      if (user) {
        const mins = Math.floor(totalTime / 60);
        const newStats = { 
          ...stats, 
          totalSessions: (stats?.totalSessions || 0) + 1, 
          totalMinutes: (stats?.totalMinutes || 0) + mins, 
          todaySessions: (stats?.todaySessions || 0) + 1 
        };
        setStats(newStats);
        localStorage.setItem('pomonero_stats', JSON.stringify(newStats));
        await db.updateStats(user.id, newStats);
      }

      // Mola moduna geç
      if (newSessions % 4 === 0) {
        changeMode('longBreak');
      } else {
        changeMode('shortBreak');
      }

      if (timerSettings?.autoStartBreaks) {
        setTimeout(() => { setIsRunning(true); hasStartedRef.current = true; }, 1000);
      }
    } else {
      // Mola bitti
      changeMode('focus');
      setCanPlayGame(false);
      if (timerSettings?.autoStartPomodoros) {
        setTimeout(() => { setIsRunning(true); hasStartedRef.current = true; }, 1000);
      }
    }
  };

  const handleStart = () => {
    hasStartedRef.current = true;
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleReset = () => {
    setIsRunning(false);
    hasStartedRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const newTime = getInitialTime();
    setTimeLeft(newTime);
    setTotalTime(newTime);
  };

  const changeMode = (newMode) => {
    setIsRunning(false);
    hasStartedRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(newMode);
    setShowPresets(false);
    
    let newTime;
    if (newMode === 'focus') newTime = (timerSettings?.focusTime || 25) * 60;
    else if (newMode === 'shortBreak') newTime = (timerSettings?.shortBreakTime || 5) * 60;
    else if (newMode === 'longBreak') newTime = (timerSettings?.longBreakTime || 30) * 60;
    else if (newMode === 'tyt') newTime = 120 * 60;
    else if (newMode === 'ayt') newTime = 165 * 60;
    else newTime = 25 * 60;
    
    setTimeLeft(newTime);
    setTotalTime(newTime);
    
    if (['shortBreak', 'longBreak'].includes(newMode)) {
      setCanPlayGame(true);
    } else {
      setCanPlayGame(false);
    }
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const currentPreset = PRESETS[mode] || PRESETS.focus;
  const isPaused = hasStartedRef.current && !isRunning && timeLeft > 0 && timeLeft < totalTime;

  const size = 280, strokeWidth = 12, radius = (size - strokeWidth) / 2, center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeLabels = {
    focus: tr ? 'Odaklan' : 'Focus',
    shortBreak: tr ? 'Kısa Mola' : 'Short Break',
    longBreak: tr ? 'Uzun Mola' : 'Long Break',
    tyt: 'TYT',
    ayt: 'AYT',
  };

  return (
    <div className="card p-6 text-center">
      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {['focus', 'shortBreak', 'longBreak'].map((m) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ 
              background: mode === m ? PRESETS[m].color : 'var(--surface)', 
              color: mode === m ? 'white' : 'var(--text-muted)' 
            }}
          >
            <span>{PRESETS[m].icon}</span>
            <span className="hidden sm:inline">{modeLabels[m]}</span>
          </button>
        ))}
        
        {/* Sınav Presets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ 
              background: ['tyt', 'ayt'].includes(mode) ? currentPreset.color : 'var(--surface)', 
              color: ['tyt', 'ayt'].includes(mode) ? 'white' : 'var(--text-muted)' 
            }}
          >
            <span>📝</span>
            <span>{tr ? 'Sınav' : 'Exam'}</span>
            <span className="text-xs">▼</span>
          </button>
          
          {showPresets && (
            <div className="absolute top-full mt-2 left-0 w-48 rounded-xl p-2 shadow-2xl z-20 animate-slide-down" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => changeMode('tyt')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--surface)] transition-all"
                style={{ color: 'var(--text)' }}
              >
                <span className="text-2xl">📚</span>
                <div className="text-left">
                  <p className="font-bold">TYT</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>120 {tr ? 'dakika' : 'min'}</p>
                </div>
              </button>
              <button
                onClick={() => changeMode('ayt')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--surface)] transition-all"
                style={{ color: 'var(--text)' }}
              >
                <span className="text-2xl">🎓</span>
                <div className="text-left">
                  <p className="font-bold">AYT</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>165 {tr ? 'dakika' : 'min'}</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timer Circle */}
      <div className="relative mx-auto mb-6" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--surface)" strokeWidth={strokeWidth} />
          <circle
            cx={center} cy={center} r={radius} fill="none"
            stroke={currentPreset.color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 10px ${currentPreset.color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl mb-2">{currentPreset.icon}</span>
          <span className="text-4xl sm:text-5xl font-bold font-mono" style={{ color: 'var(--text)' }}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm mt-2 font-medium" style={{ color: currentPreset.color }}>
            {modeLabels[mode]}
            {isPaused && ' ⏸️'}
          </span>
        </div>
      </div>

      {/* Sessions (sadece focus modunda) */}
      {mode === 'focus' && (
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={`text-2xl transition-all ${sessionsCompleted >= i ? 'scale-110' : 'opacity-30'}`}>
              {sessionsCompleted >= i ? '⭐' : '☆'}
            </span>
          ))}
        </div>
      )}

      {/* Sınav modu bilgisi */}
      {['tyt', 'ayt'].includes(mode) && (
        <div className="mb-6 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {mode === 'tyt' 
              ? (tr ? '📚 TYT sınav süresi: 2 saat (120 dakika)' : '📚 TYT exam duration: 2 hours (120 min)')
              : (tr ? '🎓 AYT sınav süresi: 2 saat 45 dakika (165 dakika)' : '🎓 AYT exam duration: 2h 45m (165 min)')
            }
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!isRunning ? (
          <button 
            onClick={handleStart} 
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 hover-glow" 
            style={{ background: currentPreset.color }}
          >
            <span>{isPaused ? '▶️' : '▶️'}</span>
            <span>{isPaused ? (tr ? 'Devam' : 'Resume') : (tr ? 'Başlat' : 'Start')}</span>
          </button>
        ) : (
          <button 
            onClick={handlePause} 
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105" 
            style={{ background: currentPreset.color }}
          >
            <span>⏸️</span>
            <span>{tr ? 'Duraklat' : 'Pause'}</span>
          </button>
        )}
        
        <button 
          onClick={handleReset} 
          className="p-3 rounded-xl transition-all hover:scale-105" 
          style={{ background: 'var(--surface)', color: 'var(--text)' }} 
          title={tr ? 'Sıfırla' : 'Reset'}
        >
          🔄
        </button>
      </div>

      {/* Game Button */}
      {['shortBreak', 'longBreak'].includes(mode) && (
        <button 
          onClick={() => setShowGame(true)} 
          className="mt-4 flex items-center gap-2 px-6 py-2 mx-auto rounded-xl transition-all hover:scale-105" 
          style={{ background: 'var(--surface)', color: 'var(--text)' }}
        >
          <span>🎮</span>
          <span>{tr ? 'Oyun Oyna' : 'Play Game'}</span>
        </button>
      )}
    </div>
  );
}
