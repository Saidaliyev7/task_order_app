import { create } from 'zustand';
import { useOperationsMetrics } from './operations-metrics';
import { ingredientSpecs, type IngredientId } from './ingredients';
import { useMealStore, type MealId } from './meal-store';

export type IngredientStock = {
  id: IngredientId;
  label: string;
  unit: string;
  quantity: number;
};

export type InventoryState = {
  ingredients: IngredientStock[];
  consumeRecipe: (recipeName: MealId, count?: number) => boolean;
  restock: (id: IngredientId, amount: number) => void;
};

const initialStock: IngredientStock[] = ingredientSpecs.map((spec) => ({
  id: spec.id,
  label: spec.label,
  unit: spec.unit,
  quantity: spec.initialQuantity
}));

export const useInventoryStore = create<InventoryState>((set, get) => ({
  ingredients: initialStock,
  consumeRecipe: (recipeName, count = 1) => {
    const recipe =
      useMealStore.getState().meals.find((meal) => meal.id === recipeName)?.ingredients ?? null;
    if (!recipe || Object.keys(recipe).length === 0) {
      return false;
    }
    const current = get().ingredients;
    const canFulfill = Object.entries(recipe).every(([ingredientId, required]) => {
      if (required === 0) return true;
      const stock = current.find((item) => item.id === ingredientId);
      return stock && stock.quantity >= required * count;
    });
    if (!canFulfill) {
      return false;
    }
    set((state) => ({
      ingredients: state.ingredients.map((item) => {
        const required = recipe[item.id] ?? 0;
        if (!required) return item;
        return { ...item, quantity: item.quantity - required * count };
      })
    }));
    const usedUnits = Object.entries(recipe).reduce((total, [, amount]) => {
      if (!amount) return total;
      return total + amount * count;
    }, 0);
    if (usedUnits > 0) {
      useOperationsMetrics.getState().recordIngredientUsage(usedUnits);
    }
    return true;
  },
  restock: (id, amount) =>
    set((state) => ({
      ingredients: state.ingredients.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + amount } : item
      )
    }))
}));
