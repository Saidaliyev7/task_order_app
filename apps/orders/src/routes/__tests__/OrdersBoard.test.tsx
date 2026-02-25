import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, within } from '@shared/ui';
import { OrdersBoard } from '../OrdersBoard';
import type { MealStoreState } from '@shared/utils';
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

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('../../stores/orderStore', () => ({
  useOrderStore: (selector: (state: typeof orderStoreState) => unknown) => selector(orderStoreState)
}));

vi.mock('@shared/utils', () => ({
  useMealStore: (selector: (state: typeof mealStoreState) => unknown) => selector(mealStoreState)
}));

const renderBoard = () => renderWithProviders(<OrdersBoard />);

describe('OrdersBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderStoreState.orders = [];
    orderStoreState.addOrder = vi.fn();
    orderStoreState.updateStatus = vi.fn();
    mealStoreState.meals = [
      {
        id: 'burger',
        name: 'Burger',
        ingredients: { bun: 1 },
        createdAt: '2026-02-01T00:00:00.000Z'
      }
    ];
    mealStoreState.addMeal = vi.fn();
    mealStoreState.removeMeal = vi.fn();
  });

  it('shows an empty state when there are no orders and links to the form', () => {
    renderBoard();

    expect(screen.getByText('Hələ sifariş əlavə edilməyib.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create order' }));
    expect(navigateMock).toHaveBeenCalledWith('new');
  });

  it('lists orders and updates their status via the dialog', async () => {
    orderStoreState.orders = [
      {
        id: 'SO-2001',
        customer: 'Acme Retail',
        product: 'burger',
        quantity: 2,
        priority: 'urgent',
        status: 'preparing',
        createdAt: '2026-02-24T12:00:00.000Z',
        history: [
          {
            id: 'entry-1',
            status: 'preparing',
            message: 'Sifariş yaratıldı',
            timestamp: '2026-02-24T12:00:00.000Z'
          }
        ]
      }
    ];

    renderBoard();

    expect(screen.getByText('Acme Retail')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Status / Log' }));
    expect(screen.getByText('Sifariş statusu')).toBeInTheDocument();

    const statusSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(statusSelect);
    const listbox = await screen.findByRole('listbox');
    fireEvent.click(within(listbox).getByText('Tamamlandı'));

    fireEvent.click(screen.getByRole('button', { name: 'Yadda saxla' }));

    expect(orderStoreState.updateStatus).toHaveBeenCalledWith('SO-2001', 'delivered');
  });
});
