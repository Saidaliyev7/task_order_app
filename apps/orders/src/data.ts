export type Order = {
  id: string;
  customer: string;
  status: 'Pending' | 'Preparing' | 'Fulfilled';
  eta: string;
  total: number;
};

export const orders: Order[] = [
  { id: 'SO-1024', customer: 'Acme Retail', status: 'Preparing', eta: '2h 10m', total: 1280 },
  { id: 'SO-1025', customer: 'Lumen Store', status: 'Pending', eta: '4h 30m', total: 940 },
  {
    id: 'SO-1026',
    customer: 'West Coast Foods',
    status: 'Fulfilled',
    eta: 'Delivered',
    total: 2310
  }
];
