import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, waitFor, within } from '@shared/ui';
import { ReplenishmentPlan } from '../ReplenishmentPlan';
import type { InventoryState, MealStoreState } from '@shared/utils';

const navigateMock = vi.fn();
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

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('@shared/utils', () => ({
  useInventoryStore: (selector: (state: typeof inventoryState) => unknown) =>
    selector(inventoryState),
  useMealStore: (selector: (state: typeof mealState) => unknown) => selector(mealState)
}));

const renderPlan = () => renderWithProviders(<ReplenishmentPlan />);

describe('ReplenishmentPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inventoryState.consumeRecipe = vi.fn();
    inventoryState.ingredients = [
      { id: 'bun', label: 'Bun', unit: 'ədəd', quantity: 0 },
      { id: 'lettuce', label: 'Lettuce', unit: 'ədəd', quantity: 0 }
    ];
    inventoryState.restock = restockMock;
    mealState.meals = [
      {
        id: 'burger',
        name: 'Burger',
        ingredients: { bun: 3, lettuce: 1 },
        createdAt: '2026-02-01T00:00:00.000Z'
      }
    ];
    mealState.addMeal = vi.fn();
    mealState.removeMeal = vi.fn();
  });

  it('shows empty meal guidance when there are no recipes', () => {
    mealState.meals = [];

    renderPlan();

    expect(screen.getByText('Əvvəlcə Meals tətbiqində resept yaratın.')).toBeInTheDocument();
    expect(screen.getByLabelText('Yemək')).toHaveAttribute('aria-disabled', 'true');
  });

  it('prevents submission when shortages are not fully covered', async () => {
    renderPlan();

    fireEvent.change(screen.getByLabelText('Planlaşdırılan miqdar'), { target: { value: '2' } });

    const bunRow = (await screen.findByText('Bun')).closest('tr') as HTMLElement;
    const bunInput = within(bunRow).getByDisplayValue('6');
    fireEvent.change(bunInput, { target: { value: '0' } });

    fireEvent.click(screen.getByRole('button', { name: 'Restok tətbiq et' }));

    expect(
      screen.getByText(
        'Zəhmət olmasa bütün çatışmazlıqlar üçün minimum lazım olan miqdarı daxil edin.'
      )
    ).toBeInTheDocument();
    expect(restockMock).not.toHaveBeenCalled();
  });

  it('restocks every ingredient with rounded amounts when shortages are satisfied', async () => {
    renderPlan();

    fireEvent.change(screen.getByLabelText('Planlaşdırılan miqdar'), { target: { value: '2' } });

    const bunRow = (await screen.findByText('Bun')).closest('tr') as HTMLElement;
    const lettuceRow = screen.getByText('Lettuce').closest('tr') as HTMLElement;

    const bunInput = within(bunRow).getByDisplayValue('6');
    const lettuceInput = within(lettuceRow).getByDisplayValue('2');
    fireEvent.change(bunInput, { target: { value: '6.6' } });
    fireEvent.change(lettuceInput, { target: { value: '2.4' } });
    expect(bunInput).toHaveValue(6.6);
    expect(lettuceInput).toHaveValue(2.4);

    const form = screen.getByText('Restok tətbiq et').closest('form') as HTMLFormElement;
    fireEvent.submit(form);

    await screen.findByText('Seçilmiş ingredientlər üçün stok artırıldı.');
    expect(restockMock).toHaveBeenCalledTimes(2);
    expect(restockMock).toHaveBeenNthCalledWith(1, 'bun', 7);
    expect(restockMock).toHaveBeenNthCalledWith(2, 'lettuce', 2);
  });
});
