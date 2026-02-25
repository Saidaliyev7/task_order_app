import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, waitFor } from '@shared/ui';
import { OrderForm } from '../OrderForm';
import type { InventoryState, MealStoreState } from '@shared/utils';
import type { OrderStoreState } from '../../stores/orderStore';

const navigateMock = vi.fn();

const orderStoreState: OrderStoreState = {
  orders: [],
  addOrder: vi.fn(),
  updateStatus: vi.fn()
};

const mealStoreState: MealStoreState = {
  meals: [],
  addMeal: vi.fn(),
  removeMeal: vi.fn()
};

const inventoryStoreState: InventoryState = {
  ingredients: [],
  consumeRecipe: vi.fn(),
  restock: vi.fn()
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('../../stores/orderStore', () => ({
  useOrderStore: (selector: (state: typeof orderStoreState) => unknown) => selector(orderStoreState)
}));

vi.mock('@shared/utils', () => ({
  useMealStore: (selector: (state: typeof mealStoreState) => unknown) => selector(mealStoreState),
  useInventoryStore: (selector: (state: typeof inventoryStoreState) => unknown) =>
    selector(inventoryStoreState)
}));

const renderForm = () => renderWithProviders(<OrderForm />);

describe('OrderForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mealStoreState.meals = [];
    mealStoreState.addMeal = vi.fn();
    mealStoreState.removeMeal = vi.fn();
    inventoryStoreState.consumeRecipe = vi.fn();
    inventoryStoreState.restock = vi.fn();
    inventoryStoreState.ingredients = [];
    orderStoreState.orders = [];
    orderStoreState.addOrder = vi.fn();
    orderStoreState.updateStatus = vi.fn();
  });

  it('disables product selection and guides the user when no meals exist', () => {
    renderForm();

    expect(screen.getByLabelText('Məhsul')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Əvvəlcə Meals tətbiqində yeni yemək yaratın.')).toBeInTheDocument();
  });

  it('shows an inventory error when stock is insufficient', async () => {
    mealStoreState.meals = [
      {
        id: 'burger',
        name: 'Burger',
        ingredients: { bun: 1 },
        createdAt: '2026-02-01T00:00:00.000Z'
      }
    ];
    inventoryStoreState.consumeRecipe = vi.fn().mockReturnValue(false);

    renderForm();

    fireEvent.change(screen.getByLabelText('Müştərinin adı'), { target: { value: 'Ali' } });
    fireEvent.change(screen.getByLabelText('Miqdar'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sifariş et' }));

    await waitFor(() => {
      expect(screen.getByText('Anbarda kifayət qədər ingredient yoxdur.')).toBeInTheDocument();
    });
    expect(inventoryStoreState.consumeRecipe).toHaveBeenCalledWith('burger', 2);
    expect(orderStoreState.addOrder).not.toHaveBeenCalled();
  });

  it('submits a valid order and navigates back', async () => {
    mealStoreState.meals = [
      {
        id: 'burger',
        name: 'Burger',
        ingredients: { bun: 1 },
        createdAt: '2026-02-01T00:00:00.000Z'
      }
    ];
    inventoryStoreState.consumeRecipe = vi.fn().mockReturnValue(true);
    orderStoreState.orders = [
      {
        id: 'SO-1',
        customer: 'Customer 1',
        product: 'burger',
        quantity: 1,
        priority: 'standard',
        status: 'preparing',
        createdAt: '2026-02-20T10:00:00.000Z',
        history: []
      }
    ];

    renderForm();

    fireEvent.change(screen.getByLabelText('Müştərinin adı'), { target: { value: 'Nigar' } });
    fireEvent.change(screen.getByLabelText('Miqdar'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sifariş et' }));

    await waitFor(() => {
      expect(orderStoreState.addOrder).toHaveBeenCalledWith({
        customer: 'Nigar',
        quantity: 3,
        priority: 'standard',
        product: 'burger'
      });
    });
    expect(inventoryStoreState.consumeRecipe).toHaveBeenCalledWith('burger', 3);
    expect(navigateMock).toHaveBeenCalledWith('..');
  });
});
