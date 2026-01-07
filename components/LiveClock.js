'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function LiveClock() {
  const { language } = useStore();
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center"><span className="text-lg">🕐</span></div>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{language === 'tr' ? 'Şu an' : 'Now'}</span>
      </div>
      <div className="text-center">
        <p className="timer-display text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{time.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
        <p className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{time.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
    </div>
  );
}
