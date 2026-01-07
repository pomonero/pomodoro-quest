'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Calendar() {
  const { user, language } = useStore();
  const t = translations[language] || translations.tr;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activityData, setActivityData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  const monthNames = language === 'tr' 
    ? ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayNames = language === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    if (user) {
      loadActivityData();
    }
  }, [user, currentDate]);

  const loadActivityData = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0).toISOString();

    const { data } = await db.getActivityByDateRange(user.id, startDate, endDate);
    
    if (data) {
      const activity = {};
      data.forEach(session => {
        const date = new Date(session.started_at).toDateString();
        if (!activity[date]) {
          activity[date] = { count: 0, minutes: 0 };
        }
        activity[date].count++;
        activity[date].minutes += session.duration || 25;
      });
      setActivityData(activity);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Ayın ilk gününden önceki boş günler
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Ayın günleri
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getActivityLevel = (date) => {
    if (!date) return 0;
    const activity = activityData[date.toDateString()];
    if (!activity) return 0;
    if (activity.count >= 8) return 4;
    if (activity.count >= 6) return 3;
    if (activity.count >= 4) return 2;
    if (activity.count >= 1) return 1;
    return 0;
  };

  const getActivityColor = (level) => {
    const colors = [
      'bg-[var(--surface)]',
      'bg-green-900/50',
      'bg-green-700/70',
      'bg-green-500/80',
      'bg-green-400'
    ];
    return colors[level];
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDay(null);
  };

  const days = getDaysInMonth();

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <span className="text-lg">📅</span>
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              {t.calendar}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t.trackProgress}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            style={{ color: 'var(--text)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-medium min-w-[140px] text-center" style={{ color: 'var(--text)' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            style={{ color: 'var(--text)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium py-2" style={{ color: 'var(--text-muted)' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const level = getActivityLevel(date);
          const activity = date ? activityData[date.toDateString()] : null;

          return (
            <button
              key={index}
              onClick={() => date && setSelectedDay(date)}
              disabled={!date}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all relative
                ${date ? 'hover:ring-2 hover:ring-[var(--primary)] cursor-pointer' : 'cursor-default'}
                ${getActivityColor(level)}
                ${isToday(date) ? 'ring-2 ring-[var(--primary)]' : ''}
                ${selectedDay?.toDateString() === date?.toDateString() ? 'ring-2 ring-[var(--accent)]' : ''}
              `}
              style={{ color: level > 0 ? 'white' : 'var(--text)' }}
            >
              {date?.getDate()}
              {level > 0 && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px]">
                  ⭐
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Info */}
      {selectedDay && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ color: 'var(--text)' }}>
                {selectedDay.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
              {activityData[selectedDay.toDateString()] ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {activityData[selectedDay.toDateString()].count} {t.sessionsCompleted} • {activityData[selectedDay.toDateString()].minutes} {t.minutesFocused}
                </p>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {t.noActivity}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1 rounded hover:bg-[var(--surface-hover)]"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.less || 'Az'}</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-4 h-4 rounded ${getActivityColor(level)}`}
          />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.more || 'Çok'}</span>
      </div>
    </div>
  );
}
