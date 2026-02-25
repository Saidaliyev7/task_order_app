import type { NavRoute, RemoteDefinition } from './types';

export type RemoteBlueprint = {
  name: RemoteDefinition['name'];
  displayName: RemoteDefinition['displayName'];
  routePath: RemoteDefinition['routePath'];
  module: RemoteDefinition['module'];
  description: RemoteDefinition['description'];
  envKey: string;
  defaultDevPort: number;
  navIcon: Exclude<NavRoute['icon'], undefined>;
};

export const remoteBlueprints: RemoteBlueprint[] = [
  {
    name: 'orders',
    displayName: 'Orders',
    routePath: '/orders/*',
    module: 'orders/Module',
    description: 'Sifarişləri daxil et, prioritetləndir və statuslarını izləyin',
    envKey: 'VITE_ORDERS_REMOTE_URL',
    defaultDevPort: 3201,
    navIcon: 'orders'
  },
  {
    name: 'inventory',
    displayName: 'Inventory',
    routePath: '/inventory/*',
    module: 'inventory/Module',
    description: 'Anbar səviyyələrini izləyin və ehtiyat planını yeniləyin',
    envKey: 'VITE_INVENTORY_REMOTE_URL',
    defaultDevPort: 3202,
    navIcon: 'inventory'
  },
  {
    name: 'meals',
    displayName: 'Meals',
    routePath: '/meals/*',
    module: 'meals/Module',
    description: 'Reseptləri və ingredient paylarını rahat idarə edin',
    envKey: 'VITE_MEALS_REMOTE_URL',
    defaultDevPort: 3203,
    navIcon: 'meals'
  }
];

export default remoteBlueprints;
