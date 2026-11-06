// Only an internal absolute path is a valid post-login destination.
function invalidCharacters(value: string): boolean {
  return [...value].some((character) => character === '\\' || character.charCodeAt(0) <= 32);
}
export function safeRedirect(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    invalidCharacters(value)
  )
    return '/';
  try {
    const url = new URL(value, 'https://local.invalid');
    if (url.origin !== 'https://local.invalid' || url.pathname.replace(/\/+$/, '') === '/login')
      return '/';
    const decoded = decodeURIComponent(url.pathname);
    if (
      decoded.startsWith('//') ||
      invalidCharacters(decoded) ||
      decoded.replace(/\/+$/, '') === '/login'
    )
      return '/';
    return value;
  } catch {
    return '/';
  }
}
export function authNavigation(
  to: { path: string; fullPath: string; query: Record<string, unknown> },
  authenticated: boolean,
) {
  if (to.path === '/login') return authenticated ? safeRedirect(to.query.redirect) : true;
  return authenticated ? true : { path: '/login', query: { redirect: to.fullPath }, replace: true };
}
