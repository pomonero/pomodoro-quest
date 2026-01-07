'use client';

import { useStore } from '@/lib/store';

export default function PrivacyPage() {
  const { language } = useStore();

  if (language === 'tr') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Gizlilik Politikası
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Son güncelleme: Ocak 2025</p>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              📋 Topladığımız Veriler
            </h2>
            <p className="mb-3" style={{ color: 'var(--text-muted)' }}>
              Pomonero, hizmet sunabilmek için aşağıdaki verileri toplar:
            </p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span><strong>E-posta adresi:</strong> Hesap oluşturma ve giriş işlemleri için</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span><strong>Kullanıcı adı:</strong> Profil ve liderlik tablosu için</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span><strong>Çalışma istatistikleri:</strong> Kişisel ilerleme takibi için</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span><strong>Oyun skorları:</strong> Liderlik tablosu sıralaması için</span>
              </li>
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              🛡️ Verilerin Kullanımı
            </h2>
            <p className="mb-3" style={{ color: 'var(--text-muted)' }}>
              Topladığımız veriler yalnızca aşağıdaki amaçlarla kullanılır:
            </p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Hizmetlerimizi sunmak ve geliştirmek</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Kişiselleştirilmiş deneyim sağlamak</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Destek taleplerini yanıtlamak</span>
              </li>
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              🔐 Veri Güvenliği
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Verileriniz Supabase altyapısında şifreli olarak saklanır. Şifreleriniz hash'lenerek korunur 
              ve hiçbir zaman düz metin olarak saklanmaz. Üçüncü taraflarla kişisel verilerinizi paylaşmayız.
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              👤 Haklarınız
            </h2>
            <p className="mb-3" style={{ color: 'var(--text-muted)' }}>
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span>Verilerinize erişim talep etme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span>Verilerinizin düzeltilmesini isteme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)]">•</span>
                <span>Hesabınızı ve verilerinizi silme</span>
              </li>
            </ul>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              🍪 Çerezler
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Pomonero, oturum yönetimi ve tercihlerinizi hatırlamak için temel çerezler kullanır. 
              Bu çerezler hizmetin çalışması için gereklidir ve devre dışı bırakılamaz.
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              📧 İletişim
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Gizlilik politikamız hakkında sorularınız için İletişim sayfasından bize ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // English version
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Last updated: January 2025</p>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            📋 Data We Collect
          </h2>
          <p className="mb-3" style={{ color: 'var(--text-muted)' }}>
            Pomonero collects the following data to provide our services:
          </p>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span><strong>Email address:</strong> For account creation and login</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span><strong>Username:</strong> For profile and leaderboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span><strong>Work statistics:</strong> For personal progress tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span><strong>Game scores:</strong> For leaderboard ranking</span>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            🛡️ How We Use Data
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>To provide and improve our services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>To provide personalized experience</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>To respond to support requests</span>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            🔐 Data Security
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Your data is stored encrypted on Supabase infrastructure. Passwords are hashed and never 
            stored in plain text. We do not share your personal data with third parties.
          </p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            👤 Your Rights
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span>Request access to your data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span>Request correction of your data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">•</span>
              <span>Delete your account and data</span>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            📧 Contact
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            For questions about our privacy policy, please contact us through the Contact page.
          </p>
        </div>
      </div>
    </div>
  );
}
