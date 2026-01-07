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

  const monthNames = language === 'tr' ? ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = language === 'tr' ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => { if (user) loadActivityData(); }, [user, currentDate]);

  const loadActivityData = async () => {
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0).toISOString();
    const { data } = await db.getActivityByDateRange(user.id, startDate, endDate);
    if (data) {
      const activity = {};
      data.forEach(session => {
        const date = new Date(session.started_at).toDateString();
        if (!activity[date]) activity[date] = { count: 0, minutes: 0 };
        activity[date].count++;
        activity[date].minutes += session.duration || 25;
      });
      setActivityData(activity);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
    const days = [];
    let startDay = firstDay.getDay() - 1; if (startDay < 0) startDay = 6;
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const getActivityLevel = (date) => { if (!date) return 0; const a = activityData[date.toDateString()]; if (!a) return 0; if (a.count >= 8) return 4; if (a.count >= 6) return 3; if (a.count >= 4) return 2; if (a.count >= 1) return 1; return 0; };
  const getActivityColor = (level) => ['bg-[var(--surface)]', 'bg-green-900/50', 'bg-green-700/70', 'bg-green-500/80', 'bg-green-400'][level];
  const isToday = (date) => date && date.toDateString() === new Date().toDateString();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center"><span className="text-lg">📅</span></div>
          <div><h3 className="font-semibold" style={{ color: 'var(--text)' }}>{t.calendar}</h3><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.trackProgress}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 rounded-lg hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text)' }}>◀</button>
          <span className="font-medium min-w-[140px] text-center" style={{ color: 'var(--text)' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 rounded-lg hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text)' }}>▶</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">{dayNames.map((day) => (<div key={day} className="text-center text-xs font-medium py-2" style={{ color: 'var(--text-muted)' }}>{day}</div>))}</div>
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth().map((date, index) => {
          const level = getActivityLevel(date);
          return (<button key={index} onClick={() => date && setSelectedDay(date)} disabled={!date} className={`aspect-square rounded-lg text-sm font-medium transition-all relative ${date ? 'hover:ring-2 hover:ring-[var(--primary)] cursor-pointer' : ''} ${getActivityColor(level)} ${isToday(date) ? 'ring-2 ring-[var(--primary)]' : ''}`} style={{ color: level > 0 ? 'white' : 'var(--text)' }}>{date?.getDate()}{level > 0 && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px]">⭐</span>}</button>);
        })}
      </div>
      {selectedDay && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ color: 'var(--text)' }}>{selectedDay.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{activityData[selectedDay.toDateString()] ? `${activityData[selectedDay.toDateString()].count} ${t.sessionsCompleted}` : t.noActivity}</p>
            </div>
            <button onClick={() => setSelectedDay(null)} className="p-1 rounded hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-2 mt-4"><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.less}</span>{[0, 1, 2, 3, 4].map((l) => (<div key={l} className={`w-4 h-4 rounded ${getActivityColor(l)}`} />))}<span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.more}</span></div>
    </div>
  );
}
