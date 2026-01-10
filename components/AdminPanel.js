'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

const DEFAULT_SETTINGS = {
  site: {
    name: 'Pomonero',
    title: 'Pomonero - Pomodoro Zamanlayıcı',
    description: 'Modern pomodoro zamanlayıcı uygulaması.',
    keywords: 'pomodoro, timer, odaklanma, verimlilik, TYT, AYT',
  },
  timer: {
    focusTime: 25,
    shortBreak: 5,
    longBreak: 30,
    tytTime: 120,
    aytTime: 165,
  },
  theme: {
    defaultTheme: 'midnight',
  },
  social: {
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    discord: '',
    email: 'aliiduurak@gmail.com',
  },
  footer: {
    copyright: '',
    showSocial: true,
    showLinks: true,
    showNewsletter: false,
    customText: '',
    madeIn: 'Türkiye\'de yapıldı',
  },
  seo: {
    googleAnalyticsId: '',
    googleAdsenseId: '',
  },
  ads: {
    header_banner: { enabled: false, type: 'code', code: '', imageUrl: '', clickUrl: '', altText: '', size: '728x90' },
    sidebar_square: { enabled: false, type: 'code', code: '', imageUrl: '', clickUrl: '', altText: '', size: '300x250' },
    sidebar_vertical: { enabled: false, type: 'code', code: '', imageUrl: '', clickUrl: '', altText: '', size: '160x600' },
    content_rectangle: { enabled: false, type: 'code', code: '', imageUrl: '', clickUrl: '', altText: '', size: '336x280' },
    footer_billboard: { enabled: false, type: 'code', code: '', imageUrl: '', clickUrl: '', altText: '', size: '970x250' },
    mobile_banner: { enabled: false, type: 'code', code: '', imageUrl: '', clickUrl: '', altText: '', size: '320x100' },
  },
  features: {
    enableGames: true,
    enableRadio: true,
    enableWeather: true,
    enableLeaderboard: true,
    enableCalendar: true,
    enableDailyInfo: true,
    enableStats: true,
  },
  security: {
    adminPassword: 'Aldrk273142.',
    sessionTimeout: 30,
  },
};

const TABS = [
  { id: 'site', icon: '🏠', label: 'Site' },
  { id: 'timer', icon: '⏱️', label: 'Timer' },
  { id: 'ads', icon: '📢', label: 'Reklamlar' },
  { id: 'footer', icon: '📋', label: 'Footer' },
  { id: 'social', icon: '🔗', label: 'Sosyal' },
  { id: 'features', icon: '⚙️', label: 'Özellikler' },
  { id: 'seo', icon: '🔍', label: 'SEO' },
  { id: 'security', icon: '🔐', label: 'Güvenlik' },
];

