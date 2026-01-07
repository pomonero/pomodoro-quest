'use client';

import { useEffect, useRef, useCallback } from 'react';
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

  // Play sound
  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  // Session complete handler
  const handleSessionComplete = async () => {
    setTimerState({ isRunning: false });
    playSound();

    if (sessionType === 'work') {
      // Pomodoro'yu veritabanına kaydet
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
      
      // OYUN AÇ! 🎮
      setCanPlayGame(true);
      setShowGame(true);

      // Sonraki mola tipini belirle
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
      // Mola bitti, çalışmaya dön
      setTimerState({
        sessionType: 'work',
        timeLeft: workDuration * 60
      });
      setCanPlayGame(false); // Artık oyun oynayamaz
    }
  };

  // Start timer
  const startTimer = async () => {
    if (!isRunning && sessionType === 'work' && user) {
      // Yeni pomodoro oturumu başlat
      const { data } = await db.startPomodoro(user.id, sessionType, workDuration);
      if (data) {
        setTimerState({ currentSessionId: data.id });
      }
    }
    setTimerState({ isRunning: true });
  };

  // Pause timer
  const pauseTimer = () => {
    setTimerState({ isRunning: false });
  };

  // Reset timer
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

  // Skip to next session
  const skipSession = () => {
    if (sessionType === 'work') {
      setTimerState({
        isRunning: false,
        sessionType: 'break',
        timeLeft: breakDuration * 60
      });
    } else {
      setTimerState({
        isRunning: false,
        sessionType: 'work',
        timeLeft: workDuration * 60
      });
    }
  };

  // Change session type manually
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

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const getTotalTime = () => {
    if (sessionType === 'work') return workDuration * 60;
    if (sessionType === 'break') return breakDuration * 60;
    return longBreakDuration * 60;
  };
  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100;

  const theme = darkMode ? {
    surface: 'bg-gray-900',
    text: 'text-gray-100',
    textMuted: 'text-gray-400',
    border: 'border-cyan-500/30',
    neonPrimary: 'text-cyan-400',
    neonSecondary: 'text-fuchsia-400',
    neonAccent: 'text-lime-400',
    button: 'bg-cyan-500 hover:bg-cyan-400 text-gray-950',
    buttonSecondary: 'bg-gray-800 hover:bg-gray-700 text-gray-300',
    progressBg: 'bg-gray-800',
    progressFill: sessionType === 'work' ? 'bg-cyan-500' : 'bg-fuchsia-500',
  } : {
    surface: 'bg-white',
    text: 'text-gray-900',
    textMuted: 'text-gray-600',
    border: 'border-fuchsia-400/30',
    neonPrimary: 'text-fuchsia-600',
    neonSecondary: 'text-cyan-600',
    neonAccent: 'text-emerald-600',
    button: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-white',
    buttonSecondary: 'bg-slate-200 hover:bg-slate-300 text-gray-700',
    progressBg: 'bg-slate-200',
    progressFill: sessionType === 'work' ? 'bg-fuchsia-500' : 'bg-cyan-500',
  };

  const sessionLabels = {
    work: 'ÇALIŞMA',
    break: 'MOLA',
    longBreak: 'UZUN MOLA'
  };

  return (
    <div className={`${theme.surface} ${theme.border} border-4 p-6 shadow-neon-cyan`}>
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/sounds/complete.mp3" preload="auto" />

      {/* Session Type Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {['work', 'break', 'longBreak'].map((type) => (
          <button
            key={type}
            onClick={() => changeSession(type)}
            className={`px-4 py-2 font-pixel text-xs border-2 transition-all
              ${sessionType === type
                ? `${theme.button} ${theme.border}`
                : `${theme.buttonSecondary} ${theme.border}`
              }`}
          >
            {sessionLabels[type]}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div 
          className={`text-6xl sm:text-8xl font-pixel ${theme.neonPrimary} mb-4 
            ${isRunning ? 'timer-active' : ''}`}
          style={{ 
            textShadow: darkMode 
              ? '0 0 20px cyan, 0 0 40px cyan, 0 0 60px cyan' 
              : '0 0 20px fuchsia, 0 0 40px fuchsia'
          }}
        >
          {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div className={`h-2 ${theme.progressBg} rounded-full overflow-hidden mb-4`}>
          <div 
            className={`h-full ${theme.progressFill} transition-all duration-1000`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Session Info */}
        <p className={`font-pixel text-xs ${theme.textMuted}`}>
          {sessionLabels[sessionType]} • {completedPomodoros}/5 TAMAMLANDI
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-3 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 border-2 ${theme.border} transition-all
              ${i <= (completedPomodoros % 5 || (completedPomodoros > 0 && completedPomodoros % 5 === 0 ? 5 : 0))
                ? `${darkMode ? 'bg-cyan-400' : 'bg-fuchsia-400'} shadow-neon-cyan`
                : 'bg-transparent'
              }`}
          />
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className={`px-8 py-4 font-pixel text-sm ${theme.button} retro-btn transition-all hover:scale-105`}
          >
            ▶ BAŞLAT
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className={`px-8 py-4 font-pixel text-sm ${theme.button} retro-btn transition-all hover:scale-105`}
          >
            ⏸ DURAKLAT
          </button>
        )}

        <button
          onClick={skipSession}
          className={`px-6 py-4 font-pixel text-sm ${theme.buttonSecondary} ${theme.border} border-2`}
        >
          ⏭ ATLA
        </button>

        <button
          onClick={resetTimer}
          className={`px-6 py-4 font-pixel text-sm ${theme.buttonSecondary} ${theme.border} border-2`}
        >
          ↺ SIFIRLA
        </button>
      </div>

      {/* Game Reminder */}
      {completedPomodoros > 0 && sessionType !== 'work' && (
        <div className={`mt-6 p-4 ${theme.border} border-2 text-center`}>
          <p className={`font-pixel text-xs ${theme.neonAccent}`}>
            🎮 PODOMOROyu BİTİRDİN! OYUN OYNAMAYI UNUTMA!
          </p>
          <button
            onClick={() => setShowGame(true)}
            className={`mt-2 px-4 py-2 font-pixel text-xs ${theme.button}`}
          >
            OYUNU AÇ
          </button>
        </div>
      )}
    </div>
  );
}
