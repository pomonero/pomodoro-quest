'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Timer() {
  const { user, timerSettings, stats, setStats, setCanPlayGame, setShowGame, language } = useStore();
  const t = translations[language] || translations.tr;

  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(timerSettings?.focusTime * 60 || 25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  const intervalRef = useRef(null);
  const endTimeRef = useRef(null);

  const getTotalTime = useCallback(() => {
    switch (mode) {
      case 'focus': return (timerSettings?.focusTime || 25) * 60;
      case 'shortBreak': return (timerSettings?.shortBreakTime || 5) * 60;
      case 'longBreak': return (timerSettings?.longBreakTime || 30) * 60;
      default: return 25 * 60;
    }
  }, [mode, timerSettings]);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getTotalTime());
    }
  }, [timerSettings, mode, isRunning, getTotalTime]);

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
    endTimeRef.current = null;
    
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

      if (newSessions % 4 === 0) {
        setMode('longBreak');
        setTimeLeft((timerSettings?.longBreakTime || 30) * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft((timerSettings?.shortBreakTime || 5) * 60);
      }

      if (timerSettings?.autoStartBreaks) {
        setTimeout(() => startTimer(), 1000);
      }
    } else {
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
    endTimeRef.current = Date.now() + (timeLeft * 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getTotalTime());
    endTimeRef.current = null;
  };

  const changeMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
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

  // Progress hesapla (0-100)
  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100;

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

  // SVG Arc hesaplama - yuvarlatılmış uçlar için
  const size = 280;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Arc path oluştur
  const createArcPath = (percentage) => {
    if (percentage === 0) return '';
    if (percentage >= 100) {
      // Tam daire
      return `M ${center} ${strokeWidth / 2}
              A ${radius} ${radius} 0 1 1 ${center - 0.01} ${strokeWidth / 2}`;
    }
    
    const angle = (percentage / 100) * 360;
    const startAngle = -90; // Saat 12'den başla
    const endAngle = startAngle + angle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
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

      {/* Timer Circle - SVG Arc */}
      <div className="relative mx-auto mb-6" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--surface)"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress arc - yuvarlatılmış uçlar */}
          {progress > 0 && (
            <path
              d={createArcPath(progress)}
              fill="none"
              stroke={getModeColor()}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${getModeColor()})`,
                transition: 'all 0.3s ease'
              }}
            />
          )}
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl mb-2">{getModeIcon()}</span>
          <span className="text-5xl font-bold font-mono" style={{ color: 'var(--text)' }}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm mt-2 font-medium" style={{ color: getModeColor() }}>
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
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
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
