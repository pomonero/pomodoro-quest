'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function LiveClock() {
  const { darkMode } = useStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('tr-TR', options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`card p-4 ${darkMode ? '' : 'card-light'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Şu An
          </p>
          <p className={`text-2xl font-display font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(time)}
          </p>
        </div>
      </div>
      
      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        📅 {formatDate(time)}
      </div>
    </div>
  );
}
