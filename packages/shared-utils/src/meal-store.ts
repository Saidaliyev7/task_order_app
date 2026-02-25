import { create } from 'zustand';
import type { IngredientId } from './ingredients';

export type MealId = string;

export type MealDefinition = {
  id: MealId;
  name: string;
  ingredients: Partial<Record<IngredientId, number>>;
  createdAt: string;
};

const defaultMeals: MealDefinition[] = [
  {
    id: 'burger',
    name: 'Burger',
    ingredients: {
      bun: 1,
      patty: 1,
      cheese: 1,
      lettuce: 1,
      sauce: 1
    },
    createdAt: new Date().toString()
  },
  {
    id: 'pizza',
    name: 'Pizza',
    ingredients: {
      cheese: 2,
      sauce: 1,
      dough: 1,
      pepperoni: 6
    },
    createdAt: new Date().toString()
  }
];

export type MealStoreState = {
  meals: MealDefinition[];
  addMeal: (payload: { name: string; ingredients: Partial<Record<IngredientId, number>> }) => void;
  removeMeal: (id: MealId) => void;
};

const generateId = (name: string, existingIds: Set<string>) => {
  const slug =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'meal';
  if (!existingIds.has(slug)) {
    return slug;
  }
  let index = 2;
  let next = `${slug}-${index}`;
  while (existingIds.has(next)) {
    index += 1;
    next = `${slug}-${index}`;
  }
  return next;
};

const sanitizeIngredients = (ingredients: Partial<Record<IngredientId, number>>) =>
  Object.entries(ingredients).reduce<Partial<Record<IngredientId, number>>>((acc, [key, value]) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return acc;
    }
    acc[key as IngredientId] = Math.round(numericValue);
    return acc;
  }, {});

export const useMealStore = create<MealStoreState>((set) => ({
  meals: defaultMeals,
  addMeal: ({ name, ingredients }) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    set((state) => {
      const normalizedIngredients = sanitizeIngredients(ingredients);
      if (Object.keys(normalizedIngredients).length === 0) {
        return state;
      }
      const existingIds = new Set(state.meals.map((meal) => meal.id));
      const id = generateId(trimmedName, existingIds);
      const nextMeal: MealDefinition = {
        id,
        name: trimmedName,
        ingredients: normalizedIngredients,
        createdAt: new Date().toString()
      };
      return {
        meals: [nextMeal, ...state.meals]
      };
    });
  },
  removeMeal: (id) => {
    set((state) => ({
      meals: state.meals.filter((meal) => meal.id !== id)
    }));
  }
}));

export const getMealMap = () => {
  const map: Record<MealId, Partial<Record<IngredientId, number>>> = {};
  useMealStore.getState().meals.forEach((meal) => {
    map[meal.id] = meal.ingredients;
  });
  return map;
};

export const getMealName = (mealId: MealId) =>
  useMealStore.getState().meals.find((meal) => meal.id === mealId)?.name ?? mealId;
