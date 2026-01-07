'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Timer() {
  const { user, timerSettings, stats, setStats, setCanPlayGame, setShowGame, language } = useStore();
  const t = translations[language] || translations.tr;

  const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(timerSettings?.focusTime * 60 || 25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const getTotalTime = useCallback(() => {
    switch (mode) {
      case 'focus': return (timerSettings?.focusTime || 25) * 60;
      case 'shortBreak': return (timerSettings?.shortBreakTime || 5) * 60;
      case 'longBreak': return (timerSettings?.longBreakTime || 30) * 60;
      default: return 25 * 60;
    }
  }, [mode, timerSettings]);

  // Timer settings değişince güncelle
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getTotalTime());
    }
  }, [timerSettings, mode, isRunning, getTotalTime]);

  // Ana timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Visibility change - sekmeden çıkıp dönünce düzelt
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && endTimeRef.current) {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          setIsRunning(false);
          handleTimerComplete();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    // Ses çal
    if (timerSettings?.soundEnabled) {
      try {
        const audio = new Audio('/sounds/complete.mp3');
        audio.volume = (timerSettings?.soundVolume || 50) / 100;
        audio.play().catch(() => {});
      } catch {}
    }

    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      setCanPlayGame(true);

      // İstatistikleri güncelle
      if (user) {
        const focusMinutes = timerSettings?.focusTime || 25;
        const newStats = {
          ...stats,
          totalSessions: (stats?.totalSessions || 0) + 1,
          totalMinutes: (stats?.totalMinutes || 0) + focusMinutes,
          todaySessions: (stats?.todaySessions || 0) + 1,
        };
        setStats(newStats);
        await db.updateStats(user.id, newStats);
      }

      // Uzun mola mı kısa mola mı?
      if (newSessions % 4 === 0) {
        setMode('longBreak');
        setTimeLeft((timerSettings?.longBreakTime || 30) * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft((timerSettings?.shortBreakTime || 5) * 60);
      }

      // Otomatik başlat
      if (timerSettings?.autoStartBreaks) {
        setTimeout(() => startTimer(), 1000);
      }
    } else {
      // Mola bitti
      setMode('focus');
      setTimeLeft((timerSettings?.focusTime || 25) * 60);
      setCanPlayGame(false);

      if (timerSettings?.autoStartPomodoros) {
        setTimeout(() => startTimer(), 1000);
      }
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
    endTimeRef.current = Date.now() + (timeLeft * 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getTotalTime());
    startTimeRef.current = null;
    endTimeRef.current = null;
  };

  const changeMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    startTimeRef.current = null;
    endTimeRef.current = null;
    switch (newMode) {
      case 'focus':
        setTimeLeft((timerSettings?.focusTime || 25) * 60);
        setCanPlayGame(false);
        break;
      case 'shortBreak':
        setTimeLeft((timerSettings?.shortBreakTime || 5) * 60);
        break;
      case 'longBreak':
        setTimeLeft((timerSettings?.longBreakTime || 30) * 60);
        break;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getModeColor = () => {
    switch (mode) {
      case 'focus': return 'var(--primary)';
      case 'shortBreak': return '#22c55e';
      case 'longBreak': return '#f59e0b';
      default: return 'var(--primary)';
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

  return (
    <div className="card p-6 text-center">
      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {[
          { id: 'focus', label: t.focus, icon: '🎯' },
          { id: 'shortBreak', label: t.shortBreak, icon: '☕' },
          { id: 'longBreak', label: t.longBreak, icon: '🌴' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => changeMode(m.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === m.id ? 'text-white' : ''
            }`}
            style={{
              background: mode === m.id ? getModeColor() : 'var(--surface)',
              color: mode === m.id ? 'white' : 'var(--text-muted)',
            }}
          >
            <span>{m.icon}</span>
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative w-72 h-72 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
          {/* Background circle */}
          <circle
            cx="150"
            cy="150"
            r="140"
            stroke="var(--surface)"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle - YUVARLATILMIŞ */}
          <circle
            cx="150"
            cy="150"
            r="140"
            stroke={getModeColor()}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0 0 10px ${getModeColor()})` }}
          />
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl mb-2">{getModeIcon()}</span>
          <span className="text-5xl font-bold font-mono" style={{ color: 'var(--text)' }}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm mt-2" style={{ color: getModeColor() }}>
            {mode === 'focus' ? t.focus : mode === 'shortBreak' ? t.shortBreak : t.longBreak}
          </span>
        </div>
      </div>

      {/* Sessions */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`text-2xl transition-all ${sessionsCompleted >= i ? 'scale-110' : 'opacity-30'}`}
          >
            {sessionsCompleted >= i ? '⭐' : '☆'}
          </span>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
          style={{ background: getModeColor() }}
        >
          {isRunning ? (
            <>
              <span>⏸️</span>
              <span>{t.pause}</span>
            </>
          ) : (
            <>
              <span>▶️</span>
              <span>{t.start}</span>
            </>
          )}
        </button>
        <button
          onClick={resetTimer}
          className="p-3 rounded-xl transition-all hover:scale-105"
          style={{ background: 'var(--surface)', color: 'var(--text)' }}
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
