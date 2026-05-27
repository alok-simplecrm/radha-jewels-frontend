'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useCartStore } from '@/store/useCartStore';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  SKU: string;
  description?: string;
  stockQuantity: number;
  images?: string[];
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const initialCategoryId = searchParams.get('categoryId') || '';
  const initialIsFeatured = searchParams.get('isFeatured') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const { addItem } = useCartStore();

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiClient.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        setCategories([
          { id: 'rings', name: 'Rings' },
          { id: 'necklaces', name: 'Necklaces' },
          { id: 'earrings', name: 'Earrings' },
          { id: 'bracelets', name: 'Bracelets' },
        ]);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    setCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let url = `/products?sortBy=${sortBy}&sortOrder=${sortOrder}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (categoryId) url += `&categoryId=${categoryId}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (initialIsFeatured) url += `&isFeatured=true`;

        const res = await apiClient.get(url);
        setProducts(res.data.data || []);
      } catch (err) {
        // Fallback mock data if server isn't running yet
        const mockProducts = [
          { id: '1', name: 'Solitaire Diamond Engagement Ring', price: 85000, discountPrice: 79999, SKU: 'RING-SL-01', stockQuantity: 10, category: { id: 'rings' }, images: ['/images/solitaire-ring.png'] },
          { id: '2', name: 'Classic Gold Halo Pendant Necklace', price: 42000, SKU: 'NECK-HALO-02', stockQuantity: 5, category: { id: 'necklaces' }, images: ['/images/halo-necklace.png'] },
          { id: '3', name: 'Bespoke Emerald Cut Diamond Earrings', price: 95000, discountPrice: 89999, SKU: 'EAR-EM-03', stockQuantity: 4, category: { id: 'earrings' }, images: ['/images/emerald-earrings.png'] },
          { id: '4', name: 'Infinite Gold Band Ring', price: 18000, SKU: 'RING-INF-04', stockQuantity: 12, category: { id: 'rings' }, images: ['/images/infinite-band.png'] },
        ];

        let filtered = mockProducts;
        if (categoryId) {
          filtered = filtered.filter(p => p.category.id === categoryId);
        }
        if (search) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        }
        setProducts(filtered);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [search, categoryId, minPrice, maxPrice, sortBy, sortOrder, initialIsFeatured]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-8">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Filter className="h-5 w-5 text-gold-500" />
            Filters
          </h2>

          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Category</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setCategoryId('')}
                  className={`text-left text-sm py-1 font-medium transition-colors ${!categoryId ? 'text-gold-500 font-bold' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  All Collections
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`text-left text-sm py-1 font-medium transition-colors ${(categoryId === cat.id || categoryId === cat.slug) ? 'text-gold-500 font-bold' : 'text-slate-600 hover:text-slate-950'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Price Range</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-gold-500 focus:outline-none"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid list */}
        <main className="flex-1">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {search ? `Search Results for "${search}"` : 'All Collections'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">{products.length} items found</p>
            </div>

            <div className="flex items-center gap-2 self-end">
              <span className="text-xs text-slate-400">Sort by</span>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split(':');
                  setSortBy(field);
                  setSortOrder(order as 'ASC' | 'DESC');
                }}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:border-gold-500 focus:outline-none bg-white text-slate-700"
              >
                <option value="createdAt:DESC">Newest</option>
                <option value="price:ASC">Price: Low to High</option>
                <option value="price:DESC">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid list */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-slate-500">No products found matching your filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
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
          )}
        </main>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
