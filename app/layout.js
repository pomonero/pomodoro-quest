import './globals.css';

export const metadata = {
  title: 'Pomonero - Odaklan, Başar, Keşfet',
  description: 'Modern pomodoro uygulaması',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
