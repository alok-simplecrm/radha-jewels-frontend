'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  Search, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  User,
  ArrowUpDown,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import apiClient from '@/lib/api-client';

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
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/orders');
      // Sort orders by date descending
      const sortedOrders = (res.data || []).sort(
        (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setError('');
    setSuccessMsg('');
    setUpdatingId(orderId);
    try {
      const response = await apiClient.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: response.data.status || newStatus } : order
        )
      );

      setSuccessMsg(`Order #${orders.find(o => o.id === orderId)?.orderNumber} status updated successfully to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusColor = (status: Order['status']) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return styles[status] || styles.pending;
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const term = searchQuery.toLowerCase().trim();
    if (!term) return matchesStatus;

    const matchesNumber = order.orderNumber.toLowerCase().includes(term);
    const matchesUserEmail = order.user?.email?.toLowerCase().includes(term) || false;
    const matchesUserFirstName = order.user?.firstName?.toLowerCase().includes(term) || false;
    const matchesUserLastName = order.user?.lastName?.toLowerCase().includes(term) || false;
    const matchesShippingName = order.shippingAddress?.fullName?.toLowerCase().includes(term) || false;

    return matchesStatus && (matchesNumber || matchesUserEmail || matchesUserFirstName || matchesUserLastName || matchesShippingName);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor storefront checkouts, view shipping details, and process order status flows.
          </p>
        </div>
        <button 
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh Orders
        </button>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-50 p-4 text-sm font-semibold text-red-800 flex items-center gap-2 shadow-sm animate-fade-in">
          <AlertCircle className="h-4 w-4 text-red-600" />
          {error}
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by order ID, email, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-gold-500 focus:outline-none"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-semibold text-slate-450 whitespace-nowrap">Filter Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold focus:border-gold-500 focus:outline-none bg-white text-slate-700"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Container */}
      {loading && orders.length === 0 ? (
        <div className="flex h-64 items-center justify-center bg-white rounded-xl border border-slate-200">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
            <p className="text-slate-400 text-sm font-semibold">Loading orders catalog...</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center bg-white rounded-xl border border-slate-200 p-8">
          <ShoppingBag className="h-12 w-12 text-slate-350 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Orders Found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm">
            Try adjusting your search criteria or change the status filter dropdown.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = !!expandedOrders[order.id];
            const isUpdating = updatingId === order.id;
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={order.id} 
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300"
              >
                {/* Header overview */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 cursor-pointer border-b border-slate-100 hover:bg-slate-50/50 transition-colors select-none"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Order ID</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">#{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Customer</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate max-w-[150px]">
                        {order.shippingAddress?.fullName || (order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Placed At</p>
                      <p className="text-xs font-semibold text-slate-650 mt-0.5">{orderDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Billed Total</p>
                      <p className="text-sm font-extrabold text-gold-600 mt-0.5">₹{order.finalPrice}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 self-stretch lg:self-center">
                    {/* Status badge */}
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>

                    {/* Expand trigger */}
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      {isExpanded ? (
                        <>Collapse <ChevronUp className="h-4 w-4" /></>
                      ) : (
                        <>Manage <ChevronDown className="h-4 w-4" /></>
                      )}
                    </span>
                  </div>
                </div>

                {/* Collapsible content */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/20 space-y-6">
                    
                    {/* Customer Profile & Shipping Details */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* Customer Info */}
                      <div className="md:col-span-4 space-y-3 bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <User className="h-3.5 w-3.5 text-gold-550" /> Customer Account
                        </h4>
                        {order.user ? (
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-slate-900">
                              {order.user.firstName} {order.user.lastName}
                            </p>
                            <p className="text-xs text-slate-600 flex items-center gap-1.5">
                              <Mail className="h-3 w-3 text-slate-400" />
                              {order.user.email}
                            </p>
                            <span className="inline-block text-[10px] bg-slate-100 rounded px-2 py-0.5 font-bold uppercase text-slate-500">
                              Registered User
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">Guest Checkout</p>
                        )}
                      </div>

                      {/* Shipping address details */}
                      <div className="md:col-span-5 space-y-3 bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <MapPin className="h-3.5 w-3.5 text-gold-550" /> Shipping Details
                        </h4>
                        {order.shippingAddress ? (
                          <div className="text-sm text-slate-700 space-y-0.5">
                            <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.addressLine}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.stateName} - {order.shippingAddress.zipCode}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">No address details available</p>
                        )}
                      </div>

                      {/* Status changer action */}
                      <div className="md:col-span-3 space-y-3 bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                            Update Order Status
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Set status to notify the client and adjust inventory records.
                          </p>
                        </div>
                        <div className="relative mt-2">
                          <select
                            disabled={isUpdating}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-gold-500 focus:outline-none disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {isUpdating && (
                            <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-gold-500" />
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Ordered Items Table list */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Items Summary
                        </h4>
                      </div>
                      <div className="divide-y divide-slate-100 px-4">
                        {order.items.map((item) => {
                          const itemPrice = item.discountPrice || item.price;
                          return (
                            <div key={item.id} className="flex gap-4 py-4 first:pt-4 last:pb-4">
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <img
                                  src={item.product?.images?.[0] || '/images/placeholder.png'}
                                  alt={item.product?.name || 'Jewelry Piece'}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>
                              <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                                <div>
                                  <h5 className="text-xs font-bold text-slate-900">
                                    {item.product?.name || 'Bespoke Jewel'}
                                  </h5>
                                  <p className="text-[10px] text-slate-400">SKU: {item.product?.SKU || 'N/A'}</p>
                                </div>
                                <div className="mt-2 sm:mt-0 flex items-center justify-between sm:justify-end gap-6">
                                  <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                                  <span className="text-xs text-slate-500">Price: ₹{itemPrice}</span>
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

                    {/* Bill Breakdown */}
                    <div className="flex justify-end">
                      <div className="w-full max-w-xs space-y-1.5 text-xs bg-white rounded-xl border border-slate-250 p-4 shadow-sm font-semibold">
                        <div className="flex justify-between text-slate-500">
                          <span>Subtotal Price</span>
                          <span className="text-slate-800">₹{order.totalPrice}</span>
                        </div>
                        {Number(order.discountPrice) > 0 && (
                          <div className="flex justify-between text-red-500">
                            <span>Promo Discount</span>
                            <span>-₹{order.discountPrice}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200/50 pt-2">
                          <span>Total Amount</span>
                          <span className="text-gold-650 text-base">₹{order.finalPrice}</span>
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
