import { ref } from 'vue';
import { AppError } from '../shared/errors';

export interface Credentials {
  username: string;
  password: string;
}
export interface Session {
  username: string;
  isRoot?: boolean;
  permissions?: string[];
  menus?: { menuRoute: string; disabled?: boolean; children?: Session['menus'] }[];
}
export interface AuthAdapter {
  restore(): Session | null;
  login(credentials: Credentials): Promise<Session>;
  logout(): void | Promise<void>;
}
const storageKey = 'test6:demo-session';
// 仅用于演示页面流程，不是安全认证；真实项目替换整个适配器。
const demoAdapter: AuthAdapter = {
  restore() {
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
      if (
        stored &&
        typeof stored === 'object' &&
        'username' in stored &&
        typeof stored.username === 'string' &&
        stored.username.trim()
      ) {
        return { username: stored.username };
      }
    } catch {
      /* 不可用或损坏的存储视为未登录 */
    }
    return null;
  },
  async login({ username, password }) {
    if (!username.trim() || !password.trim()) throw new AppError('business', '请输入用户名和密码');
    const result = { username: username.trim() };
    sessionStorage.setItem(storageKey, JSON.stringify(result));
    return result;
  },
  logout() {
    sessionStorage.removeItem(storageKey);
  },
};
let adapter: AuthAdapter = demoAdapter;
export const session = ref<Session | null>(null);
export const locked = ref(false);
export function lockSession() {
  if (session.value) locked.value = true;
}

export function configureAuth(next: AuthAdapter) {
  adapter = next;
  session.value = adapter.restore();
}
configureAuth(demoAdapter);

export async function login(credentials: Credentials) {
  const result = await adapter.login(credentials);
  acceptSession(result);
}
export function acceptSession(result: Session) {
  if (!result.username?.trim()) throw new AppError('business', '登录失败，请检查登录适配器');
  session.value = result;
  locked.value = false;
}
export async function logout() {
  try {
    await adapter.logout();
  } finally {
    session.value = null;
    locked.value = false;
  }
}
