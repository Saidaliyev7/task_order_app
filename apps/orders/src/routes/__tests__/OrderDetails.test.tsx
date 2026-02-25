import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen } from '@shared/ui';
import { OrderDetails } from '../OrderDetails';

const navigateMock = vi.fn();
const useParamsMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useParams: () => useParamsMock()
}));

const renderDetails = () => renderWithProviders(<OrderDetails />);

describe('OrderDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the matching order when the ID exists', () => {
    useParamsMock.mockReturnValue({ orderId: 'SO-1024' });

    renderDetails();

    expect(screen.getByText('SO-1024')).toBeInTheDocument();
    expect(screen.getByText('Customer: Acme Retail')).toBeInTheDocument();
    expect(screen.getByText('$1,280')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
    expect(navigateMock).toHaveBeenCalledWith('..');
  });

  it('shows a fallback state when the order cannot be found', () => {
    useParamsMock.mockReturnValue({ orderId: 'missing' });

    renderDetails();

    expect(screen.getByText('Order Tapilmadi')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
    expect(navigateMock).toHaveBeenCalledWith('..');
  });
});
