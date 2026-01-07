import './globals.css';

export const metadata = {
  title: 'Pomonero - Odaklan, Başar, Keşfet',
  description: 'Modern pomodoro uygulaması ile odaklanın, mini oyunlar oynayın ve üretkenliğinizi artırın!',
  keywords: 'pomodoro, timer, odaklanma, productivity, çalışma, oyun, pomonero',
  openGraph: {
    title: 'Pomonero',
    description: 'Odaklan, Başar, Keşfet',
    type: 'website',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0a0a1a" />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
