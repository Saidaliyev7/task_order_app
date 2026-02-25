import { describe, expect, it } from 'vitest';
import { useMealStore } from '../meal-store';

describe('useMealStore', () => {
  it('provides default meals', () => {
    const meals = useMealStore.getState().meals;
    expect(meals.length).toBeGreaterThan(0);
  });

  it('adds a new meal with sanitized data', () => {
    const initialLength = useMealStore.getState().meals.length;
    useMealStore.getState().addMeal({
      name: 'Test Meal',
      ingredients: { bun: 1.2 }
    });
    const meals = useMealStore.getState().meals;
    expect(meals.length).toBe(initialLength + 1);
    expect(meals[0].name).toBe('Test Meal');
    expect(meals[0].ingredients.bun).toBe(1);
  });
});
