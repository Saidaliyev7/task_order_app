import { z } from 'zod';
declare const schema: z.ZodObject<
  {
    customer: z.ZodString;
    quantity: z.ZodNumber;
    priority: z.ZodEnum<['low', 'standard', 'urgent']>;
  },
  'strip',
  z.ZodTypeAny,
  {
    customer: string;
    quantity: number;
    priority: 'low' | 'standard' | 'urgent';
  },
  {
    customer: string;
    quantity: number;
    priority: 'low' | 'standard' | 'urgent';
  }
>;
export type OrderFormInput = z.infer<typeof schema>;
export declare const OrderForm: () => import('react/jsx-runtime').JSX.Element;
export {};
