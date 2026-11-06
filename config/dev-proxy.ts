import { loadEnv, type ProxyOptions } from 'vite';

// Only used by the development server. DEV_ variables are not exposed to browser code.
export function createDevProxy(mode: string): Record<string, ProxyOptions> {
  const env = loadEnv(mode, process.cwd(), 'DEV_');
  return env.DEV_API_UPSTREAM
    ? {
        '^/api(?:/|\\?|$)': {
          target: env.DEV_API_UPSTREAM,
          changeOrigin: true,
        },
      }
    : {};
}
