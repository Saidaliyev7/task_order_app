import type { NavRoute, RemoteDefinition } from './types';
import remoteBlueprints from './remotes.config';

const env = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key] !== undefined) {
    return import.meta.env[key] as string;
  }
  if (typeof process !== 'undefined' && process.env?.[key] !== undefined) {
    const value = process.env[key];
    return typeof value === 'string' ? value : fallback;
  }
  return fallback;
};

export const remoteDefinitions: RemoteDefinition[] = remoteBlueprints.map((blueprint) => ({
  name: blueprint.name,
  displayName: blueprint.displayName,
  routePath: blueprint.routePath,
  module: blueprint.module,
  description: blueprint.description,
  entry: env(blueprint.envKey, `http://localhost:${blueprint.defaultDevPort}/remoteEntry.js`)
}));

export const navRoutes: NavRoute[] = [
  { path: '/', label: 'Restoran paneli', icon: 'dashboard', exact: true },
  ...remoteBlueprints.map((blueprint) => ({
    path: blueprint.routePath.replace('/*', ''),
    label: blueprint.displayName,
    icon: blueprint.navIcon
  }))
];

export { type NavRoute, type RemoteDefinition } from './types';
