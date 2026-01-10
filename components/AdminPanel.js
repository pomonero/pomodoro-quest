'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

// Varsayılan site ayarları
const DEFAULT_SETTINGS = {
  // Site Genel
  site: {
    name: 'Pomonero',
    title: 'Pomonero - Pomodoro Zamanlayıcı',
    description: 'Modern pomodoro zamanlayıcı uygulaması. Odaklanın, verimli çalışın ve başarın.',
    keywords: 'pomodoro, timer, odaklanma, verimlilik, TYT, AYT',
    logo: '/logo-dark.png',
    favicon: '/favicon.png',
  },
  // Timer Varsayılanları
  timer: {
    focusTime: 25,
    shortBreak: 5,
    longBreak: 30,
    tytTime: 120,
    aytTime: 165,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    showSeconds: true,
  },
  // Tema Özelleştirme
  theme: {
    defaultTheme: 'midnight',
    allowUserThemeChange: true,
    customColors: {
      primary: '#6366f1',
      secondary: '#f472b6',
      accent: '#22d3ee',
    },
    font: 'Inter',
    timerFont: 'Orbitron',
  },
  // Sosyal Medya
  social: {
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    discord: '',
    email: 'aliiduurak@gmail.com',
  },
  // Footer
  footer: {
    copyright: '© 2026 Pomonero. Tüm hakları saklıdır.',
    showSocial: true,
    showLinks: true,
    customText: '',
  },
  // SEO
  seo: {
    googleAnalyticsId: '',
    googleAdsenseId: '',
    googleSearchConsoleCode: '',
    enableSitemap: true,
    enableRobots: true,
  },
  // Reklam Slotları
  ads: {
    header_banner: { enabled: false, code: '', size: '728x90' },
    sidebar_square: { enabled: false, code: '', size: '300x250' },
    sidebar_vertical: { enabled: false, code: '', size: '160x600' },
    content_rectangle: { enabled: false, code: '', size: '336x280' },
    footer_billboard: { enabled: false, code: '', size: '970x250' },
    mobile_banner: { enabled: false, code: '', size: '320x100' },
  },
  // Özellikler
  features: {
    enableGames: true,
    enableRadio: true,
    enableWeather: true,
    enableLeaderboard: true,
    enableCalendar: true,
    enableDailyInfo: true,
    enableStats: true,
  },
  // İletişim
  contact: {
    email: 'info@pomonero.com',
    phone: '',
    address: '',
    showContactForm: true,
  },
  // Güvenlik
  security: {
    adminPassword: 'Aldrk273142.',
    sessionTimeout: 30, // dakika
    maxLoginAttempts: 5,
  },
};

// Tab'lar
const TABS = [
  { id: 'site', icon: '🏠', label: 'Site', labelEn: 'Site' },
  { id: 'timer', icon: '⏱️', label: 'Zamanlayıcı', labelEn: 'Timer' },
  { id: 'theme', icon: '🎨', label: 'Tema', labelEn: 'Theme' },
  { id: 'ads', icon: '📢', label: 'Reklamlar', labelEn: 'Ads' },
  { id: 'features', icon: '⚙️', label: 'Özellikler', labelEn: 'Features' },
  { id: 'social', icon: '🔗', label: 'Sosyal', labelEn: 'Social' },
  { id: 'seo', icon: '🔍', label: 'SEO', labelEn: 'SEO' },
  { id: 'security', icon: '🔐', label: 'Güvenlik', labelEn: 'Security' },
];

