import './globals.css';
import { Cardo, Figtree } from 'next/font/google';

const figtree = Figtree({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const cardo = Cardo({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
});

export const metadata = {
  title: 'Radha Jewels | Premium Demi-Fine Jewellery Online',
  description: 'Radha Jewels offers demi-fine jewellery that combines quality and design. Find handcrafted, everyday pieces that suit modern, minimalist style.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${cardo.variable}`}>
      <body className="font-sans antialiased bg-[#fcfbf9] text-[#212121]">
        {children}
      </body>
    </html>
  );
}
