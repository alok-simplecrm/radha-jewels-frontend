'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Award, Gem } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useCartStore } from '@/store/useCartStore';

interface Product {
  id: string;
  name: string;
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
        const res = await apiClient.get('/products?isFeatured=true&limit=4');
        setFeaturedProducts(res.data.data || []);
      } catch (err) {
        // Fallback mock data if server isn't running yet to maintain rich visuals
        setFeaturedProducts([
          { id: '1', name: 'Solitaire Diamond Engagement Ring', price: 85000, discountPrice: 79999, SKU: 'RING-SL-01', images: ['/images/solitaire-ring.png'] },
          { id: '2', name: 'Classic Gold Halo Pendant Necklace', price: 42000, SKU: 'NECK-HALO-02', images: ['/images/halo-necklace.png'] },
          { id: '3', name: 'Bespoke Emerald Cut Diamond Earrings', price: 95000, discountPrice: 89999, SKU: 'EAR-EM-03', images: ['/images/emerald-earrings.png'] },
          { id: '4', name: 'Infinite Gold Band Ring', price: 18000, SKU: 'RING-INF-04', images: ['/images/infinite-band.png'] },
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
      <section className="relative flex min-h-[80vh] items-center justify-center bg-slate-950 px-4 text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15),transparent_60%)]" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-500 tracking-wider uppercase">
            <Gem className="h-4 w-4 animate-pulse" /> Handcrafted Masterpieces
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Timeless Elegance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-400">
              For Your Forever
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-300">
            Discover our curated collection of certified bespoke diamonds, signature engagement rings, and luxury fine gold accessories.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-gold-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-gold-500/20 hover:bg-gold-600 hover:shadow-xl hover:shadow-gold-500/30 transition-all"
            >
              Shop Collections
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/products?isFeatured=true"
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/50 px-8 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
            >
              Explore Bestsellers
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
            <div className="flex flex-col items-center p-4">
              <ShieldCheck className="h-10 w-10 text-gold-500 mb-3" />
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">100% Certified Jewelry</h3>
              <p className="text-xs text-slate-400 mt-1">GIA certified diamonds & hallmarked gold.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Star className="h-10 w-10 text-gold-500 mb-3" />
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Handcrafted in India</h3>
              <p className="text-xs text-slate-400 mt-1">Ethical manufacturing with meticulous quality.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Award className="h-10 w-10 text-gold-500 mb-3" />
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Insured Free Shipping</h3>
              <p className="text-xs text-slate-400 mt-1">Free fully secured transit across the globe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Signature Collections</h2>
            <p className="mt-2 text-slate-500 text-sm">Indulge in our exquisite and highly sought-after jewelry designs.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const price = product.price;
              const hasDiscount = !!product.discountPrice;
              const activePrice = product.discountPrice || price;

              return (
                <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all">
                  {/* Image Container */}
                  <div className="aspect-square w-full bg-slate-50 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center">
                    <img
                      src={product.images?.[0] || '/images/placeholder.png'}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gold-500 mb-1">FINE JEWELRY</span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-gold-500 transition-colors line-clamp-1">{product.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">SKU: {product.SKU}</p>
                    
                    {/* Price Tag */}
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-slate-900">₹{activePrice}</span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">₹{price}</span>
                      )}
                    </div>

                    <button
                      onClick={() => addItem(product.id, 1)}
                      className="mt-5 w-full rounded-full border border-gold-500 bg-transparent py-2.5 text-xs font-bold text-gold-500 hover:bg-gold-500 hover:text-white transition-all text-center"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
