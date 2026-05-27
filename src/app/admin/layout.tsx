'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, LogOut, Gem, Package, Home, ShoppingBag, Users } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
      }
    } else if (user.role !== 'admin' && user.role !== 'staff') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 flex flex-col justify-between p-4 flex-shrink-0 text-slate-200">
        <div className="space-y-6">
          <Link href="/" className="flex flex-col items-start px-2 py-3">
            <span className="text-lg font-bold tracking-widest text-white flex items-center gap-1.5 uppercase">
              <Gem className="h-5 w-5 text-gold-500" />
              SHIVAYE <span className="text-gold-500">JEWELS</span>
            </span>
            <span className="text-[9px] tracking-widest text-slate-500 uppercase mt-0.5">Admin Management</span>
          </Link>

          <nav className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-gold-500" />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Package className="h-4 w-4 text-gold-500" />
              Products CRUD
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Users className="h-4 w-4 text-gold-500" />
              Users & Sessions
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-gold-500" />
              Orders Management
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4 text-gold-500" />
              View Storefront
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-900 pt-4">
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 hover:bg-slate-900 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
