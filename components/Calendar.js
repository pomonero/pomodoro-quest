'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function Calendar() {
  const { darkMode, user } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activityData, setActivityData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  // Aktivite verilerini yükle
  useEffect(() => {
    const loadActivityData = async () => {
      if (!user) return;

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data } = await supabase
        .from('pomodoro_sessions')
        .select('started_at, duration_minutes, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('started_at', startOfMonth.toISOString())
        .lte('started_at', endOfMonth.toISOString());

      if (data) {
        const grouped = {};
        data.forEach(session => {
          const day = new Date(session.started_at).getDate();
          if (!grouped[day]) {
            grouped[day] = { count: 0, minutes: 0 };
          }
          grouped[day].count++;
          grouped[day].minutes += session.duration_minutes;
        });
        setActivityData(grouped);
      }
    };

    loadActivityData();
  }, [user, currentDate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Pazartesi başlangıç için ayarla
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    return { daysInMonth, firstDayOfMonth: adjustedFirstDay };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDay(null);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getActivityLevel = (day) => {
    const activity = activityData[day];
    if (!activity) return 0;
    if (activity.count >= 8) return 4;
    if (activity.count >= 5) return 3;
    if (activity.count >= 3) return 2;
    return 1;
  };

  const activityColors = {
    0: darkMode ? 'bg-white/5' : 'bg-gray-100',
    1: 'bg-accent/30',
    2: 'bg-accent/50',
    3: 'bg-accent/70',
    4: 'bg-accent',
  };

  return (
    <div className={`card p-6 ${darkMode ? '' : 'card-light'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Çalışma Takvimi
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Günlük aktiviteni takip et
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className={`p-2 rounded-lg transition-all ${
              darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className={`text-sm font-medium min-w-[120px] text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            className={`p-2 rounded-lg transition-all ${
              darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
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
          <div
            key={day}
            className={`text-center text-xs font-medium py-2 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for first week */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const activity = activityData[day];
          const level = getActivityLevel(day);
          const today = isToday(day);

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(selectedDay === day ? null : day)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center text-sm
                transition-all relative
                ${activityColors[level]}
                ${today ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent' : ''}
                ${selectedDay === day ? 'ring-2 ring-secondary' : ''}
                ${darkMode ? 'text-white hover:bg-white/20' : 'text-gray-900 hover:bg-gray-200'}
              `}
            >
              <span className={`font-medium ${today ? 'text-primary' : ''}`}>{day}</span>
              {activity && (
                <span className="text-xs opacity-70">{activity.count}🍅</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Info */}
      {selectedDay && activityData[selectedDay] && (
        <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedDay} {monthNames[currentDate.getMonth()]}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {activityData[selectedDay].count} Pomodoro tamamlandı
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${darkMode ? 'text-accent' : 'text-accent-dark'}`}>
                {activityData[selectedDay].minutes}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                dakika odaklanma
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Az</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-3 h-3 rounded ${activityColors[level]}`}
          />
        ))}
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Çok</span>
      </div>
    </div>
  );
}
