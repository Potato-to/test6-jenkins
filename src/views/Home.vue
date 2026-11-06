<script setup lang="ts">
import { ref } from 'vue';
import { AppError } from '../shared/errors';
import { request } from '../services/request';
import { handleError } from '../services/error';
import { UiButton } from '../ui';

function runtimeError() {
  throw new Error('演示 Vue 事件错误');
}
const handledMessage = ref('');
function missingApi() {
  return request.get('/__scaffold_missing_api__.json', { headers: { Accept: 'application/json' } });
}
async function apiError() {
  await missingApi();
}
async function handledApiError() {
  try {
    await missingApi();
  } catch {
    handledMessage.value = '请求失败已由当前页面处理，不弹全局消息';
  }
}
</script>
<template>
  <main class="m-6 rounded-xl bg-white p-8 shadow-sm">
    <h1 class="mb-3 text-2xl font-bold">test6</h1>
    <p class="mb-6 text-slate-600">Vben · Ant Design Vue · UnoCSS</p>
    <p class="mb-4">已迁移用户、角色、菜单、权限、字典和列表模板，可从左侧菜单进入。</p>
    <div class="flex flex-wrap gap-3">
      <UiButton @click="apiError">API 异常（全局提示）</UiButton>
      <UiButton @click="handledApiError">API 异常（自行处理）</UiButton>
      <p>{{ handledMessage }}</p>
      <UiButton @click="handleError(new AppError('network'))">网络异常</UiButton>
      <UiButton @click="handleError(new AppError('http', undefined, { status: 500 }))"
        >服务器异常</UiButton
      >
      <UiButton @click="runtimeError">运行错误</UiButton>
      <UiButton @click="handleError(new AppError('unknown'))">未知错误兜底</UiButton>
    </div>
  </main>
</template>
