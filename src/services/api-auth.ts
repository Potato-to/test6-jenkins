import { loginApi, doLogout, getUserInfo } from '../api/sys/user';
import { configureAuth, type AuthAdapter } from './auth';
import { setToken } from './token';
import { AppError } from '../shared/errors';

export const apiAuth: AuthAdapter = {
  restore: () => null,
  async login(credentials) {
    const result = await loginApi(credentials);
    if (!result.accessToken) throw new AppError('business', '登录响应缺少 accessToken');
    setToken(result.accessToken);
    try {
      const info = await getUserInfo();
      return {
        username: info.username,
        isRoot: info.isRoot,
        permissions: info.authorityList.map((item) => item.authorityKey),
        menus: info.menuList,
      };
    } catch (error) {
      setToken('');
      throw error;
    }
  },
  async logout() {
    try {
      await doLogout();
    } finally {
      setToken('');
    }
  },
};
export function setupAuthentication() {
  if (!import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'false') configureAuth(apiAuth);
}
