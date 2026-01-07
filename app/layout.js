import './globals.css';

export const metadata = {
  title: 'Pomonero - Odaklan, Başar, Keşfet',
  description: 'Modern pomodoro uygulaması ile odaklanın, başarın ve keşfedin. Oyunlarla mola verin, istatistiklerinizi takip edin.',
  keywords: 'pomodoro, odaklanma, verimlilik, çalışma, timer, pomonero',
  authors: [{ name: 'Pomonero' }],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Pomonero - Odaklan, Başar, Keşfet',
    description: 'Modern pomodoro uygulaması',
    images: ['/logo-dark.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
