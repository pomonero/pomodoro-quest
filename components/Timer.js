'use client';
import { useEffect, useRef } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Timer() {
  const { user, language, settings, timerState, setTimerState, setShowGame, setCanPlayGame, stats, setStats } = useStore();
  const { isRunning, timeLeft, sessionType, completedSessions, currentSessionId } = timerState;
  const { workDuration, breakDuration, longBreakDuration, soundEnabled } = settings;
  const t = translations[language] || translations.tr;
  const audioRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimerState({ timeLeft: timeLeft - 1 }), 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    setTimerState({ isRunning: false });
    if (soundEnabled && audioRef.current) audioRef.current.play().catch(() => {});
    if (sessionType === 'work') {
      if (currentSessionId && user) {
        await db.completePomodoro(currentSessionId);
        setStats({ ...stats, totalSessions: stats.totalSessions + 1, todaySessions: stats.todaySessions + 1, totalFocusMinutes: stats.totalFocusMinutes + workDuration });
      }
      const newCount = completedSessions + 1;
      setTimerState({ completedSessions: newCount });
      setCanPlayGame(true);
      setShowGame(true);
      if (newCount % 4 === 0) {
        setTimerState({ sessionType: 'longBreak', timeLeft: longBreakDuration * 60 });
      } else {
        setTimerState({ sessionType: 'break', timeLeft: breakDuration * 60 });
      }
    } else {
      setTimerState({ sessionType: 'work', timeLeft: workDuration * 60 });
      setCanPlayGame(false);
    }
  };

  const startTimer = async () => {
    if (!isRunning && sessionType === 'work' && user) {
      const { data } = await db.startPomodoro(user.id, sessionType, workDuration);
      if (data) setTimerState({ currentSessionId: data.id });
    }
    setTimerState({ isRunning: true });
  };

  const pauseTimer = () => setTimerState({ isRunning: false });
  const resetTimer = () => { setTimerState({ isRunning: false, timeLeft: workDuration * 60, sessionType: 'work', completedSessions: 0, currentSessionId: null }); setCanPlayGame(false); };
  const changeSession = (type) => {
    const durations = { work: workDuration, break: breakDuration, longBreak: longBreakDuration };
    setTimerState({ isRunning: false, sessionType: type, timeLeft: durations[type] * 60 });
  };

  const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const getTotalTime = () => sessionType === 'work' ? workDuration * 60 : sessionType === 'break' ? breakDuration * 60 : longBreakDuration * 60;
  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const sessionConfig = { work: { icon: '🎯', color: 'var(--primary)' }, break: { icon: '☕', color: '#22c55e' }, longBreak: { icon: '🌴', color: '#f97316' } };
  const config = sessionConfig[sessionType];

  return (
    <div className="card p-6">
      <audio ref={audioRef} src="/sounds/complete.mp3" preload="auto" />
      <div className="flex justify-center gap-2 mb-6">
        {[{ type: 'work', label: t.focus, icon: '🎯' }, { type: 'break', label: t.shortBreak, icon: '☕' }, { type: 'longBreak', label: t.longBreak, icon: '🌴' }].map(({ type, label, icon }) => (
          <button key={type} onClick={() => changeSession(type)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${sessionType === type ? 'bg-[var(--primary)] text-white shadow-lg' : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)]'}`} style={{ color: sessionType === type ? 'white' : 'var(--text)' }}><span>{icon}</span><span className="hidden sm:inline">{label}</span></button>
        ))}
      </div>
      <div className="relative flex justify-center items-center mb-6">
        <svg className="w-64 h-64 transform -rotate-90">
          <circle cx="128" cy="128" r="120" fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle cx="128" cy="128" r="120" fill="none" stroke={config.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-linear" style={{ filter: `drop-shadow(0 0 10px ${config.color})` }} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl mb-2">{config.icon}</span>
          <span className="timer-display text-5xl md:text-6xl" style={{ color: 'var(--text)' }}>{formatTime(timeLeft)}</span>
          <span className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{sessionType === 'work' ? t.focus : sessionType === 'break' ? t.shortBreak : t.longBreak}</span>
        </div>
      </div>
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (<div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${i <= (completedSessions % 4 || (completedSessions > 0 && completedSessions % 4 === 0 ? 4 : 0)) ? 'bg-[var(--primary)] shadow-lg animate-sparkle' : 'bg-[var(--surface)]'}`}>{i <= (completedSessions % 4 || (completedSessions > 0 && completedSessions % 4 === 0 ? 4 : 0)) ? '⭐' : '☆'}</div>))}
      </div>
      <div className="flex justify-center gap-3">
        {!isRunning ? (
          <button onClick={startTimer} className="btn-primary flex items-center gap-2 px-8"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>{t.start}</button>
        ) : (
          <button onClick={pauseTimer} className="btn-primary flex items-center gap-2 px-8"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{t.pause}</button>
        )}
        <button onClick={resetTimer} className="btn-secondary p-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
      </div>
      {completedSessions > 0 && sessionType !== 'work' && (
        <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--primary)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><span className="text-2xl">🎮</span><p className="font-medium" style={{ color: 'var(--text)' }}>{t.breakTime}</p></div>
            <button onClick={() => setShowGame(true)} className="px-4 py-2 rounded-lg font-medium transition-colors" style={{ background: 'var(--primary)', color: 'white' }}>{t.playGame}</button>
          </div>
        </div>
      )}
    </div>
  );
}
