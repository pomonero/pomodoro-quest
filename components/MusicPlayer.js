'use client';

import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function MusicPlayer() {
  const { language } = useStore();
  const t = translations[language] || translations.tr;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <span className="text-lg">🎵</span>
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {t.musicPlayer}
        </span>
      </div>

      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3" style={{ background: 'var(--surface)' }}>
          <span className="text-3xl opacity-50">🎧</span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t.comingSoon}
        </p>
      </div>

      {/* Placeholder Controls */}
      <div className="flex items-center justify-center gap-4 opacity-30">
        <button className="p-2 rounded-full" style={{ background: 'var(--surface)' }}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--text)' }}>
            <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832l-4 2.5a1 1 0 000 1.664l4 2.5z" />
          </svg>
        </button>
        <button className="p-3 rounded-full bg-[var(--primary)]">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </button>
        <button className="p-2 rounded-full" style={{ background: 'var(--surface)' }}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--text)' }}>
            <path d="M11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832l4-2.5a1 1 0 000-1.664l-4-2.5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
