declare const moduleMap: {
  './Module': () => Promise<typeof import('./remote-entry')>;
};
type ModuleKey = keyof typeof moduleMap;
declare global {
  var __federation_shared__: Record<string, unknown>;
}
export declare function init(shareScope?: Record<string, unknown>): void;
export declare function get(module: ModuleKey): Promise<() => typeof import('./remote-entry')>;
export {};
