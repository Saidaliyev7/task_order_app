import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@shared/ui';
import RemoteMeals from './RemoteMeals';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <RemoteMeals />
    </AppProviders>
  </React.StrictMode>
);
