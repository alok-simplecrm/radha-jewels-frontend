import Link from 'next/link';
import Header from '../../components/Header';
import CartSlider from '../../components/CartSlider';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <CartSlider />
      <main className="flex-1 bg-slate-50/30">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-16 text-slate-600 font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold tracking-[0.1em] text-slate-950">
                RADHA JEWELS
              </h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Pure & Virtuous. Handcrafted demi-fine jewellery in 18kt gold plating and 316L stainless steel. Hypoallergenic, sweatproof, and water-resistant, made for your daily styling.
              </p>
            </div>
            
            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-slate-900 mb-4">Shop Collections</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/products?categoryId=necklaces" className="hover:text-gold-500 transition-colors">Necklaces</Link></li>
                <li><Link href="/products?categoryId=earrings" className="hover:text-gold-500 transition-colors">Earrings</Link></li>
                <li><Link href="/products?categoryId=bracelets" className="hover:text-gold-500 transition-colors">Bracelets</Link></li>
                <li><Link href="/products?categoryId=rings" className="hover:text-gold-500 transition-colors">Rings</Link></li>
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-slate-900 mb-4">Customer Care</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>Support: <a href="mailto:info@radhajewels.com" className="text-slate-600 hover:text-gold-500 transition-colors">info@radhajewels.com</a></li>
                <li>WhatsApp: <a href="https://wa.me/919819399178" className="text-slate-600 hover:text-gold-500 transition-colors">+91 98193 99178</a></li>
                <li>1-Year Shine & Luster Warranty</li>
                <li>Insured Free Delivery Pan-India</li>
              </ul>
            </div>

            {/* Column 4: Brand Guarantee */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-bold text-slate-900">Follow Us</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with us on social media for new collection announcements, daily styling tips, and flash sales.
              </p>
              <a href="https://instagram.com/radha_jewels" className="inline-block text-xs font-bold text-gold-500 hover:text-gold-600 transition-colors">
                @radha_jewels
              </a>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} Radha Jewels. All Rights Reserved.</p>
            <p className="mt-1 text-[10px]">Pure craftsmanship. Handcrafted with love.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
