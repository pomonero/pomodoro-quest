import './globals.css';

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

// JSON-LD Schema
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Pomonero',
  alternateName: 'Pomonero Pomodoro Timer',
  url: 'https://www.pomonero.com',
  logo: 'https://www.pomonero.com/logo-dark.png',
  image: 'https://www.pomonero.com/logo-dark.png',
  description: 'Modern pomodoro zamanlayıcı uygulaması. Odaklanın, verimli çalışın ve başarın.',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'TRY',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
  },
  author: {
    '@type': 'Organization',
    name: 'Pomonero',
    url: 'https://www.pomonero.com',
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
  sameAs: [],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
