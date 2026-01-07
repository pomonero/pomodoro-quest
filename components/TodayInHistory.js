'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function TodayInHistory() {
  const { language, currentTheme } = useStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const t = translations[language] || translations.tr;

  useEffect(() => {
    const fetchTodayInHistory = async () => {
      try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        // Wikipedia On This Day API
        const lang = language === 'tr' ? 'tr' : 'en';
        const response = await fetch(
          `https://api.wikimedia.org/feed/v1/wikipedia/${lang}/onthisday/events/${month}/${day}`
        );
        
        if (response.ok) {
          const data = await response.json();
          // En önemli 5 olayı al
          const importantEvents = data.events?.slice(0, 5) || [];
          setEvents(importantEvents);
        }
      } catch (error) {
        console.error('Tarihte bugün yüklenemedi:', error);
        // Fallback - statik içerik
        setEvents([
          { year: new Date().getFullYear(), text: language === 'tr' ? 'Bugün harika bir gün!' : 'Today is a great day!' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayInHistory();
  }, [language]);

  // Auto rotate events
  useEffect(() => {
    if (events.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [events.length]);

  const currentEvent = events[currentIndex];

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <span className="text-lg">📅</span>
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            {t.todayInHistory}
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>{t.loading}</span>
        </div>
      ) : currentEvent ? (
        <div className="relative overflow-hidden">
          <div className="flex items-start gap-3">
            <span className="text-xl font-bold text-[var(--primary)] shrink-0">
              {currentEvent.year}
            </span>
            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text)' }}>
              {currentEvent.text}
            </p>
          </div>
          
          {/* Navigation dots */}
          {events.length > 1 && (
            <div className="flex justify-center gap-1 mt-3">
              {events.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-[var(--primary)] w-4' : 'bg-[var(--border)]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
          {language === 'tr' ? 'Bilgi yüklenemedi' : 'Could not load data'}
        </p>
      )}
    </div>
  );
}
