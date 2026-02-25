import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen } from '@shared/ui';
import App from '../App';

const renderShellApp = (initialEntry = '/') =>
  renderWithProviders(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>
  );

describe('Shell App', () => {
  it('renders overview copy and navigation buttons on the root route', async () => {
    renderShellApp('/');

    expect(await screen.findByText(/Restoran əməliyyatlarına ümumi baxış/i)).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Go to Orders/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Go to Inventory/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Go to Meals/i })).toBeInTheDocument();
  });

  it('mounts the Orders remote when visiting /orders', async () => {
    renderShellApp('/orders');

    expect(await screen.findByTestId('orders-remote-stub')).toBeInTheDocument();
  });

  it('mounts the Inventory remote when visiting /inventory', async () => {
    renderShellApp('/inventory');

    expect(await screen.findByTestId('inventory-remote-stub')).toBeInTheDocument();
  });

  it('mounts the Meals remote when visiting /meals', async () => {
    renderShellApp('/meals');

    expect(await screen.findByTestId('meals-remote-stub')).toBeInTheDocument();
  });

  it('redirects unknown routes back to the overview', async () => {
    renderShellApp('/missing');

    expect(await screen.findByText(/Restoran əməliyyatlarına ümumi baxış/i)).toBeInTheDocument();
  });
});
