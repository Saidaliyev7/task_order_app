import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@shared/ui';
import RemoteInventory from './RemoteInventory';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <RemoteInventory />
    </AppProviders>
  </React.StrictMode>
);
