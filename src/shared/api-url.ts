// Business routes omit a deployment-specific prefix. Uploads use their own client.
export function businessBaseURL(origin = '', prefix = '/api'): string {
  const path = prefix.replace(/^\/+|\/+$/g, '');
  return origin.replace(/\/+$/, '') + (path ? '/' + path : '');
}
