export type StockItem = {
  id: string;
  resource: string;
  available: number;
  reorderLimit: number;
  unit: string;
};
export declare const stockItems: StockItem[];
