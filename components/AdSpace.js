'use client';

import { useStore } from '@/lib/store';

// Standart reklam boyutları
const AD_SIZES = {
  // Yatay
  leaderboard: { width: 728, height: 90, name: 'Leaderboard' },
  banner: { width: 468, height: 60, name: 'Banner' },
  mobileBanner: { width: 320, height: 50, name: 'Mobile Banner' },
  largeBanner: { width: 320, height: 100, name: 'Large Mobile Banner' },
  
  // Kare
  square: { width: 250, height: 250, name: 'Square' },
  smallSquare: { width: 200, height: 200, name: 'Small Square' },
  
  // Dikdörtgen
  mediumRectangle: { width: 300, height: 250, name: 'Medium Rectangle' },
  largeRectangle: { width: 336, height: 280, name: 'Large Rectangle' },
  
  // Dikey
  skyscraper: { width: 120, height: 600, name: 'Skyscraper' },
  wideSkyscraper: { width: 160, height: 600, name: 'Wide Skyscraper' },
  halfPage: { width: 300, height: 600, name: 'Half Page' },
  
  // Özel
  billboard: { width: 970, height: 250, name: 'Billboard' },
  portrait: { width: 300, height: 1050, name: 'Portrait' },
};

export default function AdSpace({ size = 'mediumRectangle', className = '' }) {
  const { language } = useStore();
  const tr = language === 'tr';
  
  const adSize = AD_SIZES[size] || AD_SIZES.mediumRectangle;
  
  return (
    <div 
      className={`card overflow-hidden flex items-center justify-center relative group ${className}`}
      style={{ 
        minHeight: Math.min(adSize.height, 300),
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--card) 100%)',
      }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-20 h-20 bg-[var(--primary)] rounded-full blur-3xl -top-10 -left-10 animate-pulse" />
        <div className="absolute w-20 h-20 bg-[var(--secondary)] rounded-full blur-3xl -bottom-10 -right-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Content */}
      <div className="text-center p-4 relative z-10">
        <div className="text-4xl mb-2 animate-bounce" style={{ animationDuration: '2s' }}>📢</div>
        <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
          {tr ? 'Reklam Alanı' : 'Ad Space'}
        </p>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          {adSize.width} x {adSize.height}
        </p>
        <p className="text-xs px-3 py-1 rounded-full inline-block" style={{ background: 'var(--primary)', color: 'white' }}>
          {adSize.name}
        </p>
      </div>
      
      {/* Border Animation */}
      <div className="absolute inset-0 border-2 border-dashed rounded-2xl opacity-30 group-hover:opacity-60 transition-opacity" style={{ borderColor: 'var(--primary)' }} />
    </div>
  );
}

// Yatay Banner
export function HorizontalAd({ className = '' }) {
  const { language } = useStore();
  const tr = language === 'tr';
  
  return (
    <div className={`card p-4 flex items-center justify-center relative overflow-hidden ${className}`} style={{ minHeight: 90 }}>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute w-full h-full bg-gradient-to-r from-[var(--primary)] via-transparent to-[var(--secondary)]" />
      </div>
      <div className="text-center relative z-10 flex items-center gap-4">
        <span className="text-3xl">📢</span>
        <div>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>{tr ? 'Reklam Alanı' : 'Ad Space'}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>728 x 90 - Leaderboard</p>
        </div>
      </div>
    </div>
  );
}

// Dikey Skyscraper
export function VerticalAd({ className = '' }) {
  const { language } = useStore();
  const tr = language === 'tr';
  
  return (
    <div className={`card p-4 flex flex-col items-center justify-center relative overflow-hidden ${className}`} style={{ minHeight: 400 }}>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute w-full h-full bg-gradient-to-b from-[var(--primary)] via-transparent to-[var(--secondary)]" />
      </div>
      <div className="text-center relative z-10">
        <span className="text-5xl block mb-4">📢</span>
        <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{tr ? 'Reklam Alanı' : 'Ad Space'}</p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>160 x 600</p>
        <p className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--primary)', color: 'white' }}>
          Wide Skyscraper
        </p>
      </div>
    </div>
  );
}

// Büyük Billboard
export function BillboardAd({ className = '' }) {
  const { language } = useStore();
  const tr = language === 'tr';
  
  return (
    <div className={`card p-6 flex items-center justify-center relative overflow-hidden ${className}`} style={{ minHeight: 200 }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-40 h-40 bg-[var(--primary)] rounded-full blur-3xl -top-20 left-1/4 animate-pulse" />
        <div className="absolute w-40 h-40 bg-[var(--secondary)] rounded-full blur-3xl -bottom-20 right-1/4 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="text-center relative z-10">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-4xl">📢</span>
          <span className="text-4xl">🎯</span>
          <span className="text-4xl">📢</span>
        </div>
        <p className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>{tr ? 'Premium Reklam Alanı' : 'Premium Ad Space'}</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>970 x 250 - Billboard</p>
      </div>
    </div>
  );
}
