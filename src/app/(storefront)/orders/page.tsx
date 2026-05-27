'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  Package
} from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/useAuthStore';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  SKU: string;
  images?: string[];
}

interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  discountPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  totalPrice: number;
  discountPrice: number;
  finalPrice: number;
  shippingAddress: {
    fullName: string;
    addressLine: string;
    city: string;
    stateName: string;
    zipCode: string;
  };
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, checkSession } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function init() {
      checkSession();
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiClient.get('/orders/my');
        // Sort orders by date descending
        const sortedOrders = (res.data || []).sort(
          (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to retrieve order history.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [checkSession]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusBadge = (status: Order['status']) => {
    const badges = {
      pending: {
        bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        icon: <Clock className="h-3 w-3 mr-1" />,
        label: 'Pending Approval'
      },
      paid: {
        bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
        label: 'Paid'
      },
      shipped: {
        bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        icon: <Truck className="h-3 w-3 mr-1" />,
        label: 'Shipped'
      },
      delivered: {
        bg: 'bg-green-500/10 text-green-500 border-green-500/20',
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
        label: 'Delivered'
      },
      cancelled: {
        bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        label: 'Cancelled'
      }
    };

    const currentBadge = badges[status] || badges.pending;

    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${currentBadge.bg}`}>
        {currentBadge.icon}
        {currentBadge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
          <p className="text-slate-400 text-sm font-semibold">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-slate-300 mb-6" />
        <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="mt-2 text-slate-500 text-sm">Please login to view your order history.</p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-500 px-8 py-3 text-sm font-bold text-white hover:bg-gold-600 transition-colors"
        >
          Login Account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
          <p className="text-sm text-slate-500 mt-1">Review and track your premium jewelry purchases.</p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-500 hover:text-gold-600 self-start sm:self-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-500">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
          <Package className="mx-auto h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Yet</h3>
          <p className="mt-1.5 text-slate-500 text-sm max-w-xs mx-auto">
            You haven't placed any orders yet. Discover our signature luxury pieces to begin.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center rounded-full bg-gold-500 px-8 py-3 text-sm font-bold text-white hover:bg-gold-600 shadow-md shadow-gold-500/10 transition-colors"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = !!expandedOrders[order.id];
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div 
                key={order.id} 
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Header/Summary Card */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-6 cursor-pointer border-b border-slate-100 hover:bg-slate-50/80 transition-colors select-none"
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:items-center sm:gap-10">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Order ID</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">#{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Date Placed</p>
                      <p className="text-sm font-medium text-slate-600 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {orderDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Amount</p>
                      <p className="text-sm font-extrabold text-slate-900 mt-0.5">₹{order.finalPrice}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Status</p>
                      <div className="mt-0.5">{getStatusBadge(order.status)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <span className="text-xs font-bold text-gold-500 flex items-center gap-1">
                      {isExpanded ? (
                        <>Hide Details <ChevronUp className="h-4 w-4" /></>
                      ) : (
                        <>View Details <ChevronDown className="h-4 w-4" /></>
                      )}
                    </span>
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100/60 bg-white space-y-6">
                    {/* Items List */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                        Ordered Items
                      </h4>
                      <div className="divide-y divide-slate-100">
                        {order.items.map((item) => {
                          const itemPrice = item.discountPrice || item.price;
                          return (
                            <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <img
                                  src={item.product?.images?.[0] || '/images/placeholder.png'}
                                  alt={item.product?.name || 'Jewelry Piece'}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>
                              <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                                <div>
                                  <h5 className="text-sm font-bold text-slate-900">
                                    {item.product?.name || 'Handcrafted Jewel'}
                                  </h5>
                                  <p className="mt-1 text-xs text-slate-400">SKU: {item.product?.SKU || 'N/A'}</p>
                                </div>
                                <div className="mt-2 sm:mt-0 flex items-center justify-between sm:justify-end gap-6">
                                  <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                                  <span className="text-sm font-bold text-slate-800">
                                    ₹{Number(itemPrice) * item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata: Shipping & Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      {/* Shipping Address */}
                      <div className="space-y-3 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gold-500" /> Shipping Address
                        </h4>
                        {order.shippingAddress ? (
                          <div className="text-sm text-slate-700 space-y-0.5">
                            <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.addressLine}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.stateName} - {order.shippingAddress.zipCode}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">No address provided</p>
                        )}
                      </div>

                      {/* Payment & Order Summary */}
                      <div className="space-y-3 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Payment & Bill Info
                        </h4>
                        <div className="space-y-2 text-xs font-semibold">
                          <div className="flex justify-between text-slate-500">
                            <span>Payment Method</span>
                            <span className="text-slate-850 uppercase font-bold">
                              {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-500 border-t border-slate-200/40 pt-2">
                            <span>Subtotal</span>
                            <span className="text-slate-900">₹{order.totalPrice}</span>
                          </div>
                          {Number(order.discountPrice) > 0 && (
                            <div className="flex justify-between text-red-500">
                              <span>Discount</span>
                              <span>-₹{order.discountPrice}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200/50 pt-2">
                            <span>Total Billed</span>
                            <span className="text-gold-600 text-base">₹{order.finalPrice}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
