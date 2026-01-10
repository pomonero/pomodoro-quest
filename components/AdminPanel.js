'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

// Varsayılan reklam slotları
const DEFAULT_AD_SLOTS = {
  header_banner: { enabled: false, code: '', size: '728x90', name: 'Header Banner (Leaderboard)' },
  sidebar_square: { enabled: false, code: '', size: '300x250', name: 'Sidebar Kare' },
  sidebar_vertical: { enabled: false, code: '', size: '160x600', name: 'Sidebar Dikey (Skyscraper)' },
  content_rectangle: { enabled: false, code: '', size: '336x280', name: 'İçerik Dikdörtgen' },
  footer_billboard: { enabled: false, code: '', size: '970x250', name: 'Footer Billboard' },
  mobile_banner: { enabled: false, code: '', size: '320x100', name: 'Mobil Banner' },
};

// Admin şifresi (production'da env variable olmalı)
const ADMIN_PASSWORD = 'pomonero2024';

export default function AdminPanel() {
  const { language } = useStore();
  const tr = language === 'tr';
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adSlots, setAdSlots] = useState(DEFAULT_AD_SLOTS);
  const [adsenseId, setAdsenseId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('slots');

  // Kayıtlı ayarları yükle
  useEffect(() => {
    const savedSlots = localStorage.getItem('pomonero_ad_slots');
    const savedAdsenseId = localStorage.getItem('pomonero_adsense_id');
    
    if (savedSlots) {
      try {
        setAdSlots({ ...DEFAULT_AD_SLOTS, ...JSON.parse(savedSlots) });
      } catch {}
    }
    if (savedAdsenseId) {
      setAdsenseId(savedAdsenseId);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setMessage({ type: '', text: '' });
    } else {
      setMessage({ type: 'error', text: tr ? 'Yanlış şifre!' : 'Wrong password!' });
    }
  };

  const updateSlot = (slotKey, field, value) => {
    setAdSlots(prev => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], [field]: value }
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('pomonero_ad_slots', JSON.stringify(adSlots));
    localStorage.setItem('pomonero_adsense_id', adsenseId);
    setMessage({ type: 'success', text: tr ? '✅ Ayarlar kaydedildi!' : '✅ Settings saved!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const exportSettings = () => {
    const settings = {
      adsenseId,
      adSlots,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pomonero-ad-settings.json';
    a.click();
  };

  const importSettings = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const settings = JSON.parse(event.target?.result);
        if (settings.adSlots) setAdSlots({ ...DEFAULT_AD_SLOTS, ...settings.adSlots });
        if (settings.adsenseId) setAdsenseId(settings.adsenseId);
        saveSettings();
        setMessage({ type: 'success', text: tr ? '✅ Ayarlar içe aktarıldı!' : '✅ Settings imported!' });
      } catch {
        setMessage({ type: 'error', text: tr ? '❌ Geçersiz dosya!' : '❌ Invalid file!' });
      }
    };
    reader.readAsText(file);
  };

  // Login ekranı
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
        <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h1 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--text)' }}>
            🔐 Admin Panel
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tr ? 'Admin şifresi' : 'Admin password'}
              className="w-full p-3 rounded-xl outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            {message.text && (
              <p className="text-red-400 text-sm">{message.text}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white"
              style={{ background: 'var(--primary)' }}
            >
              {tr ? 'Giriş Yap' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text)' }}>
            <span>⚙️</span> {tr ? 'Reklam Yönetimi' : 'Ad Management'}
          </h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 rounded-xl text-sm"
            style={{ background: 'var(--surface)', color: 'var(--text)' }}
          >
            {tr ? 'Çıkış' : 'Logout'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'slots', icon: '📢', label: tr ? 'Reklam Slotları' : 'Ad Slots' },
            { id: 'adsense', icon: '📊', label: 'Google AdSense' },
            { id: 'guide', icon: '📖', label: tr ? 'Rehber' : 'Guide' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface)',
                color: activeTab === tab.id ? 'white' : 'var(--text)'
              }}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          
          {/* AD SLOTS */}
          {activeTab === 'slots' && (
            <div className="space-y-6">
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                {tr 
                  ? 'Her slot için Google AdSense veya başka reklam kodunu yapıştırın.'
                  : 'Paste your Google AdSense or other ad code for each slot.'
                }
              </p>

              {Object.entries(adSlots).map(([key, slot]) => (
                <div key={key} className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{slot.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{slot.size}</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot.enabled}
                        onChange={(e) => updateSlot(key, 'enabled', e.target.checked)}
                        className="w-5 h-5 rounded accent-[var(--primary)]"
                      />
                      <span className="text-sm" style={{ color: 'var(--text)' }}>
                        {slot.enabled ? (tr ? 'Aktif' : 'Active') : (tr ? 'Kapalı' : 'Off')}
                      </span>
                    </label>
                  </div>
                  <textarea
                    value={slot.code}
                    onChange={(e) => updateSlot(key, 'code', e.target.value)}
                    placeholder={tr ? 'Reklam kodunu buraya yapıştırın...' : 'Paste ad code here...'}
                    className="w-full p-3 rounded-lg text-sm font-mono h-24 resize-none outline-none"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ADSENSE */}
          {activeTab === 'adsense' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  Google AdSense Publisher ID
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  {tr 
                    ? 'AdSense hesabınızdan Publisher ID\'nizi girin (ca-pub-XXXXXXXXXXXXXXXX)'
                    : 'Enter your Publisher ID from AdSense (ca-pub-XXXXXXXXXXXXXXXX)'
                  }
                </p>
                <input
                  type="text"
                  value={adsenseId}
                  onChange={(e) => setAdsenseId(e.target.value)}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full p-3 rounded-xl font-mono outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  {tr ? 'Otomatik AdSense Kodu' : 'Auto AdSense Code'}
                </h4>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  {tr 
                    ? 'Bu kodu sitenizin <head> kısmına ekleyin (layout.js)'
                    : 'Add this code to your site\'s <head> section (layout.js)'
                  }
                </p>
                <pre className="p-3 rounded-lg text-xs overflow-x-auto" style={{ background: 'var(--background)', color: 'var(--text)' }}>
{`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId || 'ca-pub-XXXXXXXXXXXXXXXX'}"
  crossorigin="anonymous"></script>`}
                </pre>
              </div>
            </div>
          )}

          {/* GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6 text-sm" style={{ color: 'var(--text)' }}>
              <div>
                <h3 className="font-bold text-lg mb-3">📌 {tr ? 'Reklam Ekleme Rehberi' : 'Ad Setup Guide'}</h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                    <h4 className="font-semibold mb-2">1. Google AdSense {tr ? 'Hesabı Oluştur' : 'Account'}</h4>
                    <p style={{ color: 'var(--text-muted)' }}>
                      {tr 
                        ? 'adsense.google.com adresinden hesap oluşturun ve sitenizi ekleyin.'
                        : 'Create an account at adsense.google.com and add your site.'
                      }
                    </p>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                    <h4 className="font-semibold mb-2">2. {tr ? 'Reklam Birimi Oluştur' : 'Create Ad Unit'}</h4>
                    <p style={{ color: 'var(--text-muted)' }}>
                      {tr 
                        ? 'AdSense panelinden "Reklamlar" > "Reklam Birimleri" > "Yeni reklam birimi" seçin.'
                        : 'In AdSense, go to "Ads" > "Ad units" > "Create new ad unit".'
                      }
                    </p>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                    <h4 className="font-semibold mb-2">3. {tr ? 'Kodu Kopyala' : 'Copy Code'}</h4>
                    <p style={{ color: 'var(--text-muted)' }}>
                      {tr 
                        ? 'Oluşturulan reklam kodunu ilgili slot\'a yapıştırın.'
                        : 'Copy the generated ad code and paste it into the relevant slot.'
                      }
                    </p>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                    <h4 className="font-semibold mb-2">4. {tr ? 'Slot Boyutları' : 'Slot Sizes'}</h4>
                    <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
                      <li>• <strong>728x90</strong> - Leaderboard (Header)</li>
                      <li>• <strong>300x250</strong> - Medium Rectangle (Sidebar)</li>
                      <li>• <strong>336x280</strong> - Large Rectangle</li>
                      <li>• <strong>160x600</strong> - Wide Skyscraper</li>
                      <li>• <strong>970x250</strong> - Billboard</li>
                      <li>• <strong>320x100</strong> - Large Mobile Banner</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--primary)' }}>
                <h4 className="font-semibold mb-2">💡 {tr ? 'İpucu' : 'Tip'}</h4>
                <p style={{ color: 'var(--text-muted)' }}>
                  {tr 
                    ? 'Ayarlarınızı yedeklemek için "Dışa Aktar" butonunu kullanın. Başka bir cihazda veya yeniden kurulumda "İçe Aktar" ile geri yükleyebilirsiniz.'
                    : 'Use "Export" to backup your settings. You can restore them using "Import" on another device or after reinstall.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Message */}
          {message.text && (
            <div className={`mt-6 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={saveSettings}
              className="flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-white"
              style={{ background: 'var(--primary)' }}
            >
              💾 {tr ? 'Kaydet' : 'Save'}
            </button>
            <button
              onClick={exportSettings}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
              style={{ background: 'var(--surface)', color: 'var(--text)' }}
            >
              📤 {tr ? 'Dışa Aktar' : 'Export'}
            </button>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium cursor-pointer" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
              📥 {tr ? 'İçe Aktar' : 'Import'}
              <input type="file" accept=".json" onChange={importSettings} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
