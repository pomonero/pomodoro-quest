'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

// Slot boyutları
const SLOT_SIZES = {
  header_banner: { width: 728, height: 90 },
  sidebar_square: { width: 300, height: 250 },
  sidebar_vertical: { width: 160, height: 600 },
  content_rectangle: { width: 336, height: 280 },
  footer_billboard: { width: 970, height: 250 },
  mobile_banner: { width: 320, height: 100 },
};

// Tek bir reklam slotu
export function AdSlot({ slotKey, className = '' }) {
  const { language } = useStore();
  const tr = language === 'tr';
  const [slot, setSlot] = useState(null);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Sadece bir kere yükle
    if (loaded) return;
    
    const loadSlot = () => {
      const saved = localStorage.getItem('pomonero_ad_slots');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed[slotKey]) {
            setSlot(parsed[slotKey]);
          }
        } catch {}
      }
      setLoaded(true);
    };
    
    loadSlot();
  }, [slotKey, loaded]);

  const size = SLOT_SIZES[slotKey] || { width: 300, height: 250 };

  // Yükleniyor
  if (!loaded) {
    return null;
  }

  // Slot yok veya devre dışı
  if (!slot || !slot.enabled) {
    return (
      <div 
        className={`card overflow-hidden flex items-center justify-center relative ${className}`}
        style={{ minHeight: Math.min(size.height, 150) }}
      >
        <div className="text-center p-4">
          <div className="text-2xl mb-1 opacity-50">📢</div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {size.width}x{size.height}
          </p>
        </div>
        <div className="absolute inset-0 border-2 border-dashed rounded-2xl opacity-10" style={{ borderColor: 'var(--primary)' }} />
      </div>
    );
  }

  // Kod tipi
  if (!slot.type || slot.type === 'code') {
    if (slot.code) {
      return (
        <div 
          className={`flex items-center justify-center ${className}`}
          dangerouslySetInnerHTML={{ __html: slot.code }}
        />
      );
    }
  }

  // Fotoğraf tipi
  if (slot.type === 'image' && slot.imageUrl) {
    const imgElement = (
      <img 
        src={slot.imageUrl} 
        alt={slot.altText || 'Ad'} 
        className="rounded-2xl object-cover"
        style={{ 
          width: '100%',
          maxWidth: size.width,
          height: 'auto',
          maxHeight: size.height
        }}
      />
    );
    
    if (slot.clickUrl) {
      return (
        <a 
          href={slot.clickUrl} 
          target="_blank" 
          rel="noopener noreferrer sponsored"
          className={`block ${className}`}
        >
          {imgElement}
        </a>
      );
    }
    return <div className={className}>{imgElement}</div>;
  }

  // Link tipi
  if (slot.type === 'link' && slot.linkUrl) {
    return (
      <a 
        href={slot.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`card p-4 flex items-center justify-center text-center hover:scale-[1.02] transition-all ${className}`}
        style={{ 
          background: slot.bgColor || 'var(--primary)',
          minHeight: Math.min(size.height, 80)
        }}
      >
        <span className="font-semibold text-white">
          {slot.linkText || 'Advertisement'}
        </span>
      </a>
    );
  }

  // Fallback
  return (
    <div 
      className={`card flex items-center justify-center ${className}`}
      style={{ minHeight: Math.min(size.height, 150) }}
    >
      <div className="text-center p-4">
        <div className="text-2xl mb-1 opacity-50">📢</div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{size.width}x{size.height}</p>
      </div>
    </div>
  );
}

// Eski uyumluluk için default export
export default function AdSpace({ size = 'mediumRectangle', className = '' }) {
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
