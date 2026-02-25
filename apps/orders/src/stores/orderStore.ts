import { create } from 'zustand';
import { useOperationsMetrics, type MealId } from '@shared/utils';

export type OrderStatus = 'preparing' | 'delivering' | 'delivered';

export type OrderHistoryEntry = {
  id: string;
  status: OrderStatus;
  message: string;
  timestamp: string;
};

export type OrderEntry = {
  id: string;
  customer: string;
  quantity: number;
  priority: 'low' | 'standard' | 'urgent';
  status: OrderStatus;
  createdAt: string;
  product: MealId;
  history: OrderHistoryEntry[];
};

type OrderCompletionPayload = {
  createdAt: string;
  deliveredAt: string;
};

export type OrderStoreState = {
  orders: OrderEntry[];
  addOrder: (
    entry: Omit<OrderEntry, 'id' | 'createdAt' | 'status' | 'history'> & { status?: OrderStatus }
  ) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
};

export const useOrderStore = create<OrderStoreState>((set, get) => ({
  orders: [],
  addOrder: (entry) => {
    set((state) => ({
      orders: [
        {
          id: crypto.randomUUID(),
          status: entry.status ?? 'preparing',
          createdAt: new Date().toString(),
          ...entry,
          history: [
            {
              id: crypto.randomUUID(),
              status: entry.status ?? 'preparing',
              timestamp: new Date().toString(),
              message: `Sifariş yaratıldı (${entry.product})`
            }
          ]
        },
        ...state.orders
      ]
    }));
    useOperationsMetrics.getState().recordOrder();
  },
  updateStatus: (id, status) => {
    const { orders } = get();
    let completionPayload: OrderCompletionPayload | null = null;
    const nextOrders = orders.map((order) => {
      if (order.id !== id) return order;
      const timestamp = new Date().toString();
      if (status === 'delivered' && order.status !== 'delivered') {
        completionPayload = { createdAt: order.createdAt, deliveredAt: timestamp };
      }
      return {
        ...order,
        status,
        history: [
          {
            id: crypto.randomUUID(),
            status,
            timestamp,
            message: `Status yeniləndi: ${status}`
          },
          ...order.history
        ]
      };
    });
    set({ orders: nextOrders });
    if (completionPayload) {
      const { createdAt, deliveredAt } = completionPayload;
      useOperationsMetrics.getState().recordCompletion(createdAt, deliveredAt);
    }
  }
}));
