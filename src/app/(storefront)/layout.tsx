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
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} Shivaye Jewels. All Rights Reserved.</p>
        <p className="mt-1">Handcrafted with love. Certified Ethically Sourced Diamonds.</p>
      </footer>
    </div>
  );
}
