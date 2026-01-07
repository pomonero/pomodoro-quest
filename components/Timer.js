'use client';

import { useEffect, useRef } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function Timer() {
  const {
    user,
    darkMode,
    settings,
    timerState,
    setTimerState,
    setShowGame,
    setCanPlayGame,
    stats,
    setStats
  } = useStore();

  const { isRunning, timeLeft, sessionType, completedPomodoros, currentSessionId } = timerState;
  const { workDuration, breakDuration, longBreakDuration, soundEnabled } = settings;

  const audioRef = useRef(null);

  // Timer Logic
  useEffect(() => {
    let interval;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState({ timeLeft: timeLeft - 1 });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleSessionComplete = async () => {
    setTimerState({ isRunning: false });
    playSound();

    if (sessionType === 'work') {
      if (currentSessionId && user) {
        await db.completePomodoro(currentSessionId);
        setStats({
          ...stats,
          totalPomodoros: stats.totalPomodoros + 1,
          todayPomodoros: stats.todayPomodoros + 1,
          totalFocusMinutes: stats.totalFocusMinutes + workDuration
        });
      }

      const newCount = completedPomodoros + 1;
      setTimerState({ completedPomodoros: newCount });
      
      setCanPlayGame(true);
      setShowGame(true);

      if (newCount % 5 === 0) {
        setTimerState({
          sessionType: 'longBreak',
          timeLeft: longBreakDuration * 60
        });
      } else {
        setTimerState({
          sessionType: 'break',
          timeLeft: breakDuration * 60
        });
      }
    } else {
      setTimerState({
        sessionType: 'work',
        timeLeft: workDuration * 60
      });
      setCanPlayGame(false);
    }
  };

  const startTimer = async () => {
    if (!isRunning && sessionType === 'work' && user) {
      const { data } = await db.startPomodoro(user.id, sessionType, workDuration);
      if (data) {
        setTimerState({ currentSessionId: data.id });
      }
    }
    setTimerState({ isRunning: true });
  };

  const pauseTimer = () => {
    setTimerState({ isRunning: false });
  };

  const resetTimer = () => {
    setTimerState({
      isRunning: false,
      timeLeft: workDuration * 60,
      sessionType: 'work',
      completedPomodoros: 0,
      currentSessionId: null
    });
    setCanPlayGame(false);
  };

  const changeSession = (type) => {
    const durations = {
      work: workDuration,
      break: breakDuration,
      longBreak: longBreakDuration
    };
    setTimerState({
      isRunning: false,
      sessionType: type,
      timeLeft: durations[type] * 60
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    if (sessionType === 'work') return workDuration * 60;
    if (sessionType === 'break') return breakDuration * 60;
    return longBreakDuration * 60;
  };

  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const sessionColors = {
    work: { primary: '#6366f1', secondary: '#818cf8' },
    break: { primary: '#10b981', secondary: '#34d399' },
    longBreak: { primary: '#f97316', secondary: '#fb923c' }
  };

  const currentColor = sessionColors[sessionType];

  const sessionLabels = {
    work: { label: 'Odaklan', icon: '🎯' },
    break: { label: 'Kısa Mola', icon: '☕' },
    longBreak: { label: 'Uzun Mola', icon: '🌴' }
  };

  return (
    <div className={`card p-6 ${darkMode ? '' : 'card-light'}`}>
      <audio ref={audioRef} src="/sounds/complete.mp3" preload="auto" />

      {/* Session Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {Object.entries(sessionLabels).map(([type, { label, icon }]) => (
          <button
            key={type}
            onClick={() => changeSession(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              sessionType === type
                ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-glow'
                : darkMode
                  ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative flex justify-center items-center mb-6">
        <svg className="w-64 h-64 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke={`url(#gradient-${sessionType})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{ filter: `drop-shadow(0 0 10px ${currentColor.primary})` }}
          />
          <defs>
            <linearGradient id={`gradient-${sessionType}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentColor.primary} />
              <stop offset="100%" stopColor={currentColor.secondary} />
            </linearGradient>
          </defs>
        </svg>

        {/* Time Display */}
        <div className="absolute flex flex-col items-center">
          <span className={`timer-display text-5xl md:text-6xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(timeLeft)}
          </span>
          <span className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {sessionLabels[sessionType].icon} {sessionLabels[sessionType].label}
          </span>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i <= (completedPomodoros % 5 || (completedPomodoros > 0 && completedPomodoros % 5 === 0 ? 5 : 0))
                ? 'bg-gradient-to-r from-primary to-secondary shadow-glow'
                : darkMode ? 'bg-white/10' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="btn-primary flex items-center gap-2 px-8"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Başlat
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="btn-primary flex items-center gap-2 px-8"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Duraklat
          </button>
        )}

        <button
          onClick={resetTimer}
          className={`btn-secondary ${darkMode ? '' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Game Reminder */}
      {completedPomodoros > 0 && sessionType !== 'work' && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tebrikler! Oyun zamanı!
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Pomodoro tamamlandı
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGame(true)}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors"
            >
              Oyna
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
