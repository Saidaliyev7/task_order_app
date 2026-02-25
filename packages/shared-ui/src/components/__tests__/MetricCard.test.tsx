import { MetricCard } from '../MetricCard';
import { renderWithProviders, screen } from '../../testing/renderWithProviders';

describe('MetricCard', () => {
  it('renders value and description', () => {
    renderWithProviders(
      <MetricCard
        title="Weekly orders"
        value="1,250"
        delta={4.5}
        description="QoS"
      />
    );

    expect(screen.getByText('Weekly orders')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('QoS')).toBeInTheDocument();
    expect(screen.getByText('+4.5%')).toBeInTheDocument();
  });
});
