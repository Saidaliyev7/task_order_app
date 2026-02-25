import { create } from 'zustand';

const BASELINE_WEEKLY_ORDERS = 0;
const BASELINE_COMPLETED_ORDERS = 0;
const BASELINE_AVG_COMPLETION_MINUTES = 0;
const BASELINE_INGREDIENT_USAGE = 0;

export const OPERATIONS_METRIC_BASELINES = {
  weeklyOrders: BASELINE_WEEKLY_ORDERS,
  avgCompletionMinutes: BASELINE_AVG_COMPLETION_MINUTES,
  weeklyIngredientUsage: BASELINE_INGREDIENT_USAGE
};

export type OperationsMetricsState = {
  weeklyOrders: number;
  weeklyIngredientUsage: number;
  avgCompletionMinutes: number;
  completedOrders: number;
  totalCompletionMinutes: number;
  recordOrder: () => void;
  recordCompletion: (createdAt: string, deliveredAt: string) => void;
  recordIngredientUsage: (units: number) => void;
};

export const useOperationsMetrics = create<OperationsMetricsState>((set) => ({
  weeklyOrders: BASELINE_WEEKLY_ORDERS,
  weeklyIngredientUsage: BASELINE_INGREDIENT_USAGE,
  avgCompletionMinutes: BASELINE_AVG_COMPLETION_MINUTES,
  completedOrders: BASELINE_COMPLETED_ORDERS,
  totalCompletionMinutes: BASELINE_COMPLETED_ORDERS * BASELINE_AVG_COMPLETION_MINUTES,
  recordOrder: () =>
    set((state) => ({
      weeklyOrders: state.weeklyOrders + 1
    })),
  recordIngredientUsage: (units) =>
    set((state) => ({
      weeklyIngredientUsage: Math.max(0, state.weeklyIngredientUsage + Math.max(0, units))
    })),
  recordCompletion: (createdAt, deliveredAt) => {
    const createdMs = new Date(createdAt).getTime();
    const deliveredMs = new Date(deliveredAt).getTime();
    const diffMinutes = Math.max(1, Math.round((deliveredMs - createdMs) / 60000));

    set((state) => {
      const completedOrders = state.completedOrders + 1;
      const totalCompletionMinutes = state.totalCompletionMinutes + diffMinutes;
      return {
        completedOrders,
        totalCompletionMinutes,
        avgCompletionMinutes: Math.round(totalCompletionMinutes / completedOrders)
      };
    });
  }
}));
