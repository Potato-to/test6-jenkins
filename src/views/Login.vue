<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UiButton, UiInput, UiPassword } from '../ui';
import { login } from '../services/auth';
import { safeRedirect } from '../auth-navigation';
import AccountFlow from './AccountFlow.vue';
import type { AccountFlow as Flow } from '../services/account-flows';
const flow = ref<Flow>();
async function afterAuthentication() {
  await router.replace(safeRedirect(route.query.redirect));
}

const apiMode = !import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'false';
const route = useRoute();
const router = useRouter();
const username = ref('');
const password = ref('');
const submitting = ref(false);

async function submit() {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await login({ username: username.value, password: password.value });
    password.value = '';
    await router.replace(safeRedirect(route.query.redirect));
  } finally {
    submitting.value = false;
  }
}
</script>
<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
    <section
      class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
      aria-labelledby="login-title"
    >
      <p class="mb-3 text-sm font-medium text-blue-600">test6</p>
      <h1 id="login-title" class="mb-3 text-3xl font-bold text-slate-900">欢迎登录</h1>
      <p class="mb-8 text-sm leading-6 text-slate-500">
        {{ apiMode ? '请使用后端账号登录。' : '演示登录：填写任意非空用户名和密码。' }}
      </p>
      <AccountFlow
        v-if="flow"
        :key="flow"
        :flow="flow"
        @back="flow = undefined"
        @authenticated="afterAuthentication"
      />
      <form v-else class="space-y-5" @submit.prevent="submit">
        <div>
          <label for="username" class="mb-2 block text-sm text-slate-700">用户名</label>
          <UiInput
            id="username"
            v-model="username"
            autocomplete="username"
            placeholder="请输入用户名"
            :disabled="submitting"
          />
        </div>
        <div>
          <label for="password" class="mb-2 block text-sm text-slate-700">密码</label>
          <UiPassword
            id="password"
            v-model="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            :disabled="submitting"
            @keyup.enter="submit"
          />
        </div>
        <UiButton class="w-full" :disabled="submitting" :loading="submitting" @click="submit"
          >登录</UiButton
        >
      </form>
      <div v-if="!flow" class="mt-4 flex flex-wrap gap-2">
        <UiButton @click="flow = 'register'">注册</UiButton
        ><UiButton @click="flow = 'reset'">找回密码</UiButton
        ><UiButton @click="flow = 'mobile'">短信登录</UiButton
        ><UiButton @click="flow = 'qr'">扫码登录</UiButton>
      </div>
    </section>
  </main>
</template>
