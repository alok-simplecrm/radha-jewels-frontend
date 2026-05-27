import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Shivaye Jewels | Premium & Custom Jewelry Platform',
  description: 'Buy SHIVAYE JEWELS products online at best prices. Explore gold rings, necklaces, diamonds and bespoke jewelry catalog.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
