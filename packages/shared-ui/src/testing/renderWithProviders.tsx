import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProviders } from '../providers/AppProviders';

const ProvidersWrapper = ({ children }: { children: ReactNode }) => (
  <AppProviders>{children}</AppProviders>
);

export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'queries'>) =>
  render(ui, { wrapper: ProvidersWrapper, ...options });

export * from '@testing-library/react';
