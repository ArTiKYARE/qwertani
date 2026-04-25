import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AnimeStream - Смотри аниме онлайн',
  description: 'Смотри любимые аниме онлайн в высоком качестве с русской озвучкой. Огромная коллекция аниме, онгоинги, классика и новинки.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
