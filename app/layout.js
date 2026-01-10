import './globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  metadataBase: new URL('https://www.pomonero.com'),
  title: {
    default: 'Pomonero - Pomodoro Zamanlayıcı | Odaklan, Başar, Keşfet',
    template: '%s | Pomonero'
  },
  description: 'Pomonero ile odaklanın, verimli çalışın ve başarın. Modern pomodoro tekniği, TYT-AYT sınav modları, oyunlu molalar, istatistikler ve daha fazlası. Ücretsiz online pomodoro zamanlayıcı.',
  keywords: [
    'pomodoro', 'pomodoro tekniği', 'pomodoro zamanlayıcı', 'odaklanma', 
    'verimlilik', 'çalışma timer', 'pomonero', 'TYT timer', 'AYT timer',
    'sınav çalışma', 'ders çalışma', 'focus timer', 'productivity'
  ],
  authors: [{ name: 'Pomonero', url: 'https://www.pomonero.com' }],
  creator: 'Pomonero',
  publisher: 'Pomonero',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-dark.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://www.pomonero.com',
    siteName: 'Pomonero',
    title: 'Pomonero - Pomodoro Zamanlayıcı | Odaklan, Başar, Keşfet',
    description: 'Modern pomodoro tekniği ile odaklanın ve verimli çalışın. TYT-AYT sınav modları, oyunlu molalar ve istatistikler.',
    images: [
      {
        url: '/logo-dark.png',
        width: 512,
        height: 512,
        alt: 'Pomonero Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomonero - Pomodoro Zamanlayıcı',
    description: 'Modern pomodoro tekniği ile odaklanın ve verimli çalışın.',
    images: ['/logo-dark.png'],
    creator: '@pomonero',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Google Search Console verification (varsa ekle)
    // google: 'verification-code',
  },
  alternates: {
    canonical: 'https://www.pomonero.com',
  },
};

// JSON-LD Schema - WebApplication
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Pomonero',
  alternateName: 'Pomonero Pomodoro Timer',
  url: 'https://www.pomonero.com',
  logo: 'https://www.pomonero.com/logo-dark.png',
  image: 'https://www.pomonero.com/logo-dark.png',
  description: 'Modern pomodoro zamanlayıcı uygulaması. Odaklanın, verimli çalışın ve başarın. TYT ve AYT sınav modları ile öğrencilere özel.',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  softwareVersion: '2.2.0',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'TRY',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '250',
    bestRating: '5',
    worstRating: '1',
  },
  author: {
    '@type': 'Organization',
    name: 'Pomonero',
    url: 'https://www.pomonero.com',
  },
  featureList: [
    'Pomodoro Zamanlayıcı',
    'TYT Sınav Modu (120 dakika)',
    'AYT Sınav Modu (165 dakika)',
    'Mola Oyunları',
    'İstatistikler',
    'Liderlik Tablosu',
    '8 Farklı Tema',
    'Türkçe ve İngilizce Dil Desteği',
  ],
};

// WebSite Schema - Google Sitelinks için
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Pomonero',
  alternateName: 'Pomonero - Pomodoro Zamanlayıcı',
  url: 'https://www.pomonero.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.pomonero.com/?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// Organization Schema (Logo için önemli)
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Pomonero',
  url: 'https://www.pomonero.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.pomonero.com/logo-dark.png',
    width: 512,
    height: 512,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@pomonero.com',
    contactType: 'customer service',
    availableLanguage: ['Turkish', 'English'],
  },
  sameAs: [],
};

// FAQ Schema - Google'da SSS görünümü için
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Pomodoro tekniği nedir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pomodoro tekniği, 25 dakikalık odaklanma seansları ve 5 dakikalık molalardan oluşan bir zaman yönetimi metodudur. Her 4 seanstan sonra 15-30 dakikalık uzun mola verilir.',
      },
    },
    {
      '@type': 'Question',
      name: 'Pomonero ücretsiz mi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Evet, Pomonero tamamen ücretsizdir. Tüm özellikler (zamanlayıcı, oyunlar, istatistikler, temalar) ücretsiz olarak kullanılabilir.',
      },
    },
    {
      '@type': 'Question',
      name: 'TYT ve AYT modları ne işe yarar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TYT modu 120 dakika (2 saat), AYT modu 165 dakika (2 saat 45 dakika) sürer. Bu modlar gerçek sınav sürelerini simüle ederek öğrencilerin pratik yapmasına yardımcı olur.',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="canonical" href="https://www.pomonero.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="min-h-screen">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
