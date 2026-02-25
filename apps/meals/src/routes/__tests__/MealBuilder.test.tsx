import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, within } from '@shared/ui';
import MealBuilder from '../MealBuilder';
import type { InventoryState, MealStoreState } from '@shared/utils';

const addMealMock = vi.fn();
const removeMealMock = vi.fn();

const inventoryState: InventoryState = {
  ingredients: [],
  consumeRecipe: vi.fn(),
  restock: vi.fn()
};

const mealStoreState: MealStoreState = {
  meals: [],
  addMeal: addMealMock,
  removeMeal: removeMealMock
};

vi.mock('@shared/utils', () => ({
  useInventoryStore: (selector: (state: typeof inventoryState) => unknown) =>
    selector(inventoryState),
  useMealStore: (selector: (state: typeof mealStoreState) => unknown) => selector(mealStoreState)
}));

const renderBuilder = () => renderWithProviders(<MealBuilder />);

describe('MealBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inventoryState.consumeRecipe = vi.fn();
    inventoryState.restock = vi.fn();
    inventoryState.ingredients = [
      { id: 'bun', label: 'Bun', unit: 'ədəd', quantity: 200 },
      { id: 'sauce', label: 'Sauce', unit: 'ml', quantity: 500 }
    ];
    mealStoreState.meals = [
      {
        id: 'burger',
        name: 'Burger',
        ingredients: { bun: 1, sauce: 1 },
        createdAt: '2026-02-01T00:00:00.000Z'
      }
    ];
    mealStoreState.addMeal = addMealMock;
    mealStoreState.removeMeal = removeMealMock;
  });

  it('validates the presence of a meal name before submission', () => {
    renderBuilder();

    fireEvent.click(screen.getByRole('button', { name: 'Yemək yarat' }));

    expect(screen.getByText('Yeməyin adını daxil et.')).toBeInTheDocument();
    expect(addMealMock).not.toHaveBeenCalled();
  });

  it('submits a meal definition and resets the form state', () => {
    renderBuilder();

    fireEvent.change(screen.getByLabelText('Yeməyin adı'), { target: { value: 'Shaurma' } });
    const bunRow = screen.getByText('Bun').closest('tr') as HTMLElement;
    const sauceRow = screen.getByText('Sauce').closest('tr') as HTMLElement;
    fireEvent.change(within(bunRow).getByRole('spinbutton'), { target: { value: '2' } });
    fireEvent.change(within(sauceRow).getByRole('spinbutton'), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Yemək yarat' }));

    expect(addMealMock).toHaveBeenCalledWith({
      name: 'Shaurma',
      ingredients: { bun: 2, sauce: 1 }
    });
    expect(screen.getByText('Yeni yemək yaratıldı və sistemə əlavə olundu.')).toBeInTheDocument();
    expect(screen.getByLabelText('Yeməyin adı')).toHaveValue('');
    expect(within(bunRow).getByRole('spinbutton')).toHaveValue(0);
    expect(screen.getByLabelText('Toplam ingredient setləri')).toHaveValue('0');
  });

  it('confirms before deleting an existing meal card', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderBuilder();

    fireEvent.click(screen.getByRole('button', { name: 'Yeməyi sil: Burger' }));

    expect(confirmSpy).toHaveBeenCalledWith('"Burger" reseptini silməyə əminsən?');
    expect(removeMealMock).toHaveBeenCalledWith('burger');
    expect(screen.getByText('"Burger" resepti silindi.')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});
