'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import apiClient from '@/lib/api-client';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Address Form State
  const [fullName, setFullName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formError, setFormError] = useState('');

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName || !addressLine || !city || !stateName || !zipCode) {
      setFormError('Please fill in all shipping details');
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = {
        fullName,
        addressLine,
        city,
        stateName,
        zipCode,
      };

      const response = await apiClient.post('/orders', {
        shippingAddress,
        paymentMethod,
      });

      setOrderSuccess(response.data);
      clearCart();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-6" />
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Placed Successfully!</h1>
        <p className="mt-2 text-slate-500 text-sm">
          Thank you for shopping with Radha Jewels. Your order reference is{' '}
          <strong className="text-slate-800">{orderSuccess.orderNumber}</strong>.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/products"
            className="rounded-full bg-gold-500 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-gold-600"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-slate-300 mb-6" />
        <h1 className="text-2xl font-bold text-slate-900">Your bag is empty</h1>
        <p className="mt-2 text-slate-500 text-sm">Please add some jewelry pieces before checking out.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-500 px-8 py-3 text-sm font-bold text-white hover:bg-gold-600"
        >
          <ArrowLeft className="h-4 w-4" /> Browse Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Shipping Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleCheckoutSubmit} className="space-y-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Shipping Address</h2>
            
            {formError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Receiver name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Address Line</label>
              <input
                type="text"
                placeholder="Street address, apartment or flat number"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">State</label>
                <input
                  type="text"
                  placeholder="State"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">ZIP Code</label>
                <input
                  type="text"
                  placeholder="ZIP"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 border-t border-slate-100 pt-6 pb-3">Payment Method</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-4 cursor-pointer hover:border-gold-500">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <span className="text-sm font-semibold text-slate-800">Cash on Delivery (COD)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-full bg-gold-500 py-3 text-sm font-bold text-white shadow-lg hover:bg-gold-600 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Place Order</span>}
            </button>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200/50 pb-3">Bag Summary</h2>
            
            <div className="max-h-64 overflow-y-auto space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-white border border-slate-200 rounded overflow-hidden flex items-center justify-center">
                      <img
                        src={item.product.images?.[0] || '/images/placeholder.png'}
                        alt={item.product.name}
                        loading="lazy"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.name}</h4>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    ₹{(item.product.discountPrice || item.product.price) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200/50 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200/40 pt-3">
                <span>Total Amount</span>
                <span>₹{subtotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
