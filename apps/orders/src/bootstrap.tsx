import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@shared/ui';
import RemoteOrders from './RemoteOrders';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <RemoteOrders />
    </AppProviders>
  </React.StrictMode>
);
