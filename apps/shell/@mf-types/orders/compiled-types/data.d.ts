export type Order = {
  id: string;
  customer: string;
  status: 'Pending' | 'Preparing' | 'Fulfilled';
  eta: string;
  total: number;
};
export declare const orders: Order[];
