'use client';

import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export default function CartSlider() {
  const { user } = useAuthStore();
  const { items, subtotal, isOpen, toggleOpen, updateQuantity, removeItem } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => toggleOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out">
          <div className="flex h-full flex-col justify-between">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gold-500" />
                Shopping Bag
              </h2>
              <button
                onClick={() => toggleOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!user ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <p className="mb-4 text-slate-500 text-sm">Please login to view your cart items</p>
                  <Link
                    href="/login"
                    onClick={() => toggleOpen(false)}
                    className="rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gold-600"
                  >
                    Login
                  </Link>
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 h-12 w-12 text-slate-300" />
                  <p className="text-slate-500 font-medium">Your shopping bag is empty</p>
                  <button
                    onClick={() => toggleOpen(false)}
                    className="mt-2 text-sm font-semibold text-gold-500 hover:text-gold-600"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const price = item.product.discountPrice || item.product.price;
                    return (
                      <div key={item.id} className="flex gap-4 border-b border-slate-100 pb-4">
                        {/* Image */}
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <img
                            src={item.product.images?.[0] || '/images/placeholder.png'}
                            alt={item.product.name}
                            loading="lazy"
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                            <p className="mt-0.5 text-xs text-slate-400">SKU: {item.product.SKU}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity Adjusters */}
                            <div className="flex items-center rounded-full border border-slate-200 p-1">
                              <button
                                onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                                className="rounded-full p-1 text-slate-500 hover:bg-slate-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="rounded-full p-1 text-slate-500 hover:bg-slate-50"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Price and delete actions */}
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-slate-900">₹{Number(price) * item.quantity}</span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {user && items.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-6 space-y-4">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200/65 pt-3">
                  <span>Order Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => toggleOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-gold-500 py-3 text-sm font-bold text-white shadow-lg hover:bg-gold-600 hover:shadow-xl transition-all"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
