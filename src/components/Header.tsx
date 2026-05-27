'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export default function Header() {
  const router = useRouter();
  const { user, logout, checkSession } = useAuthStore();
  const { items, fetchCart, toggleOpen } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const cartItemsCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 sm:hidden"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-start select-none">
            <span className="text-xl font-bold tracking-widest text-slate-900 sm:text-2xl">
              SHIVAYE <span className="text-gold-500">JEWELS</span>
            </span>
            <span className="text-[10px] tracking-[0.25em] text-slate-400 uppercase font-medium">Bespoke Fine Jewelry</span>
          </Link>

          {/* Navigation Links (Mega Menu style) */}
          <nav className="hidden space-x-8 sm:flex">
            <Link href="/products" className="text-sm font-semibold text-slate-700 hover:text-gold-500 transition-colors">
              Collections
            </Link>
            <Link href="/products?categoryId=rings" className="text-sm font-semibold text-slate-700 hover:text-gold-500 transition-colors">
              Rings
            </Link>
            <Link href="/products?categoryId=necklaces" className="text-sm font-semibold text-slate-700 hover:text-gold-500 transition-colors">
              Necklaces
            </Link>
            <Link href="/products?categoryId=earrings" className="text-sm font-semibold text-slate-700 hover:text-gold-500 transition-colors">
              Earrings
            </Link>
            <Link href="/products?isFeatured=true" className="text-sm font-semibold text-gold-500 hover:text-gold-600 transition-colors">
              Bestsellers ✨
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden max-w-xs flex-1 sm:block">
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 py-2 pl-4 pr-10 text-sm focus:border-gold-500 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gold-500">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* User & Cart actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Cart Icon */}
            <button
              onClick={() => toggleOpen(true)}
              className="relative rounded-full p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-1 rounded-full p-2 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <User className="h-6 w-6 text-slate-700" />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white py-2 shadow-lg ring-1 ring-black/5">
                      <div className="border-b border-slate-100 px-4 py-2">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                        </p>
                      </div>
                      
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <ShoppingBag className="h-4 w-4 text-gold-500" />
                        My Orders
                      </Link>

                      {(user.role === 'admin' || user.role === 'staff') && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <LayoutDashboard className="h-4 w-4 text-gold-500" />
                          Admin Console
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setShowProfileDropdown(false);
                          router.push('/');
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-slate-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-gold-500 hover:text-gold-500 transition-all"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative mb-4 w-full">
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 py-2 pl-4 pr-10 text-sm focus:border-gold-500 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="h-4 w-4" />
            </button>
          </form>

          <nav className="flex flex-col space-y-3">
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-gold-500"
            >
              Collections
            </Link>
            <Link
              href="/products?categoryId=rings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-gold-500"
            >
              Rings
            </Link>
            <Link
              href="/products?categoryId=necklaces"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-gold-500"
            >
              Necklaces
            </Link>
            <Link
              href="/products?categoryId=earrings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-gold-500"
            >
              Earrings
            </Link>
            <Link
              href="/products?isFeatured=true"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-gold-500"
            >
              Bestsellers ✨
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
