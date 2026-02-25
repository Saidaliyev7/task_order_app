import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen } from '@shared/ui';
import MealsApp from '../App';

const mealBuilderTestId = 'meal-builder-route';

vi.mock('../routes/MealBuilder', () => ({
  default: () => <div data-testid={mealBuilderTestId}>Meal builder route mock</div>
}));

const renderMealsApp = () =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/']}>
      <MealsApp />
    </MemoryRouter>
  );

describe('MealsApp', () => {
  it('renders intro copy', () => {
    renderMealsApp();
    expect(
      screen.getByText(/Yeni yeməklər yarat, hər biri üçün ingredient tələblərini təyin et/i)
    ).toBeInTheDocument();
  });

  it('mounts the meal builder route component', () => {
    renderMealsApp();
    expect(screen.getByTestId(mealBuilderTestId)).toBeInTheDocument();
  });
});
