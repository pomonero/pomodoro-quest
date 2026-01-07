'use client';
import { useStore } from '@/lib/store';

export default function AdSpace({ size = 'square' }) {
  const { language } = useStore();
  return (
    <div className="card p-4 flex flex-col items-center justify-center border-dashed" style={{ minHeight: size === 'square' ? '200px' : '90px' }}>
      <span className="text-2xl mb-2 opacity-30">📢</span>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{language === 'tr' ? 'Reklam Alanı' : 'Ad Space'}</span>
    </div>
  );
}
