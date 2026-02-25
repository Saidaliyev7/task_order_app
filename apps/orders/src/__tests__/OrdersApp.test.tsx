import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen } from '@shared/ui';
import OrdersApp from '../App';

const boardTestId = 'orders-board-route';
const formTestId = 'orders-form-route';
const detailsTestId = 'orders-details-route';

vi.mock('../routes/OrdersBoard', () => ({
  OrdersBoard: () => <div data-testid={boardTestId}>Orders board route</div>
}));

vi.mock('../routes/OrderForm', () => ({
  OrderForm: () => <div data-testid={formTestId}>Orders form route</div>
}));

vi.mock('../routes/OrderDetails', () => ({
  OrderDetails: () => <div data-testid={detailsTestId}>Orders details route</div>
}));

const renderOrdersApp = (initialEntry = '/') =>
  renderWithProviders(
    <MemoryRouter initialEntries={[initialEntry]}>
      <OrdersApp />
    </MemoryRouter>
  );

describe('OrdersApp', () => {
  it('renders the orders board on the index route', async () => {
    renderOrdersApp('/');

    expect(await screen.findByTestId(boardTestId)).toBeInTheDocument();
  });

  it('renders the order form when navigating to /new', async () => {
    renderOrdersApp('/new');

    expect(await screen.findByTestId(formTestId)).toBeInTheDocument();
  });

  it('renders order details when navigating to a specific order id', async () => {
    renderOrdersApp('/1234');

    expect(await screen.findByTestId(detailsTestId)).toBeInTheDocument();
  });

  it('redirects unknown routes back to the board', async () => {
    renderOrdersApp('/missing/path');

    expect(await screen.findByTestId(boardTestId)).toBeInTheDocument();
  });
});
