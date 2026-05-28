'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Droplets, Award } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useCartStore } from '@/store/useCartStore';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  SKU: string;
  images?: string[];
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await apiClient.get('/products?isFeatured=true&limit=8');
        setFeaturedProducts(res.data.data || []);
      } catch (err) {
        // Fallback mock data if server isn't running yet to maintain rich visuals
        setFeaturedProducts([
          { id: '1', name: 'Emily Flower Earrings', slug: 'emily-flower-earrings', price: 2500, discountPrice: 1850, SKU: 'TAA-EMILY-EAR', images: ['https://cdn.shopify.com/s/files/1/0906/2527/8230/files/rn-image_picker_lib_temp_b2465c2a-0c07-4b72-9f76-84af2f97fb07.jpg?v=1770371343'] },
          { id: '2', name: 'Sophia Zircon Necklace', slug: 'sophia-zircon-necklace', price: 2200, discountPrice: 1600, SKU: 'TAA-SOPHIA-NECK', images: ['https://cdn.shopify.com/s/files/1/0906/2527/8230/files/rn-image_picker_lib_temp_b3c12509-2e89-4490-9093-cd9899f7565d.jpg?v=1746131612'] },
          { id: '3', name: 'Madison Zircon Cuff Bracelet', slug: 'madison-zircon-cuff-bracelet', price: 2500, discountPrice: 1850, SKU: 'TAA-MADISON-BRAC', images: ['https://cdn.shopify.com/s/files/1/0906/2527/8230/files/Polish-20241010_000706606.jpg?v=1746131672'] },
          { id: '4', name: 'Mira Evil Eye Pearl Necklace', slug: 'mira-evil-eye-pearl-necklace', price: 2250, discountPrice: 1650, SKU: 'TAA-MIRA-NECK', images: ['https://cdn.shopify.com/s/files/1/0906/2527/8230/files/Polish-20241010_001233408.jpg?v=1728499465'] },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#f5f2ec] overflow-hidden border-b border-slate-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-16 md:py-24 items-center">
            {/* Left Content */}
            <div className="space-y-6 text-left relative z-10 animate-slide-up">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/20 bg-gold-500/5 px-4.5 py-1 text-xs font-bold text-gold-700 tracking-widest uppercase">
                <Sparkles className="h-3.5 w-3.5 text-gold-500 animate-pulse" /> Demi-Fine Collection
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-wide text-slate-950 leading-tight">
                Pure, Elegant <br />
                <span className="text-gold-500">
                  Everyday Luxury
                </span>
              </h1>
              <p className="max-w-md text-base text-slate-500 leading-relaxed font-sans font-medium">
                Discover modern, minimalist jewellery crafted from premium 316L stainless steel, plated with thick 18kt gold. Anti-tarnish, sweatproof, and completely water-resistant.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-8 py-3.5 text-xs uppercase tracking-widest font-bold text-white hover:bg-gold-500 hover:shadow-lg hover:shadow-gold-500/10 transition-all duration-300"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/products?isFeatured=true"
                  className="inline-flex items-center rounded-full border border-slate-350 bg-transparent px-8 py-3.5 text-xs uppercase tracking-widest font-bold text-slate-700 hover:bg-slate-100 transition-all duration-300"
                >
                  Bestsellers
                </Link>
              </div>
            </div>

            {/* Right Media (Radha Original Banner) */}
            <div className="relative aspect-[4/3] sm:aspect-[3/2] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/50 bg-white animate-fade-in animate-float flex items-center justify-center">
              <img
                src="https://taahirajewellery.com/cdn/shop/files/rn-image_picker_lib_temp_058d0b1b-41b3-4736-a1c6-66d32eca8b4d.png?v=1763703724&width=1080"
                alt="Radha Luxury Jewels Campaign"
                className="w-full h-auto max-h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/5 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex flex-col items-center p-4 hover:translate-y-[-4px] transition-transform duration-300">
              <Droplets className="h-8 w-8 text-gold-500 mb-3" />
              <h3 className="font-serif text-base font-bold text-slate-900 tracking-wide">100% Water & Sweat Proof</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium max-w-xs">Shower, swim, or work out. Our jewelry will never turn green or tarnish.</p>
            </div>
            <div className="flex flex-col items-center p-4 hover:translate-y-[-4px] transition-transform duration-300">
              <ShieldCheck className="h-8 w-8 text-gold-500 mb-3" />
              <h3 className="font-serif text-base font-bold text-slate-900 tracking-wide">Hypoallergenic Materials</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium max-w-xs">Made with medical-grade 316L stainless steel. Free from nickel and lead.</p>
            </div>
            <div className="flex flex-col items-center p-4 hover:translate-y-[-4px] transition-transform duration-300">
              <Award className="h-8 w-8 text-gold-500 mb-3" />
              <h3 className="font-serif text-base font-bold text-slate-900 tracking-wide">1-Year Color Warranty</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium max-w-xs">We guarantee the luster and shine of our 18kt gold plating for a full year.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-16 bg-[#fdfbf7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold tracking-wide text-slate-950">Shop By Category</h2>
            <p className="mt-1 text-slate-400 text-xs tracking-wider uppercase font-bold">Curated demi-fine selections</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { name: 'Necklaces', id: 'necklaces', img: 'https://cdn.shopify.com/s/files/1/0906/2527/8230/files/rn-image_picker_lib_temp_b3c12509-2e89-4490-9093-cd9899f7565d.jpg?v=1746131612' },
              { name: 'Earrings', id: 'earrings', img: 'https://cdn.shopify.com/s/files/1/0906/2527/8230/files/rn-image_picker_lib_temp_b2465c2a-0c07-4b72-9f76-84af2f97fb07.jpg?v=1770371343' },
              { name: 'Bracelets', id: 'bracelets', img: 'https://cdn.shopify.com/s/files/1/0906/2527/8230/files/Polish-20241010_000706606.jpg?v=1746131672' },
              { name: 'Rings', id: 'rings', img: 'https://cdn.shopify.com/s/files/1/0906/2527/8230/files/6889ac6b737c555d7c68c097_140x140.jpg?v=1753864985' },
            ].map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-slate-100 bg-white"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/30 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                  <span className="font-serif text-sm sm:text-base font-bold text-white uppercase tracking-wider bg-slate-950/40 backdrop-blur-sm px-4 py-1.5 rounded-full inline-block">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold tracking-wide text-slate-950">Trending Collections</h2>
            <p className="mt-2 text-slate-400 text-xs font-bold uppercase tracking-widest">Our current highly-coveted favourites</p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-12">
              {featuredProducts.map((product) => {
                const price = product.price;
                const hasDiscount = !!product.discountPrice;
                const activePrice = product.discountPrice || price;

                return (
                  <div key={product.id} className="group relative flex flex-col overflow-hidden bg-white animate-fade-in">
                    {/* Image Container */}
                    <Link href={`/products/${product.slug || product.id}`}>
                      <div className="aspect-square w-full bg-slate-50 relative overflow-hidden rounded-xl group-hover:shadow-md transition-all duration-300 flex items-center justify-center border border-slate-100">
                        <img
                          src={product.images?.[0] || '/images/placeholder.png'}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                        />
                        {hasDiscount && (
                          <span className="absolute top-2 left-2 bg-red-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-md">
                            SALE
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 flex-col pt-4">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1">18KT GOLD PLATED</span>
                      <Link href={`/products/${product.slug || product.id}`}>
                        <h3 className="font-serif text-sm font-bold text-slate-900 hover:text-gold-500 transition-colors line-clamp-1">{product.name}</h3>
                      </Link>
                      
                      {/* Price Tag */}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-slate-900">₹{activePrice}</span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">₹{price}</span>
                        )}
                      </div>

                      <button
                        onClick={() => addItem(product.id, 1)}
                        className="mt-4 w-full rounded-full border border-gold-500 bg-transparent py-2.5 text-xs font-bold text-gold-500 hover:bg-gold-500 hover:text-white transition-all text-center"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
