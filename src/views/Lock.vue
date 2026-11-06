<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { UiButton, UiPassword } from '../ui';
import { login, session, logout } from '../services/auth';
const password = ref('');
const loading = ref(false);
const router = useRouter();
async function unlock() {
  if (loading.value || !session.value) return;
  loading.value = true;
  try {
    await login({ username: session.value.username, password: password.value });
    password.value = '';
    await router.replace('/');
  } finally {
    loading.value = false;
  }
}
async function signOut() {
  try {
    await logout();
  } finally {
    await router.replace('/login');
  }
}
</script>
<template>
  <main class="page-card flex flex-col gap-4">
    <h1 class="text-2xl">屏幕已锁定</h1>
    <p>当前用户：{{ session?.username }}。演示模式输入任意非空密码，真实接口模式会重新验证账号。</p>
    <UiPassword v-model="password" :disabled="loading" @keyup.enter="unlock" /><UiButton
      :disabled="loading"
      @click="unlock"
      >解锁</UiButton
    ><UiButton :disabled="loading" @click="signOut">退出账号</UiButton>
  </main>
</template>
