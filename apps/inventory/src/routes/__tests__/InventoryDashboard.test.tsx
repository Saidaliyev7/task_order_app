import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, within } from '@shared/ui';
import { InventoryDashboard } from '../InventoryDashboard';
import type { InventoryState, MealStoreState } from '@shared/utils';

const restockMock = vi.fn();

const inventoryState: InventoryState = {
  ingredients: [],
  consumeRecipe: vi.fn(),
  restock: restockMock
};

const mealState: MealStoreState = {
  meals: [],
  addMeal: vi.fn(),
  removeMeal: vi.fn()
};

vi.mock('@shared/utils', () => ({
  useInventoryStore: (selector: (state: typeof inventoryState) => unknown) =>
    selector(inventoryState),
  useMealStore: (selector: (state: typeof mealState) => unknown) => selector(mealState)
}));

const renderDashboard = () => renderWithProviders(<InventoryDashboard />);

describe('InventoryDashboard', () => {
  beforeEach(() => {
    restockMock.mockReset();
    inventoryState.consumeRecipe = vi.fn();
    inventoryState.ingredients = [
      { id: 'bun', label: 'Buns', unit: 'ədəd', quantity: 100 },
      { id: 'patty', label: 'Patties', unit: 'ədəd', quantity: 45 }
    ];
    inventoryState.restock = restockMock;
    mealState.meals = [
      {
        id: 'burger',
        name: 'Burger',
        ingredients: { bun: 2, patty: 1 },
        createdAt: '2026-02-01T00:00:00.000Z'
      },
      {
        id: 'kebab',
        name: 'Kebab',
        ingredients: { bun: 1 },
        createdAt: '2026-02-02T00:00:00.000Z'
      }
    ];
    mealState.addMeal = vi.fn();
    mealState.removeMeal = vi.fn();
  });

  it('shows capacity cards for each recipe based on available ingredients', () => {
    renderDashboard();

    const burgerCard = screen.getByText('Burger').parentElement?.parentElement as HTMLElement;
    expect(burgerCard).toHaveTextContent('45');

    const kebabCard = screen.getByText('Kebab').parentElement?.parentElement as HTMLElement;
    expect(kebabCard).toHaveTextContent('100');
  });
});
