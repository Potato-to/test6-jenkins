import { createRouter, createWebHistory } from 'vue-router';
import { handleError } from './services/error';
import { session, locked } from './services/auth';
import { authNavigation } from './auth-navigation';
import Layout from './Layout.vue';
import { resources } from './modules/system/schema';
import { canVisit } from './services/access';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('./views/Login.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: 'iframe',
          component: () => import('./views/ExternalFrame.vue'),
          meta: { title: '外部页面' },
        },
        {
          path: 'redirect',
          component: () => import('./views/Redirect.vue'),
          meta: { title: '跳转' },
        },
        ...resources.map((resource) => ({
          path: 'system/' + resource.key,
          name: 'System-' + resource.key,
          component: () => import('./views/SystemResource.vue'),
          meta: { title: resource.title, resource: resource.key },
        })),
        { path: 'lock', component: () => import('./views/Lock.vue'), meta: { title: '锁屏' } },
        {
          path: '403',
          component: () => import('./views/Forbidden.vue'),
          meta: { title: '暂无权限' },
        },
        {
          path: 'template/components',
          component: () => import('./views/ComponentExamples.vue'),
          meta: { title: '组件演示' },
        },
        {
          path: 'error-log',
          component: () => import('./views/ErrorLog.vue'),
          meta: { title: '错误日志' },
        },
        {
          path: 'about',
          component: () => import('./views/About.vue'),
          meta: { title: '关于项目' },
        },
        {
          path: '',
          name: 'Home',
          component: () => import('./views/Home.vue'),
          meta: { title: '基础演示', affixTab: true },
        },
        {
          path: ':pathMatch(.*)*',
          name: 'NotFound',
          component: () => import('./views/NotFound.vue'),
          meta: { title: '页面不存在' },
        },
      ],
    },
  ],
});
router.beforeEach((to) => {
  const result = authNavigation(to, Boolean(session.value));
  if (result !== true || to.path === '/login') return result;
  if (locked.value && to.path !== '/lock') return '/lock';
  return canVisit(session.value, to.path) ? true : '/403';
});
router.onError((error) => {
  handleError(error);
});
