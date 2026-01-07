'use client';

import { useStore } from '@/lib/store';

export default function AdSpace({ size = 'square' }) {
  const { darkMode } = useStore();

  const sizes = {
    square: { width: '100%', height: '250px', label: '300x250' },
    horizontal: { width: '100%', height: '90px', label: '728x90' },
    vertical: { width: '160px', height: '600px', label: '160x600' },
    banner: { width: '100%', height: '90px', label: '728x90' },
  };

  const currentSize = sizes[size];

  return (
    <div
      className={`rounded-2xl flex flex-col items-center justify-center ${
        darkMode 
          ? 'bg-white/5 border border-white/10 border-dashed' 
          : 'bg-gray-100 border border-gray-200 border-dashed'
      }`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
        minHeight: currentSize.height,
      }}
    >
      <span className={`text-2xl mb-2 ${darkMode ? 'opacity-30' : 'opacity-40'}`}>📢</span>
      <span className={`text-xs font-medium ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
        Reklam Alanı
      </span>
      <span className={`text-xs ${darkMode ? 'text-gray-700' : 'text-gray-300'}`}>
        {currentSize.label}
      </span>
    </div>
  );
}
