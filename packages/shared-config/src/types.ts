export type RemoteDefinition = {
  name: 'orders' | 'inventory' | 'meals';
  displayName: string;
  routePath: string;
  entry: string;
  module: string;
  description: string;
};

export type NavRoute = {
  path: string;
  label: string;
  icon: 'dashboard' | 'orders' | 'inventory' | 'meals';
  exact?: boolean;
};
