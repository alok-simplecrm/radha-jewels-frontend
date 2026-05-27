'use client';

import { useState, useEffect } from 'react';
import { DollarSign, FileText, Users, AlertTriangle, RefreshCw } from 'lucide-react';
import apiClient from '../../../lib/api-client';

interface KPIs {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<KPIs | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/stats');
      setStats(response.data.kpis);
      setRecentOrders(response.data.recentOrders);
    } catch (err: any) {
      const message = err.response?.status === 401
        ? 'Session expired. Please log out and log in again to view dashboard data.'
        : err.response?.data?.message || 'Failed to load dashboard data from the server.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time jewelry platform analytics and statistics.</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-gold-500 hover:text-gold-500 transition-all"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-0.5">Dashboard is not connected to the database. Please ensure you are logged in as an admin.</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !stats ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
        </div>
      ) : !stats ? (
        <div className="flex h-64 flex-col items-center justify-center text-center rounded-2xl border border-slate-200/60 bg-white">
          <AlertTriangle className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">Unable to load dashboard</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Please log in with an admin account, then click Refresh to load real-time data from the database.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Sales Card */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₹{stats?.totalSales?.toLocaleString('en-IN')}</h3>
              </div>
              <div className="rounded-xl bg-gold-500/10 p-3 text-gold-500">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            {/* Orders Card */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalOrders}</h3>
              </div>
              <div className="rounded-xl bg-gold-500/10 p-3 text-gold-500">
                <FileText className="h-6 w-6" />
              </div>
            </div>

            {/* Customers Card */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Customers</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalCustomers}</h3>
              </div>
              <div className="rounded-xl bg-gold-500/10 p-3 text-gold-500">
                <Users className="h-6 w-6" />
              </div>
            </div>

            {/* Low Stock Card */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Alert</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.lowStockCount}</h3>
              </div>
              <div className={`rounded-xl p-3 ${stats?.lowStockCount && stats.lowStockCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-3">Order Number</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Placed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-800">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-slate-600">{order.customerName}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">₹{order.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          order.status === 'paid' ? 'bg-green-100 text-green-700' :
                          order.status === 'delivered' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
