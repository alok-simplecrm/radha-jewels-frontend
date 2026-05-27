import { create } from 'zustand';
import apiClient from '../lib/api-client';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images?: string[];
    SKU: string;
    stockQuantity: number;
  };
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  total: number;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  toggleOpen: (open?: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  total: 0,
  isOpen: false,
  loading: false,
  error: null,

  toggleOpen: (open) => {
    set({ isOpen: open !== undefined ? open : !get().isOpen });
  },

  fetchCart: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/cart');
      const { cart, subtotal, total } = response.data;
      set({ items: cart.items || [], subtotal, total, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch cart', loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post('/cart/items', { productId, quantity });
      set({ loading: false });
      await get().fetchCart();
      set({ isOpen: true });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to add item to cart', loading: false });
      throw err;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ loading: true, error: null });
    try {
      await apiClient.patch(`/cart/items/${itemId}`, { quantity });
      set({ loading: false });
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update item quantity', loading: false });
      throw err;
    }
  },

  removeItem: async (itemId) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/cart/items/${itemId}`);
      set({ loading: false });
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to remove item', loading: false });
      throw err;
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete('/cart');
      set({ items: [], subtotal: 0, total: 0, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to clear cart', loading: false });
    }
  },
}));
