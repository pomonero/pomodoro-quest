'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

// Slot boyutları
const SLOT_SIZES = {
  header_banner: { width: 728, height: 90, mobileWidth: 320, mobileHeight: 50 },
  sidebar_square: { width: 300, height: 250 },
  sidebar_vertical: { width: 160, height: 600 },
  content_rectangle: { width: 336, height: 280 },
  footer_billboard: { width: 970, height: 250, mobileWidth: 320, mobileHeight: 100 },
  mobile_banner: { width: 320, height: 100 },
};

// Reklam bileşeni - slot key ile çalışır
export function AdSlot({ slotKey, className = '' }) {
  const { language } = useStore();
  const tr = language === 'tr';
  const [adCode, setAdCode] = useState('');
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    const slots = localStorage.getItem('pomonero_ad_slots');
    if (slots) {
      try {
        const parsed = JSON.parse(slots);
        if (parsed[slotKey]) {
          setEnabled(parsed[slotKey].enabled);
          setAdCode(parsed[slotKey].code);
        }
      } catch {}
    }
  }, [slotKey]);

  const size = SLOT_SIZES[slotKey] || { width: 300, height: 250 };

  // Reklam kodu varsa göster
  if (enabled && adCode) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        dangerouslySetInnerHTML={{ __html: adCode }}
      />
    );
  }

  // Placeholder göster
  return (
    <div 
      className={`card overflow-hidden flex items-center justify-center relative ${className}`}
      style={{ minHeight: Math.min(size.height, 300) }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-20 h-20 bg-[var(--primary)] rounded-full blur-3xl -top-10 -left-10 animate-pulse" />
        <div className="absolute w-20 h-20 bg-[var(--secondary)] rounded-full blur-3xl -bottom-10 -right-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="text-center p-4 relative z-10">
        <div className="text-3xl mb-2">📢</div>
        <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
          {tr ? 'Reklam Alanı' : 'Ad Space'}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {size.width} x {size.height}
        </p>
      </div>
      <div className="absolute inset-0 border-2 border-dashed rounded-2xl opacity-20" style={{ borderColor: 'var(--primary)' }} />
    </div>
  );
}

// Eski uyumluluk için default export
export default function AdSpace({ size = 'mediumRectangle', className = '' }) {
  // Size'a göre slot key belirle
  const slotMap = {
    leaderboard: 'header_banner',
    banner: 'header_banner',
    square: 'sidebar_square',
    mediumRectangle: 'sidebar_square',
    largeRectangle: 'content_rectangle',
    skyscraper: 'sidebar_vertical',
    wideSkyscraper: 'sidebar_vertical',
    halfPage: 'sidebar_vertical',
    billboard: 'footer_billboard',
    mobileBanner: 'mobile_banner',
    largeBanner: 'mobile_banner',
  };

  return <AdSlot slotKey={slotMap[size] || 'sidebar_square'} className={className} />;
}

// Yatay Banner
export function HorizontalAd({ className = '' }) {
  return <AdSlot slotKey="header_banner" className={className} />;
}

// Dikey Skyscraper
export function VerticalAd({ className = '' }) {
  return <AdSlot slotKey="sidebar_vertical" className={className} />;
}

// Billboard
export function BillboardAd({ className = '' }) {
  return <AdSlot slotKey="footer_billboard" className={className} />;
}

// İçerik Reklamı
export function ContentAd({ className = '' }) {
  return <AdSlot slotKey="content_rectangle" className={className} />;
}

// Mobil Banner
export function MobileAd({ className = '' }) {
  return <AdSlot slotKey="mobile_banner" className={className} />;
}
