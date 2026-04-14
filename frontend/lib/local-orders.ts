import { Order } from '@/types';

const getStorageKey = (userId: number) => `lawra_orders_${userId}`;

export function loadUserOrders(userId: number): Order[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(getStorageKey(userId));
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as Order[];
  } catch (error) {
    console.error('Failed to parse order history from localStorage', error);
    return [];
  }
}

export function saveUserOrder(userId: number, order: Order): void {
  if (typeof window === 'undefined') {
    return;
  }

  const orders = loadUserOrders(userId);
  localStorage.setItem(getStorageKey(userId), JSON.stringify([order, ...orders]));
}

export function clearUserOrders(userId: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(getStorageKey(userId));
}
