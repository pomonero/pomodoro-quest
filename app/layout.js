import './globals.css';

export const metadata = {
  title: 'Pomonero - Çalış, Oyna, Kazan!',
  description: 'Pomodoro tekniği ile çalış, mini oyunlar oyna ve liderlik tablosunda yarış!',
  keywords: 'pomodoro, timer, oyun, çalışma, odaklanma, productivity, pomonero',
  openGraph: {
    title: 'Pomonero',
    description: 'Çalış, Oyna, Kazan!',
    type: 'website',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f0f1a" />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
