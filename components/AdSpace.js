'use client';

import { useStore } from '@/lib/store';

export default function AdSpace({ size = 'square' }) {
  const { darkMode } = useStore();

  const sizes = {
    square: { width: '300px', height: '250px', label: '300x250' },
    horizontal: { width: '100%', height: '90px', label: '728x90' },
    vertical: { width: '160px', height: '600px', label: '160x600' },
    banner: { width: '100%', height: '90px', label: '728x90' },
  };

  const currentSize = sizes[size];

  const theme = darkMode ? {
    surface: 'bg-gray-900',
    textMuted: 'text-gray-500',
    border: 'border-gray-700',
  } : {
    surface: 'bg-slate-50',
    textMuted: 'text-gray-400',
    border: 'border-slate-200',
  };

  return (
    <div
      className={`${theme.surface} ${theme.border} border-4 border-dashed 
        flex flex-col items-center justify-center ad-placeholder`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
        minHeight: currentSize.height,
      }}
    >
      <span className={`font-pixel text-lg ${theme.textMuted} mb-2`}>📢</span>
      <span className={`font-pixel text-xs ${theme.textMuted}`}>REKLAM ALANI</span>
      <span className={`font-pixel text-xs ${theme.textMuted} mt-1`}>{currentSize.label}</span>
      
      {/* 
        REKLAM ENTEGRASYONU İÇİN:
        
        Google AdSense için:
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXX"
          data-ad-slot="XXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
        
        Veya kendi reklam networkunuz için img/iframe ekleyebilirsiniz.
      */}
    </div>
  );
}
