'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useCartStore } from '@/store/useCartStore';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName?: string;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  SKU: string;
  description: string;
  stockQuantity: number;
  images: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { addItem, toggleOpen } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [activeImage, setActiveImage] = useState('');
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({
    story: true,
    materials: false,
    warranty: false,
    shipping: false,
  });

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        // 1. Fetch Product
        const prodRes = await apiClient.get(`/products/${params.slug}`);
        const prod = prodRes.data;
        setProduct(prod);
        if (prod.images && prod.images.length > 0) {
          setActiveImage(prod.images[0]);
        }

        // 2. Fetch Reviews
        try {
          const reviewsRes = await apiClient.get(`/reviews/product/${prod.id}`);
          setReviews(reviewsRes.data || []);
        } catch (e) {
          console.error('Error fetching reviews:', e);
        }

        // 3. Fetch Recommendations (same category)
        try {
          if (prod.category) {
            const recsRes = await apiClient.get(`/products?categoryId=${prod.category.id}&limit=5`);
            const recs = (recsRes.data.data || []).filter((p: Product) => p.id !== prod.id).slice(0, 4);
            setRecommendations(recs);
          }
        } catch (e) {
          console.error('Error fetching recommendations:', e);
        }

      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.slug]);

  const toggleAccordion = (section: string) => {
    setAccordionOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddtoBag = async () => {
    if (!product) return;
    try {
      await addItem(product.id, 1);
      // Cart drawer opens automatically via store state
    } catch (err) {
      // Prompt login if unauthorized
      router.push('/login');
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await addItem(product.id, 1);
      toggleOpen(false);
      router.push('/checkout');
    } catch (err) {
      router.push('/login');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      await apiClient.post('/reviews', {
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess('Thank you! Your review has been submitted for moderation.');
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review. Make sure you are logged in.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#fcfbf9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
          <p className="text-slate-400 text-sm font-semibold">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center bg-[#fcfbf9]">
        <h1 className="font-serif text-3xl font-bold text-slate-900 mb-4">Product Not Found</h1>
        <p className="text-slate-500 text-sm mb-8">{error || "The piece you're looking for doesn't exist or is currently unavailable."}</p>
        <Link
          href="/products"
          className="rounded-full bg-slate-950 px-8 py-3.5 text-xs uppercase tracking-widest font-bold text-white hover:bg-gold-500 transition-colors"
        >
          View Collections
        </Link>
      </div>
    );
  }

  // Calculate review summary stats
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const price = product.price;
  const hasDiscount = !!product.discountPrice;
  const activePrice = product.discountPrice || price;

  return (
    <div className="bg-[#fcfbf9] text-[#212121] font-sans antialiased min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-gold-500 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="hover:text-gold-500 transition-colors">Products</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/products?categoryId=${product.category.slug}`} className="hover:text-gold-500 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-slate-350" />
          <span className="text-slate-700 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Meta Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 mb-20 items-start">
          
          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-square w-full bg-white border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm">
              <img
                key={activeImage}
                src={activeImage || '/images/placeholder.png'}
                alt={product.name}
                className="h-full w-full object-cover object-center animate-fade-scale"
              />
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 flex items-center justify-center transition-all ${activeImage === img ? 'border-gold-500 scale-95 shadow-sm' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx}`} className="h-full w-full object-cover object-center" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Meta Info */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">18KT Gold Plated Demi-Fine</span>
              <h1 className="font-serif text-3xl font-bold tracking-wide text-slate-950 leading-tight">
                {product.name}
              </h1>
              
              {/* Ratings Summary */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center text-gold-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.round(Number(averageRating)) ? 'fill-gold-500' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">{averageRating} stars</span>
                <span className="text-slate-300 text-xs font-bold">|</span>
                <a href="#reviews" className="text-xs font-bold text-gold-500 hover:underline">
                  {reviews.length} Customer Reviews
                </a>
              </div>
            </div>

            {/* Price Tag */}
            <div className="flex items-baseline gap-3 border-y border-slate-100 py-4">
              <span className="text-2xl font-extrabold text-slate-900 font-sans">₹{activePrice}</span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-slate-450 line-through font-sans">₹{price}</span>
                  <span className="bg-red-500/10 text-red-650 text-[10px] font-bold px-2 py-0.5 rounded">
                    {Math.round(((price - activePrice) / price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Product Meta Data */}
            <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold text-slate-500 pt-2">
              <div>SKU: <span className="text-slate-800 font-bold">{product.SKU}</span></div>
              <div>Availability: {' '}
                {product.stockQuantity > 0 ? (
                  <span className="text-emerald-600 font-bold">In Stock</span>
                ) : (
                  <span className="text-rose-500 font-bold">Sold Out</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {product.stockQuantity > 0 ? (
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleAddtoBag}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gold-500 bg-transparent py-4 text-xs uppercase tracking-widest font-bold text-gold-500 hover:bg-gold-500 hover:text-white transition-all shadow-sm"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Bag
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex w-full items-center justify-center rounded-full bg-slate-950 py-4 text-xs uppercase tracking-widest font-bold text-white hover:bg-gold-600 transition-all shadow-md"
                >
                  Buy It Now
                </button>
              </div>
            ) : (
              <div className="pt-4">
                <button
                  disabled
                  className="w-full rounded-full bg-slate-100 border border-slate-200 py-4 text-xs uppercase tracking-widest font-bold text-slate-400 cursor-not-allowed"
                >
                  Sold Out
                </button>
              </div>
            )}

            {/* Product USP list */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-center">
              <div className="flex flex-col items-center p-2 rounded-xl bg-[#fdfbf7]">
                <ShieldCheck className="h-5 w-5 text-gold-500 mb-1" />
                <span className="text-[10px] font-bold text-slate-700">Anti-Tarnish</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-[#fdfbf7]">
                <RefreshCw className="h-5 w-5 text-gold-500 mb-1" />
                <span className="text-[10px] font-bold text-slate-700">Waterproof</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-[#fdfbf7]">
                <Truck className="h-5 w-5 text-gold-500 mb-1" />
                <span className="text-[10px] font-bold text-slate-700">Free Shipping</span>
              </div>
            </div>

            {/* Accordion Tabs */}
            <div className="pt-6 border-t border-slate-100 divide-y divide-slate-100 font-sans">
              
              {/* Tab 1: Story */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('story')}
                  className="flex w-full items-center justify-between font-serif text-sm font-bold text-slate-900 focus:outline-none"
                >
                  <span>Story & Inspiration</span>
                  {accordionOpen.story ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {accordionOpen.story && (
                  <div className="mt-2.5 text-xs text-slate-500 leading-relaxed font-medium animate-slide-down">
                    <p>Royalty, meet refinement! Radha Jewels epitomizes purity and grace. Our pieces are designed with a commitment to timeless elegance and exquisite craftsmanship.</p>
                    <p className="mt-2">Designed with the modern woman in mind, this piece strikes the perfect balance between classic charm and contemporary flair, effortlessly elevating any ensemble.</p>
                  </div>
                )}
              </div>

              {/* Tab 2: Materials */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('materials')}
                  className="flex w-full items-center justify-between font-serif text-sm font-bold text-slate-900 focus:outline-none"
                >
                  <span>Materials & Care</span>
                  {accordionOpen.materials ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {accordionOpen.materials && (
                  <div className="mt-2.5 text-xs text-slate-500 leading-relaxed font-medium space-y-1 animate-slide-down">
                    <p>• <strong>Plating:</strong> Thick layer of 18K gold electroplating for a radiant finish.</p>
                    <p>• <strong>Core Material:</strong> High-grade 316L Stainless Steel for ultimate durability.</p>
                    <p>• <strong>Skin Safety:</strong> 100% Hypoallergenic, lead-free and nickel-free.</p>
                    <p>• <strong>Durability:</strong> Water-resistant and tarnish-resistant. Maintains its brilliance over time.</p>
                  </div>
                )}
              </div>

              {/* Tab 3: Warranty */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('warranty')}
                  className="flex w-full items-center justify-between font-serif text-sm font-bold text-slate-900 focus:outline-none"
                >
                  <span>1-Year Shine Warranty</span>
                  {accordionOpen.warranty ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {accordionOpen.warranty && (
                  <div className="mt-2.5 text-xs text-slate-500 leading-relaxed font-medium animate-slide-down">
                    Our demi-fine items are designed for longevity. We offer a full <strong>1-Year Warranty</strong> on the shine and luster of the gold plating. In the rare event that it fades, we will restore or replace the item free of charge.
                  </div>
                )}
              </div>

              {/* Tab 4: Shipping */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="flex w-full items-center justify-between font-serif text-sm font-bold text-slate-900 focus:outline-none"
                >
                  <span>Shipping & Returns</span>
                  {accordionOpen.shipping ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {accordionOpen.shipping && (
                  <div className="mt-2.5 text-xs text-slate-500 leading-relaxed font-medium space-y-1 animate-slide-down">
                    <p>• <strong>Shipping:</strong> Free insured shipping on all orders. Dispatched in 24 hours.</p>
                    <p>• <strong>Delivery:</strong> Delivered in 3-5 business days across India.</p>
                    <p>• <strong>Returns:</strong> 7-day hassle-free returns. Exchange or refund if items are unused and packaging is intact.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Complete the Look Section */}
        {recommendations.length > 0 && (
          <section className="border-t border-slate-100 pt-16 mb-20">
            <h2 className="font-serif text-2xl font-bold tracking-wide text-slate-950 text-center mb-10">
              Complete The Look
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {recommendations.map((rec) => {
                const recPrice = rec.price;
                const recHasDiscount = !!rec.discountPrice;
                const recActivePrice = rec.discountPrice || recPrice;
                return (
                  <div key={rec.id} className="group relative flex flex-col overflow-hidden bg-white">
                    <Link href={`/products/${rec.slug}`}>
                      <div className="aspect-square w-full bg-slate-50 relative overflow-hidden rounded-xl group-hover:shadow-md transition-all duration-300 flex items-center justify-center border border-slate-100">
                        <img
                          src={rec.images?.[0] || '/images/placeholder.png'}
                          alt={rec.name}
                          className="h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col pt-3">
                      <Link href={`/products/${rec.slug}`}>
                        <h4 className="font-serif text-xs font-bold text-slate-900 hover:text-gold-500 transition-colors line-clamp-1">{rec.name}</h4>
                      </Link>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-900">₹{recActivePrice}</span>
                        {recHasDiscount && (
                          <span className="text-[10px] text-slate-400 line-through">₹{recPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section id="reviews" className="border-t border-slate-100 pt-16 font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Reviews Summary Stats */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="font-serif text-2xl font-bold tracking-wide text-slate-900">
                Customer Reviews
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-extrabold text-slate-950 font-serif">{averageRating}</span>
                  <div>
                    <div className="flex text-gold-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4.5 w-4.5 ${i < Math.round(Number(averageRating)) ? 'fill-gold-500' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-slate-450 mt-1">Based on {reviews.length} reviews</p>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <form onSubmit={handleReviewSubmit} className="bg-[#fdfbf7] rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
                <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="h-4.5 w-4.5 text-gold-500" /> Write a Review
                </h3>
                
                {reviewSuccess && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600">
                    {reviewSuccess}
                  </div>
                )}
                {reviewError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-500">
                    {reviewError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-gold-500 focus:outline-none"
                      >
                        <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-gold-500' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Comment</label>
                  <textarea
                    rows={4}
                    placeholder="Share your experience styling this piece..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:border-gold-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex w-full items-center justify-center rounded-full bg-slate-950 py-3 text-xs uppercase tracking-widest font-bold text-white hover:bg-gold-500 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
                </button>
              </form>

            </div>

            {/* Reviews List */}
            <div className="lg:col-span-8 space-y-6">
              <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Reviews Feed ({reviews.length})
              </h3>
              
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white">
                  <Sparkles className="h-8 w-8 text-slate-350 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No reviews yet for this product</p>
                  <p className="text-xs mt-0.5">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {reviews.map((rev) => {
                    const reviewDate = new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    return (
                      <div key={rev.id} className="py-6 first:pt-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-slate-900">
                              {rev.user.firstName} {rev.user.lastName || ''}
                            </span>
                            <span className="ml-2.5 inline-flex items-center rounded-full bg-gold-500/5 px-2 py-0.5 text-[9px] font-bold text-gold-700 tracking-wider uppercase border border-gold-500/10">
                              Verified Buyer
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-semibold">{reviewDate}</span>
                        </div>
                        
                        <div className="flex text-gold-500 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? 'fill-gold-500' : 'text-slate-200'}`} />
                          ))}
                        </div>

                        <p className="mt-3 text-xs text-slate-650 leading-relaxed font-medium">
                          {rev.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
