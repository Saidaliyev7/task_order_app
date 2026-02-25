export type OrderEntry = {
  id: string;
  customer: string;
  quantity: number;
  priority: 'low' | 'standard' | 'urgent';
  createdAt: string;
};
export type OrderStoreState = {
  orders: OrderEntry[];
  addOrder: (entry: Omit<OrderEntry, 'id' | 'createdAt'>) => void;
};
export declare const useOrderStore: import('zustand').UseBoundStore<
  import('zustand').StoreApi<OrderStoreState>
>;
