'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function Footer() {
  const { language, setCurrentPage } = useStore();
  const tr = language === 'tr';
  const year = new Date().getFullYear();
  
  // Footer ayarları localStorage'dan
  const [footerSettings, setFooterSettings] = useState({
    showLinks: true,
    showSocial: true,
    showNewsletter: false,
    copyright: `© ${year} Pomonero. ${tr ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}`,
    customText: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    discord: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('pomonero_admin_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.footer) {
          setFooterSettings(prev => ({ ...prev, ...parsed.footer }));
        }
        if (parsed.social) {
          setFooterSettings(prev => ({ ...prev, ...parsed.social }));
        }
      } catch {}
    }
  }, []);

  const links = [
    { key: 'about', label: tr ? 'Hakkımızda' : 'About', icon: '📖' },
    { key: 'pomodoro', label: tr ? 'Pomodoro Nedir?' : 'What is Pomodoro?', icon: '🍅' },
    { key: 'support', label: tr ? 'Destek' : 'Support', icon: '💬' },
    { key: 'contact', label: tr ? 'İletişim' : 'Contact', icon: '✉️' },
    { key: 'privacy', label: tr ? 'Gizlilik' : 'Privacy', icon: '🔒' },
  ];

  const socialLinks = [
    { key: 'instagram', icon: '📸', label: 'Instagram' },
    { key: 'twitter', icon: '🐦', label: 'Twitter' },
    { key: 'youtube', icon: '📺', label: 'YouTube' },
    { key: 'tiktok', icon: '🎵', label: 'TikTok' },
    { key: 'discord', icon: '💬', label: 'Discord' },
  ].filter(s => footerSettings[s.key]);

  return (
    <footer className="mt-12 border-t" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo ve Açıklama */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">🍅</span>
              <span className="text-xl font-bold" style={{ color: 'var(--text)' }}>Pomonero</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {tr 
                ? 'Modern pomodoro tekniği ile odaklanın, verimli çalışın ve hedeflerinize ulaşın.' 
                : 'Focus, work efficiently, and reach your goals with modern pomodoro technique.'
              }
            </p>
            {footerSettings.customText && (
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{footerSettings.customText}</p>
            )}
          </div>

          {/* Hızlı Linkler */}
          {footerSettings.showLinks && (
            <div>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
                {tr ? 'Hızlı Linkler' : 'Quick Links'}
              </h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.key}>
                    <button
                      onClick={() => setCurrentPage(link.key)}
                      className="text-sm flex items-center gap-2 hover:underline transition-all"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sosyal Medya */}
          {footerSettings.showSocial && socialLinks.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
                {tr ? 'Bizi Takip Edin' : 'Follow Us'}
              </h4>
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map(social => (
                  <a
                    key={social.key}
                    href={footerSettings[social.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110"
                    style={{ background: 'var(--surface)' }}
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Alt Kısım */}
        <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {footerSettings.copyright || `© ${year} Pomonero`}
          </p>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>🇹🇷 {tr ? 'Türkiye\'de yapıldı' : 'Made in Turkey'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
