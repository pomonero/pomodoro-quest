'use client';

import { useStore } from '@/lib/store';

export default function AdSpace({ size = 'square' }) {
  const { language } = useStore();

  const sizes = {
    square: { width: '100%', height: '250px', label: '300x250' },
    horizontal: { width: '100%', height: '90px', label: '728x90' },
    vertical: { width: '160px', height: '600px', label: '160x600' },
    banner: { width: '100%', height: '90px', label: '728x90' },
  };

  const currentSize = sizes[size];

  return (
    <div
      className="rounded-2xl flex flex-col items-center justify-center card border-dashed"
      style={{
        width: currentSize.width,
        height: currentSize.height,
        minHeight: currentSize.height,
        borderColor: 'var(--border)',
        background: 'var(--surface)',
      }}
    >
      <span className="text-2xl mb-2 opacity-30">📢</span>
      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {language === 'tr' ? 'Reklam Alanı' : 'Ad Space'}
      </span>
      <span className="text-xs opacity-50" style={{ color: 'var(--text-muted)' }}>
        {currentSize.label}
      </span>
    </div>
  );
}
