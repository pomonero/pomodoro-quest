'use client';

import { useStore } from '@/lib/store';

export default function Footer() {
  const { language, setCurrentPage } = useStore();
  const tr = language === 'tr';
  const year = new Date().getFullYear();

  const links = [
    { key: 'about', label: tr ? 'Hakkımızda' : 'About', icon: '📖' },
    { key: 'pomodoro', label: tr ? 'Pomodoro Nedir?' : 'What is Pomodoro?', icon: '🍅' },
    { key: 'support', label: tr ? 'Destek' : 'Support', icon: '💬' },
    { key: 'contact', label: tr ? 'İletişim' : 'Contact', icon: '✉️' },
    { key: 'privacy', label: tr ? 'Gizlilik' : 'Privacy', icon: '🔒' },
  ];

  const socials = [
    { icon: '📸', label: 'Instagram', url: '#' },
    { icon: '🐦', label: 'Twitter', url: '#' },
    { icon: '📺', label: 'YouTube', url: '#' },
  ];

  return (
    <footer className="mt-12 border-t" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Üst Kısım */}
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
          </div>

          {/* Hızlı Linkler */}
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

          {/* Sosyal Medya */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
              {tr ? 'Bizi Takip Edin' : 'Follow Us'}
            </h4>
            <div className="flex gap-3">
              {socials.map(social => (
                <a
                  key={social.label}
                  href={social.url}
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
            
            {/* Newsletter */}
            <div className="mt-4">
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                {tr ? 'Güncellemelerden haberdar olun' : 'Stay updated'}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={tr ? 'E-posta adresiniz' : 'Your email'}
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  {tr ? 'Abone Ol' : 'Subscribe'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © {year} Pomonero. {tr ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>🇹🇷 {tr ? 'Türkiye\'de yapıldı' : 'Made in Turkey'}</span>
            <span>❤️ {tr ? 'Sevgiyle' : 'With love'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