export default function AdminPanel() {
  const { language } = useStore();
  const tr = language === 'tr';
  
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('site');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pomonero_admin_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch {}
    }
    
    const session = sessionStorage.getItem('pomonero_admin_session');
    if (session) {
      const { expires } = JSON.parse(session);
      if (new Date(expires) > new Date()) setIsAuth(true);
    }
  }, []);

  const updateSetting = (cat, key, value) => {
    setSettings(prev => ({
      ...prev,
      [cat]: { ...prev[cat], [key]: value }
    }));
    setHasChanges(true);
  };

  const updateAdSlot = (slotKey, field, value) => {
    setSettings(prev => ({
      ...prev,
      ads: {
        ...prev.ads,
        [slotKey]: { ...prev.ads[slotKey], [field]: value }
      }
    }));
    setHasChanges(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === settings.security.adminPassword) {
      setIsAuth(true);
      const expires = new Date(Date.now() + settings.security.sessionTimeout * 60 * 1000);
      sessionStorage.setItem('pomonero_admin_session', JSON.stringify({ expires }));
    } else {
      setMessage({ type: 'error', text: 'Yanlış şifre!' });
    }
  };

  const saveSettings = () => {
    localStorage.setItem('pomonero_admin_settings', JSON.stringify(settings));
    localStorage.setItem('pomonero_ad_slots', JSON.stringify(settings.ads));
    setHasChanges(false);
    setMessage({ type: 'success', text: '✅ Kaydedildi!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomonero-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importSettings = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result);
        setSettings({ ...DEFAULT_SETTINGS, ...imported });
        setHasChanges(true);
        setMessage({ type: 'success', text: '✅ İçe aktarıldı!' });
      } catch {
        setMessage({ type: 'error', text: '❌ Geçersiz dosya!' });
      }
    };
    reader.readAsText(file);
  };

  const Input = ({ label, value, onChange, type = 'text', placeholder = '', help = '' }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl outline-none"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
      />
      {help && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{help}</p>}
    </div>
  );

  const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <span style={{ color: 'var(--text)' }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-all ${checked ? 'bg-green-500' : 'bg-gray-500'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  // Login
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
        <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="text-center mb-6">
            <span className="text-5xl">🔐</span>
            <h1 className="text-2xl font-bold mt-2" style={{ color: 'var(--text)' }}>Admin Panel</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              className="w-full p-3 rounded-xl outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            {message.text && <p className="text-red-400 text-sm text-center">{message.text}</p>}
            <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white" style={{ background: 'var(--primary)' }}>
              Giriş
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 p-4 border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Pomonero Admin</h1>
            {hasChanges && <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Kaydedilmemiş</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={saveSettings} disabled={!hasChanges} className="px-4 py-2 rounded-xl font-medium text-white disabled:opacity-50" style={{ background: hasChanges ? 'var(--primary)' : 'gray' }}>
              💾 Kaydet
            </button>
            <button onClick={() => { sessionStorage.removeItem('pomonero_admin_session'); setIsAuth(false); }} className="px-4 py-2 rounded-xl" style={{ color: 'var(--text)' }}>
              🚪 Çıkış
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 flex gap-4">
        {/* Sidebar */}
        <div className="w-48 shrink-0 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-left transition-all`}
              style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text)'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <div className="pt-4 space-y-1">
            <button onClick={exportSettings} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--text-muted)' }}>📤 Dışa Aktar</button>
            <label className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}>
              📥 İçe Aktar
              <input type="file" accept=".json" onChange={importSettings} className="hidden" />
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          
          {/* SITE */}
          {activeTab === 'site' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>🏠 Site Ayarları</h2>
              <Input label="Site Adı" value={settings.site.name} onChange={(v) => updateSetting('site', 'name', v)} />
              <Input label="Sayfa Başlığı" value={settings.site.title} onChange={(v) => updateSetting('site', 'title', v)} />
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Açıklama</label>
                <textarea
                  value={settings.site.description || ''}
                  onChange={(e) => updateSetting('site', 'description', e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl outline-none resize-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
              <Input label="Anahtar Kelimeler" value={settings.site.keywords} onChange={(v) => updateSetting('site', 'keywords', v)} help="Virgülle ayırın" />
            </div>
          )}

          {/* TIMER */}
          {activeTab === 'timer' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>⏱️ Zamanlayıcı</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Odaklanma (dk)" type="number" value={settings.timer.focusTime} onChange={(v) => updateSetting('timer', 'focusTime', parseInt(v))} />
                <Input label="Kısa Mola (dk)" type="number" value={settings.timer.shortBreak} onChange={(v) => updateSetting('timer', 'shortBreak', parseInt(v))} />
                <Input label="Uzun Mola (dk)" type="number" value={settings.timer.longBreak} onChange={(v) => updateSetting('timer', 'longBreak', parseInt(v))} />
                <Input label="TYT (dk)" type="number" value={settings.timer.tytTime} onChange={(v) => updateSetting('timer', 'tytTime', parseInt(v))} />
                <Input label="AYT (dk)" type="number" value={settings.timer.aytTime} onChange={(v) => updateSetting('timer', 'aytTime', parseInt(v))} />
              </div>
            </div>
          )}

          {/* ADS */}
          {activeTab === 'ads' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>📢 Reklam Yönetimi</h2>
              <Input label="Google AdSense ID" value={settings.seo.googleAdsenseId} onChange={(v) => updateSetting('seo', 'googleAdsenseId', v)} placeholder="ca-pub-XXXXXXXX" />
              
              <h3 className="font-bold mt-6 mb-4" style={{ color: 'var(--text)' }}>Reklam Slotları</h3>
              
              <div className="space-y-4">
                {Object.entries(settings.ads).map(([key, slot]) => (
                  <div key={key} className="p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold capitalize" style={{ color: 'var(--text)' }}>{key.replace(/_/g, ' ')}</h4>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{slot.size}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={slot.type || 'code'}
                          onChange={(e) => updateAdSlot(key, 'type', e.target.value)}
                          className="p-2 rounded-lg text-sm outline-none"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        >
                          <option value="code">Kod</option>
                          <option value="image">Fotoğraf</option>
                          <option value="link">Link</option>
                        </select>
                        <button
                          onClick={() => updateAdSlot(key, 'enabled', !slot.enabled)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${slot.enabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                        >
                          {slot.enabled ? '✓ Aktif' : '✕ Kapalı'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Kod */}
                    {(!slot.type || slot.type === 'code') && (
                      <textarea
                        value={slot.code || ''}
                        onChange={(e) => updateAdSlot(key, 'code', e.target.value)}
                        placeholder="HTML/JS kodunu yapıştırın..."
                        rows={3}
                        className="w-full p-2 rounded-lg text-xs font-mono resize-none outline-none"
                        style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      />
                    )}
                    
                    {/* Fotoğraf */}
                    {slot.type === 'image' && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text)' }}>📷 Fotoğraf Yükle</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                updateAdSlot(key, 'imageUrl', event.target?.result);
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="w-full p-2 rounded-lg text-sm"
                            style={{ background: 'var(--background)', color: 'var(--text)' }}
                          />
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Önerilen: {slot.size} px</p>
                        </div>
                        <input
                          type="text"
                          value={slot.imageUrl?.startsWith('data:') ? '' : (slot.imageUrl || '')}
                          onChange={(e) => updateAdSlot(key, 'imageUrl', e.target.value)}
                          placeholder="veya URL yapıştırın"
                          className="w-full p-2 rounded-lg text-sm outline-none"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        />
                        <input
                          type="text"
                          value={slot.clickUrl || ''}
                          onChange={(e) => updateAdSlot(key, 'clickUrl', e.target.value)}
                          placeholder="Tıklama linki"
                          className="w-full p-2 rounded-lg text-sm outline-none"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        />
                        {slot.imageUrl && (
                          <div className="flex items-center gap-2">
                            <img src={slot.imageUrl} alt="Preview" className="h-16 rounded" />
                            <button onClick={() => updateAdSlot(key, 'imageUrl', '')} className="text-xs text-red-400">🗑️ Sil</button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Link */}
                    {slot.type === 'link' && (
                      <div className="space-y-2">
                        <input type="text" value={slot.linkText || ''} onChange={(e) => updateAdSlot(key, 'linkText', e.target.value)} placeholder="Link metni" className="w-full p-2 rounded-lg text-sm outline-none" style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        <input type="text" value={slot.linkUrl || ''} onChange={(e) => updateAdSlot(key, 'linkUrl', e.target.value)} placeholder="Link URL" className="w-full p-2 rounded-lg text-sm outline-none" style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        <input type="color" value={slot.bgColor || '#6366f1'} onChange={(e) => updateAdSlot(key, 'bgColor', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER */}
          {activeTab === 'footer' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>📋 Footer Ayarları</h2>
              <Input label="Telif Hakkı Metni" value={settings.footer.copyright} onChange={(v) => updateSetting('footer', 'copyright', v)} placeholder="© 2026 Pomonero. Tüm hakları saklıdır." />
              <Input label="Özel Metin" value={settings.footer.customText} onChange={(v) => updateSetting('footer', 'customText', v)} placeholder="Ekstra bilgi veya slogan" />
              <Input label="Yapıldığı Yer" value={settings.footer.madeIn} onChange={(v) => updateSetting('footer', 'madeIn', v)} placeholder="Türkiye'de yapıldı" />
              <div className="mt-4 space-y-2">
                <Toggle label="Hızlı Linkleri Göster" checked={settings.footer.showLinks} onChange={(v) => updateSetting('footer', 'showLinks', v)} />
                <Toggle label="Sosyal Medya İkonlarını Göster" checked={settings.footer.showSocial} onChange={(v) => updateSetting('footer', 'showSocial', v)} />
                <Toggle label="Newsletter Formu Göster" checked={settings.footer.showNewsletter} onChange={(v) => updateSetting('footer', 'showNewsletter', v)} />
              </div>
            </div>
          )}

          {/* SOCIAL */}
          {activeTab === 'social' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>🔗 Sosyal Medya</h2>
              <Input label="Instagram" value={settings.social.instagram} onChange={(v) => updateSetting('social', 'instagram', v)} placeholder="https://instagram.com/..." />
              <Input label="Twitter / X" value={settings.social.twitter} onChange={(v) => updateSetting('social', 'twitter', v)} placeholder="https://twitter.com/..." />
              <Input label="YouTube" value={settings.social.youtube} onChange={(v) => updateSetting('social', 'youtube', v)} placeholder="https://youtube.com/..." />
              <Input label="TikTok" value={settings.social.tiktok} onChange={(v) => updateSetting('social', 'tiktok', v)} placeholder="https://tiktok.com/..." />
              <Input label="Discord" value={settings.social.discord} onChange={(v) => updateSetting('social', 'discord', v)} placeholder="https://discord.gg/..." />
              <Input label="E-posta" value={settings.social.email} onChange={(v) => updateSetting('social', 'email', v)} placeholder="info@pomonero.com" />
            </div>
          )}

          {/* FEATURES */}
          {activeTab === 'features' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>⚙️ Özellikler</h2>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Sitede gösterilecek özellikleri seçin</p>
              <div className="space-y-2">
                <Toggle label="🎮 Oyunlar" checked={settings.features.enableGames} onChange={(v) => updateSetting('features', 'enableGames', v)} />
                <Toggle label="📻 Radyo" checked={settings.features.enableRadio} onChange={(v) => updateSetting('features', 'enableRadio', v)} />
                <Toggle label="🌤️ Hava Durumu" checked={settings.features.enableWeather} onChange={(v) => updateSetting('features', 'enableWeather', v)} />
                <Toggle label="🏆 Liderlik Tablosu" checked={settings.features.enableLeaderboard} onChange={(v) => updateSetting('features', 'enableLeaderboard', v)} />
                <Toggle label="📅 Takvim" checked={settings.features.enableCalendar} onChange={(v) => updateSetting('features', 'enableCalendar', v)} />
                <Toggle label="📰 Günün Bilgisi" checked={settings.features.enableDailyInfo} onChange={(v) => updateSetting('features', 'enableDailyInfo', v)} />
                <Toggle label="📊 İstatistikler" checked={settings.features.enableStats} onChange={(v) => updateSetting('features', 'enableStats', v)} />
              </div>
            </div>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>🔍 SEO</h2>
              <Input label="Google Analytics ID" value={settings.seo.googleAnalyticsId} onChange={(v) => updateSetting('seo', 'googleAnalyticsId', v)} placeholder="G-XXXXXXXXXX" />
              <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>📋 SEO Durumu</h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <li>✅ robots.txt aktif</li>
                  <li>✅ sitemap.xml aktif</li>
                  <li>✅ JSON-LD Schema aktif</li>
                  <li>✅ Open Graph aktif</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>🔐 Güvenlik</h2>
              <div className="p-4 rounded-xl mb-6 bg-yellow-500/20">
                <p className="text-sm text-yellow-400">⚠️ Dikkatli olun!</p>
              </div>
              <Input label="Admin Şifresi" type="password" value={settings.security.adminPassword} onChange={(v) => updateSetting('security', 'adminPassword', v)} />
              <Input label="Oturum Süresi (dk)" type="number" value={settings.security.sessionTimeout} onChange={(v) => updateSetting('security', 'sessionTimeout', parseInt(v))} />
            </div>
          )}

          {message.text && (
            <div className={`mt-6 p-3 rounded-xl text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
