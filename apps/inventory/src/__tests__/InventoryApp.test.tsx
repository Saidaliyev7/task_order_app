import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen } from '@shared/ui';
import InventoryApp from '../App';

const inventoryDashboardTestId = 'inventory-dashboard-route';
const replenishmentPlanTestId = 'replenishment-plan-route';

vi.mock('../routes/InventoryDashboard', () => ({
  InventoryDashboard: () => (
    <div data-testid={inventoryDashboardTestId}>Inventory dashboard mock</div>
  )
}));

vi.mock('../routes/ReplenishmentPlan', () => ({
  ReplenishmentPlan: () => <div data-testid={replenishmentPlanTestId}>Replenishment plan mock</div>
}));

const renderInventoryApp = (initialEntry = '/') =>
  renderWithProviders(
    <MemoryRouter initialEntries={[initialEntry]}>
      <InventoryApp />
    </MemoryRouter>
  );

describe('InventoryApp', () => {
  it('renders replenishment plan CTA that links to plan route', () => {
    renderInventoryApp();

    const planCta = screen.getByRole('link', { name: /Stoku artır/i });
    expect(planCta).toBeInTheDocument();
    expect(planCta).toHaveAttribute('href', '/plan');
  });

  it('mounts the dashboard route for index paths', async () => {
    renderInventoryApp('/');

    expect(await screen.findByTestId(inventoryDashboardTestId)).toBeInTheDocument();
  });

  it('mounts the replenishment plan route when navigated to /plan', async () => {
    renderInventoryApp('/plan');

    expect(await screen.findByTestId(replenishmentPlanTestId)).toBeInTheDocument();
  });

  it('redirects unknown routes back to the dashboard', async () => {
    renderInventoryApp('/missing');

    expect(await screen.findByTestId(inventoryDashboardTestId)).toBeInTheDocument();
  });
});