export default function AdminPanel() {
  const { language } = useStore();
  const tr = language === 'tr';
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('site');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Ayarları yükle
  useEffect(() => {
    const saved = localStorage.getItem('pomonero_admin_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {}
    }
    
    // Session kontrolü
    const session = sessionStorage.getItem('pomonero_admin_session');
    if (session) {
      const { expires } = JSON.parse(session);
      if (new Date(expires) > new Date()) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Değişiklik takibi
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }));
    setHasChanges(true);
  };

  // Nested setting güncelle
  const updateNestedSetting = (category, subKey, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subKey]: { ...prev[category][subKey], [key]: value }
      }
    }));
    setHasChanges(true);
  };

  // Login
  const handleLogin = (e) => {
    e.preventDefault();
    
    if (loginAttempts >= settings.security.maxLoginAttempts) {
      setMessage({ type: 'error', text: tr ? 'Çok fazla deneme! 5 dakika bekleyin.' : 'Too many attempts! Wait 5 minutes.' });
      return;
    }
    
    if (password === settings.security.adminPassword) {
      setIsAuthenticated(true);
      const expires = new Date(Date.now() + settings.security.sessionTimeout * 60 * 1000);
      sessionStorage.setItem('pomonero_admin_session', JSON.stringify({ expires }));
      setMessage({ type: '', text: '' });
      setLoginAttempts(0);
    } else {
      setLoginAttempts(prev => prev + 1);
      setMessage({ type: 'error', text: tr ? `Yanlış şifre! (${settings.security.maxLoginAttempts - loginAttempts - 1} deneme kaldı)` : `Wrong password! (${settings.security.maxLoginAttempts - loginAttempts - 1} attempts left)` });
    }
  };

  // Kaydet
  const saveSettings = () => {
    localStorage.setItem('pomonero_admin_settings', JSON.stringify(settings));
    
    // Reklam ayarlarını ayrıca kaydet (AdSpace component için)
    localStorage.setItem('pomonero_ad_slots', JSON.stringify(settings.ads));
    
    setHasChanges(false);
    setLastSaved(new Date());
    setMessage({ type: 'success', text: tr ? '✅ Ayarlar kaydedildi!' : '✅ Settings saved!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Dışa aktar
  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomonero-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // İçe aktar
  const importSettings = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result);
        setSettings({ ...DEFAULT_SETTINGS, ...imported });
        setHasChanges(true);
        setMessage({ type: 'success', text: tr ? '✅ Ayarlar içe aktarıldı!' : '✅ Settings imported!' });
      } catch {
        setMessage({ type: 'error', text: tr ? '❌ Geçersiz dosya!' : '❌ Invalid file!' });
      }
    };
    reader.readAsText(file);
  };

  // Varsayılana sıfırla
  const resetToDefault = () => {
    if (confirm(tr ? 'Tüm ayarlar varsayılana sıfırlanacak. Emin misiniz?' : 'All settings will be reset to default. Are you sure?')) {
      setSettings(DEFAULT_SETTINGS);
      setHasChanges(true);
    }
  };

  // Çıkış
  const handleLogout = () => {
    sessionStorage.removeItem('pomonero_admin_session');
    setIsAuthenticated(false);
  };

  // Input component
  const Input = ({ label, value, onChange, type = 'text', placeholder = '', help = '' }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
      />
      {help && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{help}</p>}
    </div>
  );

  // Toggle component
  const Toggle = ({ label, checked, onChange, help = '' }) => (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <div>
        <span className="font-medium" style={{ color: 'var(--text)' }}>{label}</span>
        {help && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{help}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-all ${checked ? 'bg-green-500' : 'bg-gray-500'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  // Login ekranı
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
        <div className="w-full max-w-sm p-6 rounded-2xl animate-scale-in" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="text-center mb-6">
            <span className="text-5xl">🔐</span>
            <h1 className="text-2xl font-bold mt-2" style={{ color: 'var(--text)' }}>Admin Panel</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tr ? 'Admin şifresi' : 'Admin password'}
              className="w-full p-3 rounded-xl outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              autoFocus
            />
            {message.text && (
              <p className="text-red-400 text-sm text-center">{message.text}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
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
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 p-4 border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Pomonero Admin
            </h1>
            {hasChanges && (
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                {tr ? 'Kaydedilmemiş değişiklikler' : 'Unsaved changes'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="px-4 py-2 rounded-xl font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: hasChanges ? 'var(--primary)' : 'gray' }}
            >
              💾 {tr ? 'Kaydet' : 'Save'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl font-medium transition-all hover:bg-[var(--surface)]"
              style={{ color: 'var(--text)' }}
            >
              🚪 {tr ? 'Çıkış' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 flex gap-4">
        {/* Sidebar - Tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id ? 'font-semibold' : ''}`}
              style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text)'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tr ? tab.label : tab.labelEn}</span>
            </button>
          ))}
          
          <div className="pt-4 space-y-1">
            <button onClick={exportSettings} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm hover:bg-[var(--surface)]" style={{ color: 'var(--text-muted)' }}>
              📤 {tr ? 'Dışa Aktar' : 'Export'}
            </button>
            <label className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm hover:bg-[var(--surface)] cursor-pointer" style={{ color: 'var(--text-muted)' }}>
              📥 {tr ? 'İçe Aktar' : 'Import'}
              <input type="file" accept=".json" onChange={importSettings} className="hidden" />
            </label>
            <button onClick={resetToDefault} className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm hover:bg-red-500/20 text-red-400">
              🔄 {tr ? 'Sıfırla' : 'Reset'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          
          {/* SITE */}
          {activeTab === 'site' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>🏠 {tr ? 'Site Ayarları' : 'Site Settings'}</h2>
              <Input label={tr ? 'Site Adı' : 'Site Name'} value={settings.site.name} onChange={(v) => updateSetting('site', 'name', v)} />
              <Input label={tr ? 'Sayfa Başlığı' : 'Page Title'} value={settings.site.title} onChange={(v) => updateSetting('site', 'title', v)} />
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{tr ? 'Site Açıklaması' : 'Site Description'}</label>
                <textarea
                  value={settings.site.description}
                  onChange={(e) => updateSetting('site', 'description', e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl outline-none resize-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
              <Input label={tr ? 'Anahtar Kelimeler' : 'Keywords'} value={settings.site.keywords} onChange={(v) => updateSetting('site', 'keywords', v)} help={tr ? 'Virgülle ayırın' : 'Separate with commas'} />
              <Input label={tr ? 'Logo URL' : 'Logo URL'} value={settings.site.logo} onChange={(v) => updateSetting('site', 'logo', v)} />
              <Input label="Favicon URL" value={settings.site.favicon} onChange={(v) => updateSetting('site', 'favicon', v)} />
            </div>
          )}

          {/* TIMER */}
          {activeTab === 'timer' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>⏱️ {tr ? 'Zamanlayıcı Ayarları' : 'Timer Settings'}</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label={tr ? 'Odaklanma Süresi (dk)' : 'Focus Time (min)'} type="number" value={settings.timer.focusTime} onChange={(v) => updateSetting('timer', 'focusTime', parseInt(v))} />
                <Input label={tr ? 'Kısa Mola (dk)' : 'Short Break (min)'} type="number" value={settings.timer.shortBreak} onChange={(v) => updateSetting('timer', 'shortBreak', parseInt(v))} />
                <Input label={tr ? 'Uzun Mola (dk)' : 'Long Break (min)'} type="number" value={settings.timer.longBreak} onChange={(v) => updateSetting('timer', 'longBreak', parseInt(v))} />
                <Input label="TYT (dk/min)" type="number" value={settings.timer.tytTime} onChange={(v) => updateSetting('timer', 'tytTime', parseInt(v))} />
                <Input label="AYT (dk/min)" type="number" value={settings.timer.aytTime} onChange={(v) => updateSetting('timer', 'aytTime', parseInt(v))} />
              </div>
              <div className="mt-6 space-y-2">
                <Toggle label={tr ? 'Molaları otomatik başlat' : 'Auto-start breaks'} checked={settings.timer.autoStartBreaks} onChange={(v) => updateSetting('timer', 'autoStartBreaks', v)} />
                <Toggle label={tr ? 'Pomodoroları otomatik başlat' : 'Auto-start pomodoros'} checked={settings.timer.autoStartPomodoros} onChange={(v) => updateSetting('timer', 'autoStartPomodoros', v)} />
                <Toggle label={tr ? 'Saniyeleri göster' : 'Show seconds'} checked={settings.timer.showSeconds} onChange={(v) => updateSetting('timer', 'showSeconds', v)} />
              </div>
            </div>
          )}

          {/* THEME */}
          {activeTab === 'theme' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>🎨 {tr ? 'Tema Ayarları' : 'Theme Settings'}</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>{tr ? 'Varsayılan Tema' : 'Default Theme'}</label>
                <div className="grid grid-cols-4 gap-2">
                  {['midnight', 'ocean', 'forest', 'sunset', 'snow', 'sakura', 'mint', 'peach'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => updateSetting('theme', 'defaultTheme', theme)}
                      className={`p-3 rounded-xl capitalize text-sm ${settings.theme.defaultTheme === theme ? 'ring-2 ring-[var(--primary)]' : ''}`}
                      style={{ background: 'var(--surface)', color: 'var(--text)' }}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle label={tr ? 'Kullanıcı tema değiştirsin' : 'Allow user theme change'} checked={settings.theme.allowUserThemeChange} onChange={(v) => updateSetting('theme', 'allowUserThemeChange', v)} />
              <h3 className="font-semibold mt-6 mb-4" style={{ color: 'var(--text)' }}>{tr ? 'Özel Renkler' : 'Custom Colors'}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Primary</label>
                  <input type="color" value={settings.theme.customColors.primary} onChange={(e) => updateNestedSetting('theme', 'customColors', 'primary', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Secondary</label>
                  <input type="color" value={settings.theme.customColors.secondary} onChange={(e) => updateNestedSetting('theme', 'customColors', 'secondary', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Accent</label>
                  <input type="color" value={settings.theme.customColors.accent} onChange={(e) => updateNestedSetting('theme', 'customColors', 'accent', e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input label={tr ? 'Genel Font' : 'General Font'} value={settings.theme.font} onChange={(v) => updateSetting('theme', 'font', v)} help="Inter, Roboto, Poppins..." />
                <Input label={tr ? 'Timer Font' : 'Timer Font'} value={settings.theme.timerFont} onChange={(v) => updateSetting('theme', 'timerFont', v)} help="Orbitron, Digital-7..." />
              </div>
            </div>
          )}

          {/* ADS */}
          {activeTab === 'ads' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>📢 {tr ? 'Reklam Yönetimi' : 'Ad Management'}</h2>
              
              {/* Google AdSense Bölümü */}
              <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--surface)', border: '2px solid var(--primary)' }}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span>📊</span> Google AdSense
                </h3>
                <Input label="Publisher ID" value={settings.seo.googleAdsenseId} onChange={(v) => updateSetting('seo', 'googleAdsenseId', v)} placeholder="ca-pub-XXXXXXXXXXXXXXXX" help={tr ? 'AdSense hesabınızdan Publisher ID' : 'Publisher ID from your AdSense account'} />
                <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'var(--background)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{tr ? 'Head Kodu:' : 'Head Code:'}</p>
                  <code style={{ color: 'var(--text-muted)' }}>
                    {`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.seo.googleAdsenseId || 'ca-pub-XXX'}" crossorigin="anonymous"></script>`}
                  </code>
                </div>
              </div>

              {/* Reklam Slotları */}
              <h3 className="font-bold mb-4" style={{ color: 'var(--text)' }}>{tr ? '📍 Reklam Slotları' : '📍 Ad Slots'}</h3>
              
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
                          onChange={(e) => updateNestedSetting('ads', key, 'type', e.target.value)}
                          className="p-2 rounded-lg text-sm outline-none"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        >
                          <option value="code">{tr ? 'Kod' : 'Code'}</option>
                          <option value="image">{tr ? 'Fotoğraf' : 'Image'}</option>
                          <option value="link">{tr ? 'Link' : 'Link'}</option>
                        </select>
                        <button
                          onClick={() => updateNestedSetting('ads', key, 'enabled', !slot.enabled)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${slot.enabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                        >
                          {slot.enabled ? '✓' : '✕'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Kod Tipi */}
                    {(!slot.type || slot.type === 'code') && (
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{tr ? 'Reklam Kodu (AdSense, vb.)' : 'Ad Code (AdSense, etc.)'}</label>
                        <textarea
                          value={slot.code || ''}
                          onChange={(e) => updateNestedSetting('ads', key, 'code', e.target.value)}
                          placeholder={tr ? 'HTML/JavaScript kodunu yapıştırın...' : 'Paste HTML/JavaScript code...'}
                          rows={3}
                          className="w-full p-2 rounded-lg text-xs font-mono resize-none outline-none"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                        />
                      </div>
                    )}
                    
                    {/* Fotoğraf Tipi */}
                    {slot.type === 'image' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{tr ? 'Fotoğraf URL' : 'Image URL'}</label>
                          <input
                            type="text"
                            value={slot.imageUrl || ''}
                            onChange={(e) => updateNestedSetting('ads', key, 'imageUrl', e.target.value)}
                            placeholder="https://example.com/banner.jpg"
                            className="w-full p-2 rounded-lg text-sm outline-none"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{tr ? 'Tıklama Linki' : 'Click Link'}</label>
                          <input
                            type="text"
                            value={slot.clickUrl || ''}
                            onChange={(e) => updateNestedSetting('ads', key, 'clickUrl', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full p-2 rounded-lg text-sm outline-none"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{tr ? 'Alternatif Metin' : 'Alt Text'}</label>
                          <input
                            type="text"
                            value={slot.altText || ''}
                            onChange={(e) => updateNestedSetting('ads', key, 'altText', e.target.value)}
                            placeholder={tr ? 'Reklam açıklaması' : 'Ad description'}
                            className="w-full p-2 rounded-lg text-sm outline-none"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                          />
                        </div>
                        {slot.imageUrl && (
                          <div className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{tr ? 'Önizleme:' : 'Preview:'}</p>
                            <img src={slot.imageUrl} alt={slot.altText || 'Ad'} className="max-h-32 rounded" onError={(e) => e.target.style.display='none'} />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Link Tipi */}
                    {slot.type === 'link' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{tr ? 'Link Metni' : 'Link Text'}</label>
                          <input
                            type="text"
                            value={slot.linkText || ''}
                            onChange={(e) => updateNestedSetting('ads', key, 'linkText', e.target.value)}
                            placeholder={tr ? 'Reklam Metni' : 'Ad Text'}
                            className="w-full p-2 rounded-lg text-sm outline-none"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{tr ? 'Link URL' : 'Link URL'}</label>
                          <input
                            type="text"
                            value={slot.linkUrl || ''}
                            onChange={(e) => updateNestedSetting('ads', key, 'linkUrl', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full p-2 rounded-lg text-sm outline-none"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{tr ? 'Arka Plan Rengi' : 'Background Color'}</label>
                          <input
                            type="color"
                            value={slot.bgColor || '#6366f1'}
                            onChange={(e) => updateNestedSetting('ads', key, 'bgColor', e.target.value)}
                            className="w-full h-10 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Yardım */}
              <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>💡 {tr ? 'İpuçları' : 'Tips'}</h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <li>• <strong>Kod:</strong> {tr ? 'Google AdSense veya diğer reklam ağları için' : 'For Google AdSense or other ad networks'}</li>
                  <li>• <strong>{tr ? 'Fotoğraf' : 'Image'}:</strong> {tr ? 'Kendi banner\'ınızı yüklemek için' : 'To use your own banner image'}</li>
                  <li>• <strong>Link:</strong> {tr ? 'Basit metin reklam için' : 'For simple text advertisement'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* FEATURES */}
          {activeTab === 'features' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>⚙️ {tr ? 'Özellik Ayarları' : 'Feature Settings'}</h2>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>{tr ? 'Sitede gösterilecek özellikleri seçin' : 'Choose which features to show on the site'}</p>
              <div className="space-y-2">
                <Toggle label={tr ? '🎮 Oyunlar' : '🎮 Games'} checked={settings.features.enableGames} onChange={(v) => updateSetting('features', 'enableGames', v)} />
                <Toggle label={tr ? '📻 Radyo' : '📻 Radio'} checked={settings.features.enableRadio} onChange={(v) => updateSetting('features', 'enableRadio', v)} />
                <Toggle label={tr ? '🌤️ Hava Durumu' : '🌤️ Weather'} checked={settings.features.enableWeather} onChange={(v) => updateSetting('features', 'enableWeather', v)} />
                <Toggle label={tr ? '🏆 Liderlik Tablosu' : '🏆 Leaderboard'} checked={settings.features.enableLeaderboard} onChange={(v) => updateSetting('features', 'enableLeaderboard', v)} />
                <Toggle label={tr ? '📅 Takvim' : '📅 Calendar'} checked={settings.features.enableCalendar} onChange={(v) => updateSetting('features', 'enableCalendar', v)} />
                <Toggle label={tr ? '📰 Günün Bilgisi' : '📰 Daily Info'} checked={settings.features.enableDailyInfo} onChange={(v) => updateSetting('features', 'enableDailyInfo', v)} />
                <Toggle label={tr ? '📊 İstatistikler' : '📊 Statistics'} checked={settings.features.enableStats} onChange={(v) => updateSetting('features', 'enableStats', v)} />
              </div>
            </div>
          )}

          {/* SOCIAL */}
          {activeTab === 'social' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>🔗 {tr ? 'Sosyal Medya' : 'Social Media'}</h2>
              <Input label="Instagram" value={settings.social.instagram} onChange={(v) => updateSetting('social', 'instagram', v)} placeholder="https://instagram.com/..." />
              <Input label="Twitter / X" value={settings.social.twitter} onChange={(v) => updateSetting('social', 'twitter', v)} placeholder="https://twitter.com/..." />
              <Input label="YouTube" value={settings.social.youtube} onChange={(v) => updateSetting('social', 'youtube', v)} placeholder="https://youtube.com/..." />
              <Input label="TikTok" value={settings.social.tiktok} onChange={(v) => updateSetting('social', 'tiktok', v)} placeholder="https://tiktok.com/..." />
              <Input label="Discord" value={settings.social.discord} onChange={(v) => updateSetting('social', 'discord', v)} placeholder="https://discord.gg/..." />
              <Input label={tr ? 'İletişim E-posta' : 'Contact Email'} value={settings.social.email} onChange={(v) => updateSetting('social', 'email', v)} />
              <h3 className="font-semibold mt-6 mb-4" style={{ color: 'var(--text)' }}>Footer</h3>
              <Input label={tr ? 'Telif Hakkı Metni' : 'Copyright Text'} value={settings.footer.copyright} onChange={(v) => updateSetting('footer', 'copyright', v)} />
              <Toggle label={tr ? 'Sosyal medya ikonlarını göster' : 'Show social media icons'} checked={settings.footer.showSocial} onChange={(v) => updateSetting('footer', 'showSocial', v)} />
              <Toggle label={tr ? 'Footer linklerini göster' : 'Show footer links'} checked={settings.footer.showLinks} onChange={(v) => updateSetting('footer', 'showLinks', v)} />
            </div>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>🔍 SEO {tr ? 'Ayarları' : 'Settings'}</h2>
              <Input label="Google Analytics ID" value={settings.seo.googleAnalyticsId} onChange={(v) => updateSetting('seo', 'googleAnalyticsId', v)} placeholder="G-XXXXXXXXXX" help={tr ? 'Google Analytics 4 ölçüm kimliği' : 'Google Analytics 4 measurement ID'} />
              <Input label="Google Search Console" value={settings.seo.googleSearchConsoleCode} onChange={(v) => updateSetting('seo', 'googleSearchConsoleCode', v)} placeholder="verification code" help={tr ? 'HTML meta tag doğrulama kodu' : 'HTML meta tag verification code'} />
              <div className="mt-4 space-y-2">
                <Toggle label={tr ? 'Sitemap.xml oluştur' : 'Generate sitemap.xml'} checked={settings.seo.enableSitemap} onChange={(v) => updateSetting('seo', 'enableSitemap', v)} />
                <Toggle label={tr ? 'Robots.txt oluştur' : 'Generate robots.txt'} checked={settings.seo.enableRobots} onChange={(v) => updateSetting('seo', 'enableRobots', v)} />
              </div>
              <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>📋 {tr ? 'SEO Durumu' : 'SEO Status'}</h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <li>✅ robots.txt {tr ? 'aktif' : 'active'}</li>
                  <li>✅ sitemap.xml {tr ? 'aktif' : 'active'}</li>
                  <li>✅ JSON-LD Schema {tr ? 'aktif' : 'active'}</li>
                  <li>✅ Open Graph {tr ? 'aktif' : 'active'}</li>
                  <li>✅ Twitter Cards {tr ? 'aktif' : 'active'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>🔐 {tr ? 'Güvenlik Ayarları' : 'Security Settings'}</h2>
              <div className="p-4 rounded-xl mb-6 bg-yellow-500/20">
                <p className="text-sm text-yellow-400">
                  ⚠️ {tr ? 'Bu ayarları değiştirirken dikkatli olun!' : 'Be careful when changing these settings!'}
                </p>
              </div>
              <Input 
                label={tr ? 'Admin Şifresi' : 'Admin Password'} 
                type="password"
                value={settings.security.adminPassword} 
                onChange={(v) => updateSetting('security', 'adminPassword', v)}
                help={tr ? 'En az 8 karakter önerilir' : 'At least 8 characters recommended'}
              />
              <Input 
                label={tr ? 'Oturum Süresi (dakika)' : 'Session Timeout (minutes)'} 
                type="number"
                value={settings.security.sessionTimeout} 
                onChange={(v) => updateSetting('security', 'sessionTimeout', parseInt(v))}
              />
              <Input 
                label={tr ? 'Maksimum Giriş Denemesi' : 'Max Login Attempts'} 
                type="number"
                value={settings.security.maxLoginAttempts} 
                onChange={(v) => updateSetting('security', 'maxLoginAttempts', parseInt(v))}
              />
              <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--surface)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>🛡️ {tr ? 'Güvenlik İpuçları' : 'Security Tips'}</h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <li>• {tr ? 'Güçlü bir şifre kullanın (harf, rakam, sembol)' : 'Use a strong password (letters, numbers, symbols)'}</li>
                  <li>• {tr ? 'Şifrenizi kimseyle paylaşmayın' : 'Never share your password'}</li>
                  <li>• {tr ? 'Düzenli olarak şifrenizi değiştirin' : 'Change your password regularly'}</li>
                  <li>• {tr ? 'Admin panelini kullandıktan sonra çıkış yapın' : 'Log out after using admin panel'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Message */}
          {message.text && (
            <div className={`mt-6 p-3 rounded-xl text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {message.text}
            </div>
          )}

          {lastSaved && (
            <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
              {tr ? 'Son kayıt:' : 'Last saved:'} {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
