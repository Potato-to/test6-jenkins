<script setup lang="ts">
import { useRouter } from 'vue-router';
import { BasicLayout } from '@vben/layouts';
import { UiButton } from './ui';
import { logout, session, lockSession } from './services/auth';
const router = useRouter();
async function lock() {
  lockSession();
  await router.push('/lock');
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
  <BasicLayout>
    <template #user-dropdown>
      <div class="flex items-center gap-3 px-4">
        <span class="text-sm">{{ session?.username }}</span>
        <UiButton @click="lock">锁屏</UiButton>
        <UiButton @click="signOut">退出登录</UiButton>
      </div>
    </template>
  </BasicLayout>
</template>
