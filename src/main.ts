import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setupI18n } from '@vben/locales';
import { initPreferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';
import '@vben/styles';
import 'virtual:uno.css';
import App from './App.vue';
import { router } from './router';
import { installBrowserErrors } from './shared/browser-errors';
import { handleError } from './services/error';
import './styles.css';
import { resources } from './modules/system/schema';
import { watch } from 'vue';
import { session } from './services/auth';
import { setupAuthentication } from './services/api-auth';
import { canVisit } from './services/access';

async function bootstrap() {
  await initPreferences({
    namespace: 'test6',
    overrides: {
      app: {
        name: 'test6',
        defaultHomePath: '/',
        enablePreferences: false,
        enableCheckUpdates: false,
      },
      copyright: { enable: false },
      logo: { enable: false },
      widget: { lockScreen: false, notification: false, globalSearch: false },
      shortcutKeys: { globalLockScreen: false, globalLogout: false },
    },
  });
  const app = createApp(App);
  const dispose = installBrowserErrors(app, handleError);
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  app.use(createPinia());
  await setupI18n(app);
  setupAuthentication();
  const menus = [
    { name: '基础演示', path: '/', icon: 'lucide:house' },
    ...resources.map((r) => ({ name: r.title, path: '/system/' + r.key, icon: 'lucide:table' })),
    { name: '组件演示', path: '/template/components', icon: 'lucide:component' },
    { name: '错误日志', path: '/error-log', icon: 'lucide:bug' },
    { name: '关于项目', path: '/about', icon: 'lucide:info' },
  ];
  watch(
    session,
    (current) => {
      useAccessStore().setAccessMenus(menus.filter((menu) => canVisit(current, menu.path)));
    },
    { immediate: true },
  );
  app.use(router);
  app.mount('#app');
}
void bootstrap().catch(handleError);
