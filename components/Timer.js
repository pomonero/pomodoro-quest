'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Timer() {
  const { user, timerSettings, stats, setStats, setCanPlayGame, setShowGame, language } = useStore();
  const t = translations[language] || translations.tr;

  const [mode, setMode] = useState('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  // Süre state'i - başlangıçta settings'den al
  const getInitialTime = useCallback(() => {
    switch (mode) {
      case 'focus': return (timerSettings?.focusTime || 25) * 60;
      case 'shortBreak': return (timerSettings?.shortBreakTime || 5) * 60;
      case 'longBreak': return (timerSettings?.longBreakTime || 30) * 60;
      default: return 25 * 60;
    }
  }, [mode, timerSettings]);
  
  const [timeLeft, setTimeLeft] = useState(() => (timerSettings?.focusTime || 25) * 60);
  const [totalTime, setTotalTime] = useState(() => (timerSettings?.focusTime || 25) * 60);
  
  const intervalRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Timer çalışıyor
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Mode veya settings değişince (sadece hiç başlamamışsa)
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
    
    // Ses
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = (timerSettings?.soundVolume || 50) / 100;
      audio.play().catch(() => {});
    } catch {}

    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      setCanPlayGame(true);

      // Stats güncelle
      if (user) {
        const mins = timerSettings?.focusTime || 25;
        const newStats = { 
          ...stats, 
          totalSessions: (stats?.totalSessions || 0) + 1, 
          totalMinutes: (stats?.totalMinutes || 0) + mins, 
          todaySessions: (stats?.todaySessions || 0) + 1 
        };
        setStats(newStats);
        await db.updateStats(user.id, newStats);
      }

      // Sonraki mod
      if (newSessions % 4 === 0) {
        setMode('longBreak');
        const newTime = (timerSettings?.longBreakTime || 30) * 60;
        setTimeLeft(newTime);
        setTotalTime(newTime);
      } else {
        setMode('shortBreak');
        const newTime = (timerSettings?.shortBreakTime || 5) * 60;
        setTimeLeft(newTime);
        setTotalTime(newTime);
      }

      if (timerSettings?.autoStartBreaks) {
        setTimeout(() => { setIsRunning(true); hasStartedRef.current = true; }, 1000);
      }
    } else {
      // Mola bitti, focus'a dön
      setMode('focus');
      setCanPlayGame(false);
      const newTime = (timerSettings?.focusTime || 25) * 60;
      setTimeLeft(newTime);
      setTotalTime(newTime);
      
      if (timerSettings?.autoStartPomodoros) {
        setTimeout(() => { setIsRunning(true); hasStartedRef.current = true; }, 1000);
      }
    }
  };

  // BAŞLAT
  const handleStart = () => {
    hasStartedRef.current = true;
    setIsRunning(true);
  };

  // DURAKLAT - süre AYNI kalır
  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // timeLeft değişmez, olduğu yerde kalır
  };

  // SIFIRLA
  const handleReset = () => {
    setIsRunning(false);
    hasStartedRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const newTime = getInitialTime();
    setTimeLeft(newTime);
    setTotalTime(newTime);
  };

  // Mod değiştir
  const changeMode = (newMode) => {
    setIsRunning(false);
    hasStartedRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setMode(newMode);
    
    let newTime;
    switch (newMode) {
      case 'focus': 
        newTime = (timerSettings?.focusTime || 25) * 60; 
        setCanPlayGame(false); 
        break;
      case 'shortBreak': 
        newTime = (timerSettings?.shortBreakTime || 5) * 60; 
        break;
      case 'longBreak': 
        newTime = (timerSettings?.longBreakTime || 30) * 60; 
        break;
      default: 
        newTime = 25 * 60;
    }
    setTimeLeft(newTime);
    setTotalTime(newTime);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  
  const getModeColor = () => {
    switch (mode) {
      case 'focus': return '#6366f1';
      case 'shortBreak': return '#22c55e';
      case 'longBreak': return '#f59e0b';
      default: return '#6366f1';
    }
  };
  
  const getModeIcon = () => {
    switch (mode) {
      case 'focus': return '🎯';
      case 'shortBreak': return '☕';
      case 'longBreak': return '🌴';
      default: return '🎯';
    }
  };

  const size = 280, strokeWidth = 12, radius = (size - strokeWidth) / 2, center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Duraklatıldı mı?
  const isPaused = hasStartedRef.current && !isRunning && timeLeft > 0 && timeLeft < totalTime;

  return (
    <div className="card p-6 text-center">
      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {[
          { id: 'focus', label: t.focus, icon: '🎯' },
          { id: 'shortBreak', label: t.shortBreak, icon: '☕' },
          { id: 'longBreak', label: t.longBreak, icon: '🌴' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => changeMode(m.id)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ 
              background: mode === m.id ? getModeColor() : 'var(--surface)', 
              color: mode === m.id ? 'white' : 'var(--text-muted)' 
            }}
          >
            <span>{m.icon}</span>
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative mx-auto mb-6" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle 
            cx={center} cy={center} r={radius} 
            fill="none" 
            stroke="var(--surface)" 
            strokeWidth={strokeWidth} 
          />
          <circle
            cx={center} cy={center} r={radius} 
            fill="none"
            stroke={getModeColor()} 
            strokeWidth={strokeWidth} 
            strokeLinecap="round"
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset}
            style={{ 
              transition: 'stroke-dashoffset 0.5s ease', 
              filter: `drop-shadow(0 0 10px ${getModeColor()})` 
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl mb-2">{getModeIcon()}</span>
          <span className="text-5xl font-bold font-mono" style={{ color: 'var(--text)' }}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm mt-2 font-medium" style={{ color: getModeColor() }}>
            {mode === 'focus' ? t.focus : mode === 'shortBreak' ? t.shortBreak : t.longBreak}
            {isPaused && ' ⏸️'}
          </span>
        </div>
      </div>

      {/* Sessions */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`text-2xl transition-all ${sessionsCompleted >= i ? 'scale-110' : 'opacity-30'}`}>
            {sessionsCompleted >= i ? '⭐' : '☆'}
          </span>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!isRunning ? (
          <button 
            onClick={handleStart} 
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105" 
            style={{ background: getModeColor() }}
          >
            <span>{isPaused ? '▶️' : '▶️'}</span>
            <span>{isPaused ? (language === 'tr' ? 'Devam' : 'Resume') : t.start}</span>
          </button>
        ) : (
          <button 
            onClick={handlePause} 
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105" 
            style={{ background: getModeColor() }}
          >
            <span>⏸️</span>
            <span>{t.pause}</span>
          </button>
        )}
        
        <button 
          onClick={handleReset} 
          className="p-3 rounded-xl transition-all hover:scale-105" 
          style={{ background: 'var(--surface)', color: 'var(--text)' }} 
          title={language === 'tr' ? 'Sıfırla' : 'Reset'}
        >
          🔄
        </button>
      </div>

      {/* Game Button */}
      {(mode === 'shortBreak' || mode === 'longBreak') && (
        <button 
          onClick={() => setShowGame(true)} 
          className="mt-4 flex items-center gap-2 px-6 py-2 mx-auto rounded-xl transition-all hover:scale-105" 
          style={{ background: 'var(--surface)', color: 'var(--text)' }}
        >
          <span>🎮</span>
          <span>{t.playGame}</span>
        </button>
      )}
    </div>
  );
}
