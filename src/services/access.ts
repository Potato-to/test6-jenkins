import type { Session } from './auth';
export interface MenuEntry {
  menuRoute: string;
  disabled?: boolean;
  children?: MenuEntry[];
}
export function canVisit(session: Session | null, path: string): boolean {
  if (!session) return false;
  if (
    session.isRoot ||
    !session.menus ||
    path === '/' ||
    path === '/403' ||
    path === '/lock' ||
    path === '/redirect'
  )
    return true;
  const target = path === '/system/dictionary-item' ? '/system/dictionary' : path;
  const visit = (items: MenuEntry[]): boolean =>
    items.some(
      (item) =>
        !item.disabled && (item.menuRoute === target || (item.children && visit(item.children))),
    );
  return visit(session.menus);
}
export function hasPermission(session: Session | null, permission: string): boolean {
  return Boolean(
    session && (session.isRoot || !session.permissions || session.permissions.includes(permission)),
  );
}
